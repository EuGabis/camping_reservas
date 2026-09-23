import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservaSchema } from "@/lib/validacao";
import { acomodacaoPorId, diferencaNoites } from "@/lib/precos";
import {
  consultarDisponibilidade,
  lancarReserva,
  dataParaFacility,
  type IntegranteFacility,
} from "@/lib/facility";
import { categoriaDoSite, escolherTarifa, valorTotalTarifa } from "@/lib/facility-map";
import { gerarCodigo, permitido, formatarCPF, formatarTelefone } from "@/lib/util";
import { encaminharReservaCRM } from "@/lib/crm";

export const runtime = "nodejs";
export const maxDuration = 25; // Facility + CRM (com retry)

function ip(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido"
  );
}

// Monta a lista de integrantes (todos além do responsável/cabeça da reserva).
function montarIntegrantes(adultos: number, criancas: number, bebes: number): IntegranteFacility[] {
  const lista: IntegranteFacility[] = [];
  for (let i = 1; i < adultos; i++) lista.push({ nomeCompleto: "Acompanhante", categoriaPessoa: "ADULTO" });
  for (let i = 0; i < criancas; i++) lista.push({ nomeCompleto: "Criança (6 a 12)", categoriaPessoa: "CRIANCA1" });
  for (let i = 0; i < bebes; i++) lista.push({ nomeCompleto: "Criança (até 5)", categoriaPessoa: "CRIANCA2" });
  return lista;
}

export async function POST(req: NextRequest) {
  const allowed = await permitido(`reserva:${ip(req)}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, erro: "Muitas tentativas. Aguarde um instante e tente novamente." },
      { status: 429 },
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }

  const parsed = reservaSchema.safeParse(corpo);
  if (!parsed.success) {
    const primeiro = parsed.error.issues[0];
    return NextResponse.json({ ok: false, erro: primeiro?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const d = parsed.data;

  // Honeypot: campo oculto preenchido = bot. Fingimos sucesso.
  if (d.site && d.site.length > 0) {
    return NextResponse.json({ ok: true, codigo: gerarCodigo() });
  }

  const acomodacao = acomodacaoPorId(d.acomodacaoId);
  if (!acomodacao) {
    return NextResponse.json({ ok: false, erro: "Acomodação inválida." }, { status: 400 });
  }

  const noites = diferencaNoites(d.checkin, d.checkout);
  const codigo = gerarCodigo();

  // 1) Consulta o Facility (fonte oficial de tarifa e disponibilidade).
  let valorTotalReais = 0;
  let tarifaId: number | null = null;
  let disponivel: number | null = null;
  try {
    const categorias = await consultarDisponibilidade({
      checkin: d.checkin,
      checkout: d.checkout,
      numeroAdultos: d.adultos,
      numeroCriancas1: d.criancas,
      numeroCriancas2: d.bebes,
    });
    const catId = categoriaDoSite(d.acomodacaoId, d.trailer);
    const categoria = categorias.find((c) => c.id === catId);
    if (categoria) {
      disponivel = categoria.disponibilidade;
      const tarifa = escolherTarifa(categoria, d.acomodacaoId, noites);
      if (tarifa) {
        tarifaId = tarifa.id;
        valorTotalReais = valorTotalTarifa(tarifa);
      }
    }
  } catch (e) {
    console.error("[Facility] consulta na reserva falhou:", e);
  }

  // Sem disponibilidade confirmada: barra o pedido.
  if (disponivel !== null && disponivel <= 0) {
    return NextResponse.json(
      { ok: false, erro: "Esta acomodação está esgotada para as datas escolhidas." },
      { status: 409 },
    );
  }

  const valorCentavos = Math.round(valorTotalReais * 100);

  // 2) Lança a reserva no Facility (pendente, sem pagamento) quando houver tarifa.
  let facilityOk = false;
  if (tarifaId !== null) {
    try {
      const r = await lancarReserva({
        identificador: codigo,
        inicio: dataParaFacility(d.checkin),
        fim: dataParaFacility(d.checkout),
        acomodacoes: [
          {
            valorTotal: valorTotalReais,
            valorDescontoTotal: 0,
            idtarifa: tarifaId,
            confirmada: false,
            responsavel: {
              nomeCompleto: d.nome,
              cpf: formatarCPF(d.cpf),
              telefone: formatarTelefone(d.telefone),
              email: d.email,
            },
            integrantes: montarIntegrantes(d.adultos, d.criancas, d.bebes),
            pagamentos: [],
          },
        ],
      });
      facilityOk = r.ok;
      if (!r.ok) console.error("[Facility] lancarReserva recusou:", r.status, r.mensagem);
    } catch (e) {
      console.error("[Facility] lancarReserva erro:", e);
    }
  }

  // 3) Encaminha ao CRM (funil de atendimento) — mantido em paralelo.
  const crm = await encaminharReservaCRM({
    nome: d.nome,
    email: d.email,
    telefone: d.telefone,
    modalidade: acomodacao.modalidade,
    acomodacaoNome: acomodacao.nome,
    checkin: d.checkin,
    checkout: d.checkout,
    adultos: d.adultos,
    criancas: d.criancas,
    bebes: d.bebes,
    trailer: d.trailer,
    observacoes: d.observacoes || null,
    valorEstimado: valorCentavos,
  });

  // 4) Grava também no banco local (best-effort).
  let salvouLocal = false;
  try {
    await prisma.reserva.create({
      data: {
        codigo,
        nome: d.nome,
        email: d.email,
        telefone: d.telefone,
        modalidade: acomodacao.modalidade,
        acomodacao: acomodacao.nome,
        checkin: new Date(d.checkin + "T00:00:00Z"),
        checkout: new Date(d.checkout + "T00:00:00Z"),
        noites,
        adultos: d.adultos,
        criancas: d.criancas,
        bebes: d.bebes,
        trailer: d.trailer,
        observacoes: d.observacoes || null,
        valorEstimado: valorCentavos,
      },
    });
    salvouLocal = true;
  } catch (e) {
    console.error("Reserva não salva no banco local (seguindo):", e);
  }

  // Só é erro se NENHUM destino registrou o pedido.
  if (!facilityOk && !crm.ok && !salvouLocal) {
    return NextResponse.json(
      { ok: false, erro: "Não foi possível registrar o pedido agora. Tente pelo WhatsApp." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, codigo, valorEstimado: valorCentavos, facility: facilityOk });
}

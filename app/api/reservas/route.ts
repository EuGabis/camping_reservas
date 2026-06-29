import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservaSchema } from "@/lib/validacao";
import { calcularEstimativa, acomodacaoPorId, diferencaNoites } from "@/lib/precos";
import { gerarCodigo, permitido } from "@/lib/util";
import { encaminharReservaCRM } from "@/lib/crm";

export const runtime = "nodejs";

function ip(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido"
  );
}

export async function POST(req: NextRequest) {
  // Limita a 5 pedidos por minuto por IP
  const allowed = await permitido(`reserva:${ip(req)}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, erro: "Muitas tentativas. Aguarde um instante e tente novamente." },
      { status: 429 }
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
    return NextResponse.json(
      { ok: false, erro: primeiro?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Honeypot: se o campo oculto veio preenchido, é bot. Fingimos sucesso.
  if (d.site && d.site.length > 0) {
    return NextResponse.json({ ok: true, codigo: gerarCodigo() });
  }

  const acomodacao = acomodacaoPorId(d.acomodacaoId);
  if (!acomodacao) {
    return NextResponse.json({ ok: false, erro: "Acomodação inválida." }, { status: 400 });
  }

  // Recalcula o valor NO SERVIDOR — nunca confiar no valor vindo do cliente.
  const estimativa = calcularEstimativa({
    acomodacaoId: d.acomodacaoId,
    checkin: d.checkin,
    checkout: d.checkout,
    adultos: d.adultos,
    criancas: d.criancas,
    bebes: d.bebes,
    trailer: d.trailer,
  });

  if (!estimativa.ok) {
    return NextResponse.json({ ok: false, erro: estimativa.erro }, { status: 400 });
  }

  // 1) Encaminha ao CRM — fonte primária da reserva.
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
    valorEstimado: estimativa.total,
  });

  // 2) Grava também no banco local (best-effort; legado do site, não bloqueia).
  const codigo = crm.codigo ?? gerarCodigo();
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
        noites: diferencaNoites(d.checkin, d.checkout),
        adultos: d.adultos,
        criancas: d.criancas,
        bebes: d.bebes,
        trailer: d.trailer,
        observacoes: d.observacoes || null,
        valorEstimado: estimativa.total,
      },
    });
    salvouLocal = true;
  } catch (e) {
    console.error("Reserva não salva no banco local (seguindo via CRM):", e);
  }

  // Só é erro se NENHUM destino registrou a reserva.
  if (!crm.ok && !salvouLocal) {
    return NextResponse.json(
      { ok: false, erro: "Não foi possível registrar o pedido agora. Tente pelo WhatsApp." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, codigo, valorEstimado: estimativa.total });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservaSchema } from "@/lib/validacao";
import { acomodacaoPorId, diferencaNoites } from "@/lib/precos";
import { gerarCodigo, permitido } from "@/lib/util";
import { enviarReservaCRM } from "@/lib/crm";

export const runtime = "nodejs";
export const maxDuration = 25;

function ip(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido"
  );
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

  // 1) Envia ao CRM, que lança no Facility e ingere no funil.
  const crm = await enviarReservaCRM({
    nome: d.nome,
    email: d.email,
    telefone: d.telefone,
    cpf: d.cpf,
    acomodacaoId: d.acomodacaoId,
    acomodacaoNome: acomodacao.nome,
    modalidade: acomodacao.modalidade,
    checkin: d.checkin,
    checkout: d.checkout,
    adultos: d.adultos,
    criancas: d.criancas,
    bebes: d.bebes,
    trailer: d.trailer,
    observacoes: d.observacoes || null,
  });

  if (crm.esgotado) {
    return NextResponse.json(
      { ok: false, erro: "Esta acomodação está esgotada para as datas escolhidas." },
      { status: 409 },
    );
  }

  const codigo = crm.codigo ?? gerarCodigo();
  const valorCentavos = crm.valorEstimado ?? 0;

  // 2) Grava também no banco local (best-effort; legado do site).
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
        valorEstimado: valorCentavos,
      },
    });
    salvouLocal = true;
  } catch (e) {
    console.error("Reserva não salva no banco local (seguindo):", e);
  }

  if (!crm.ok && !salvouLocal) {
    return NextResponse.json(
      { ok: false, erro: "Não foi possível registrar o pedido agora. Tente pelo WhatsApp." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, codigo, valorEstimado: valorCentavos, facility: crm.facility });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservaSchema } from "@/lib/validacao";
import { calcularEstimativa, acomodacaoPorId, diferencaNoites } from "@/lib/precos";
import { gerarCodigo, permitido } from "@/lib/util";

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

  try {
    const reserva = await prisma.reserva.create({
      data: {
        codigo: gerarCodigo(),
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

    return NextResponse.json({
      ok: true,
      codigo: reserva.codigo,
      valorEstimado: reserva.valorEstimado,
    });
  } catch (e) {
    console.error("Erro ao salvar reserva:", e);
    return NextResponse.json(
      { ok: false, erro: "Não foi possível registrar o pedido agora. Tente pelo WhatsApp." },
      { status: 500 }
    );
  }
}

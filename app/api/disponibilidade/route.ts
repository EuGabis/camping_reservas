import { NextRequest, NextResponse } from "next/server";
import { buscarDisponibilidadeCRM } from "@/lib/crm";
import { acomodacaoPorId } from "@/lib/precos";
import { permitido } from "@/lib/util";

export const runtime = "nodejs";
export const maxDuration = 20;

function ip(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido"
  );
}

const dataISO = /^\d{4}-\d{2}-\d{2}$/;

// Preço e disponibilidade para o formulário. O site apenas repassa ao CRM, que
// é quem fala com o Facility (o token nunca sai do CRM).
export async function POST(req: NextRequest) {
  const allowed = await permitido(`dispo:${ip(req)}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ ok: false, erro: "Muitas consultas. Aguarde um instante." }, { status: 429 });
  }

  let corpo: {
    acomodacaoId?: string;
    checkin?: string;
    checkout?: string;
    adultos?: number;
    criancas?: number;
    bebes?: number;
    trailer?: boolean;
  };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }

  const acomodacaoId = String(corpo.acomodacaoId ?? "");
  const checkin = String(corpo.checkin ?? "");
  const checkout = String(corpo.checkout ?? "");
  if (!acomodacaoPorId(acomodacaoId)) {
    return NextResponse.json({ ok: false, erro: "Acomodação inválida." }, { status: 400 });
  }
  if (!dataISO.test(checkin) || !dataISO.test(checkout) || new Date(checkout) <= new Date(checkin)) {
    return NextResponse.json({ ok: false, erro: "Datas inválidas." }, { status: 400 });
  }

  const r = await buscarDisponibilidadeCRM({
    acomodacaoId,
    checkin,
    checkout,
    adultos: Math.max(1, Math.min(20, Number(corpo.adultos) || 1)),
    criancas: Math.max(0, Math.min(20, Number(corpo.criancas) || 0)),
    bebes: Math.max(0, Math.min(20, Number(corpo.bebes) || 0)),
    trailer: corpo.trailer === true,
  });

  if (!r.ok && !r.esgotado) {
    return NextResponse.json(
      { ok: false, erro: r.erro ?? "Não foi possível consultar agora." },
      { status: 502 },
    );
  }
  return NextResponse.json(r);
}

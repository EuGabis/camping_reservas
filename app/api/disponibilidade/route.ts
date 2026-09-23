import { NextRequest, NextResponse } from "next/server";
import { consultarDisponibilidade } from "@/lib/facility";
import { categoriaDoSite, escolherTarifa, valorTotalTarifa } from "@/lib/facility-map";
import { diferencaNoites, acomodacaoPorId } from "@/lib/precos";
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

// Consulta preço e disponibilidade REAIS no Facility para uma acomodação e
// período. Usado pelo formulário de reserva para mostrar o valor ao vivo. O
// token do Facility fica só no servidor — nunca vai para o navegador.
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
  const adultos = Math.max(1, Math.min(20, Number(corpo.adultos) || 1));
  const criancas = Math.max(0, Math.min(20, Number(corpo.criancas) || 0));
  const bebes = Math.max(0, Math.min(20, Number(corpo.bebes) || 0));
  const trailer = corpo.trailer === true;

  if (!acomodacaoPorId(acomodacaoId)) {
    return NextResponse.json({ ok: false, erro: "Acomodação inválida." }, { status: 400 });
  }
  if (!dataISO.test(checkin) || !dataISO.test(checkout) || new Date(checkout) <= new Date(checkin)) {
    return NextResponse.json({ ok: false, erro: "Datas inválidas." }, { status: 400 });
  }

  const catId = categoriaDoSite(acomodacaoId, trailer);
  const noites = diferencaNoites(checkin, checkout);

  try {
    const categorias = await consultarDisponibilidade({
      checkin,
      checkout,
      numeroAdultos: adultos,
      numeroCriancas1: criancas,
      numeroCriancas2: bebes,
    });
    const categoria = categorias.find((c) => c.id === catId);
    if (!categoria) {
      return NextResponse.json({ ok: true, disponivel: 0, esgotado: true });
    }
    const tarifa = escolherTarifa(categoria, acomodacaoId, noites);
    if (!tarifa) {
      return NextResponse.json({
        ok: true,
        disponivel: categoria.disponibilidade,
        esgotado: categoria.disponibilidade <= 0,
        semTarifa: true,
      });
    }
    return NextResponse.json({
      ok: true,
      disponivel: categoria.disponibilidade,
      esgotado: categoria.disponibilidade <= 0,
      valorTotal: valorTotalTarifa(tarifa), // reais
      noites,
      tarifaNome: tarifa.nome,
    });
  } catch (e) {
    console.error("[Facility] disponibilidade:", e);
    return NextResponse.json(
      { ok: false, erro: "Não foi possível consultar agora. Tente novamente." },
      { status: 502 },
    );
  }
}

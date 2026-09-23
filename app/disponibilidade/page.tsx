import Link from "next/link";
import Image from "next/image";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import MotorReserva from "@/components/MotorReserva";
import { ACOMODACOES, centavosParaReais, diferencaNoites } from "@/lib/precos";
import { consultarDisponibilidade } from "@/lib/facility";
import { categoriaDoSite, escolherTarifa, valorTotalTarifa } from "@/lib/facility-map";
import {
  fotosCamping,
  fotosBarracas,
  fotosPousada,
  fotosGaleria,
  type Foto,
} from "@/lib/fotos";

export const dynamic = "force-dynamic";

const FOTO_POR_ACOMODACAO: Record<string, Foto[]> = {
  "camping-area": fotosCamping,
  "barraca-estruturada": fotosBarracas,
  "suite-vista": fotosPousada.suite,
  "quarto-vista": fotosPousada.quartoVista,
  "quarto-corredor": fotosPousada.quartoCorredor,
};

function capa(id: string): Foto {
  const arr = FOTO_POR_ACOMODACAO[id];
  return (arr && arr[0]) || fotosGaleria[0];
}

function inteiro(v: string | string[] | undefined, padrao: number): number {
  const n = parseInt(String(Array.isArray(v) ? v[0] : v ?? ""), 10);
  return Number.isFinite(n) ? n : padrao;
}

export default async function DisponibilidadePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const checkin = String(sp.checkin ?? "");
  const checkout = String(sp.checkout ?? "");
  const adultos = Math.max(1, inteiro(sp.adultos, 2));
  const criancas = Math.max(0, inteiro(sp.criancas, 0));
  const bebes = Math.max(0, inteiro(sp.bebes, 0));

  const valido = Boolean(checkin && checkout && checkout > checkin);
  const noites = valido ? diferencaNoites(checkin, checkout) : 0;

  // Disponibilidade e preços REAIS do Facility (uma consulta traz todas as
  // categorias). Em falha, mostramos um aviso em vez de derrubar a página.
  type Resultado = {
    a: (typeof ACOMODACOES)[number];
    ok: boolean;
    totalCentavos: number;
    disponivel: number;
  };
  let resultados: Resultado[] = [];
  let erroFacility = false;
  if (valido) {
    try {
      const cats = await consultarDisponibilidade({
        checkin,
        checkout,
        numeroAdultos: adultos,
        numeroCriancas1: criancas,
        numeroCriancas2: bebes,
      });
      resultados = ACOMODACOES.map((a) => {
        const catId = categoriaDoSite(a.id, false);
        const categoria = cats.find((c) => c.id === catId);
        if (!categoria || categoria.disponibilidade <= 0) {
          return { a, ok: false, totalCentavos: 0, disponivel: categoria?.disponibilidade ?? 0 };
        }
        const tarifa = escolherTarifa(categoria, a.id, noites);
        if (!tarifa) {
          return { a, ok: false, totalCentavos: 0, disponivel: categoria.disponibilidade };
        }
        return {
          a,
          ok: true,
          totalCentavos: Math.round(valorTotalTarifa(tarifa) * 100),
          disponivel: categoria.disponibilidade,
        };
      });
    } catch (e) {
      console.error("[Facility] disponibilidade page:", e);
      erroFacility = true;
    }
  }
  const queryReserva = new URLSearchParams({
    checkin,
    checkout,
    adultos: String(adultos),
    criancas: String(criancas),
    bebes: String(bebes),
  }).toString();

  function rotuloData(iso: string) {
    if (!iso) return "—";
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }

  return (
    <>
      <Cabecalho />
      <BotaoWhatsapp />

      <main className="min-h-dvh w-full bg-areia-50 pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6">
            <Link href="/" className="text-sm text-mata-600 hover:underline">
              ← Voltar ao site
            </Link>
            <h1 className="mt-2 text-2xl text-mata-900 sm:text-3xl">
              Disponibilidade e valores
            </h1>
            {valido && (
              <p className="mt-1 text-sm text-tinta-suave">
                {rotuloData(checkin)} → {rotuloData(checkout)} · {noites} noite(s) ·{" "}
                {adultos} adulto(s)
                {criancas ? ` · ${criancas} criança(s)` : ""}
                {bebes ? ` · ${bebes} bebê(s)` : ""}
              </p>
            )}
          </div>

          {/* Barra para refazer a busca, já preenchida */}
          <MotorReserva inicial={{ checkin, checkout, adultos, criancas, bebes }} />

          {!valido ? (
            <p className="mt-8 rounded-2xl border border-areia-200 bg-white p-6 text-center text-tinta-suave">
              Escolha as datas de entrada e saída acima e clique em{" "}
              <strong>Consultar valores</strong>.
            </p>
          ) : erroFacility ? (
            <p className="mt-8 rounded-2xl border border-areia-200 bg-white p-6 text-center text-tinta-suave">
              Não foi possível consultar a disponibilidade agora. Tente novamente em instantes
              ou fale com a gente pelo WhatsApp.
            </p>
          ) : (
            <div className="mt-8 grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map(({ a, ok, totalCentavos, disponivel }) => {
                const foto = capa(a.id);
                return (
                  <article
                    key={a.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-areia-200 bg-white shadow-sm"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="font-display text-lg text-mata-800">{a.nome}</h2>
                      <p className="mt-1 text-xs text-tinta-suave">{a.descricao}</p>

                      <div className="mt-4 flex-1" />

                      {ok ? (
                        <>
                          <p className="text-xs text-tinta-suave">
                            {noites} noite(s) · {adultos} adulto(s)
                            {disponivel > 0 && disponivel <= 3
                              ? ` · últimas ${disponivel} unidade(s)`
                              : ""}
                          </p>
                          <p className="font-display text-2xl font-semibold text-mata-700">
                            {centavosParaReais(totalCentavos)}
                          </p>
                          <Link
                            href={`/reservar/${a.id}?${queryReserva}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 block rounded-full bg-terra-500 px-5 py-2.5 text-center text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-terra-600"
                          >
                            Reservar
                          </Link>
                        </>
                      ) : (
                        <>
                          <p className="rounded-lg bg-areia-100 px-3 py-2 text-xs text-tinta-suave">
                            {disponivel <= 0
                              ? "Esgotado para estas datas."
                              : "Sem tarifa para este período."}
                          </p>
                          <Link
                            href={`/reservar/${a.id}?${queryReserva}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 block rounded-full border border-areia-300 px-5 py-2.5 text-center text-sm font-semibold text-mata-700 hover:bg-areia-100"
                          >
                            Ver acomodação
                          </Link>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Rodape />
    </>
  );
}

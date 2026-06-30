import Link from "next/link";
import Image from "next/image";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import MotorReserva from "@/components/MotorReserva";
import {
  ACOMODACOES,
  calcularEstimativa,
  centavosParaReais,
} from "@/lib/precos";
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

  const resultados = valido
    ? ACOMODACOES.map((a) => ({
        a,
        est: calcularEstimativa({
          acomodacaoId: a.id,
          checkin,
          checkout,
          adultos,
          criancas,
          bebes,
          trailer: false,
        }),
      }))
    : [];

  const noites = resultados[0]?.est.noites ?? 0;
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
          ) : (
            <div className="mt-8 grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map(({ a, est }) => {
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

                      {est.ok ? (
                        <>
                          <p className="text-xs text-tinta-suave">
                            {noites} noite(s) · {adultos} adulto(s)
                          </p>
                          <p className="font-display text-2xl font-semibold text-mata-700">
                            {centavosParaReais(est.total)}
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
                            {est.erro}
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

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Carrossel from "@/components/Carrossel";
import FormularioReserva from "@/components/FormularioReserva";
import Rodape from "@/components/Rodape";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import { acomodacaoPorId, centavosParaReais } from "@/lib/precos";
import { LOGO } from "@/lib/conteudo";
import {
  fotosCamping,
  fotosBarracas,
  fotosPousada,
  fotosGaleria,
  type Foto,
} from "@/lib/fotos";

// Fotos específicas de cada acomodação (tema visual próprio).
const FOTOS_POR_ACOMODACAO: Record<string, Foto[]> = {
  "camping-area": fotosCamping,
  "barraca-estruturada": fotosBarracas,
  "suite-vista": fotosPousada.suite,
  "quarto-vista": fotosPousada.quartoVista,
  "quarto-corredor": fotosPousada.quartoCorredor,
};

// Gera as 5 páginas estaticamente.
export function generateStaticParams() {
  return Object.keys(FOTOS_POR_ACOMODACAO).map((acomodacao) => ({ acomodacao }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ acomodacao: string }>;
}) {
  const { acomodacao } = await params;
  const dados = acomodacaoPorId(acomodacao);
  return {
    title: dados
      ? `Reservar ${dados.nome} · Vapo Camping EcoPark`
      : "Reservar · Vapo Camping EcoPark",
  };
}

function inteiro(v: string | string[] | undefined): number | undefined {
  const n = parseInt(String(Array.isArray(v) ? v[0] : v ?? ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ReservarAcomodacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ acomodacao: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { acomodacao } = await params;
  const dados = acomodacaoPorId(acomodacao);
  if (!dados) notFound();

  // Datas/hóspedes vindos do motor de reserva (pré-preenchem o formulário).
  const sp = await searchParams;
  const dadosIniciais = {
    checkin: sp.checkin ? String(sp.checkin) : undefined,
    checkout: sp.checkout ? String(sp.checkout) : undefined,
    adultos: inteiro(sp.adultos),
    criancas: inteiro(sp.criancas),
    bebes: inteiro(sp.bebes),
  };

  const fotosAcom = FOTOS_POR_ACOMODACAO[acomodacao] ?? [];
  const fotos = (fotosAcom.length ? fotosAcom : fotosGaleria).slice(0, 8);

  return (
    <>
      <BotaoWhatsapp />

      {/* Barra superior simples desta página de reserva */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-areia-50">
            <Image src={LOGO} alt="Vapo Camping EcoPark" width={40} height={40} priority className="h-10 w-10 rounded-full ring-1 ring-black/5" />
            <span className="hidden sm:inline">Vapo Camping</span>
          </Link>
          <Link href="/" className="rounded-full border border-areia-50/50 px-4 py-2 text-sm font-medium text-areia-50 backdrop-blur transition hover:bg-areia-50/10">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      {/* Hero temado da acomodação */}
      <section className="relative flex min-h-[58vh] items-end overflow-hidden">
        <Carrossel slides={fotos} />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-mata-900/50 via-mata-900/30 to-mata-900/90" />
        <div className="relative z-20 mx-auto w-full max-w-6xl px-5 pb-10 text-areia-50 sm:pb-14">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-areia-200">
            Reserva · Vapo Camping EcoPark
          </p>
          <h1 className="font-display text-3xl leading-tight sm:text-5xl">{dados.nome}</h1>
          <p className="mt-2 max-w-xl text-areia-100 sm:text-lg">{dados.descricao}</p>
          <p className="mt-4 font-display text-xl font-semibold text-terra-400">
            A partir de {centavosParaReais(dados.adultoSemana)}{" "}
            <span className="text-sm font-normal text-areia-200">/ pessoa · noite</span>
          </p>
        </div>
      </section>

      {/* Corpo: detalhes + formulário (pré-selecionado e travado) */}
      <main className="bg-areia-50">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0 lg:sticky lg:top-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">
              Faça seu pedido
            </p>
            <h2 className="text-2xl text-mata-800 sm:text-3xl">
              {dados.nome} <span className="sublinhado-mao">em um minuto</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-tinta-suave sm:text-lg">
              Escolha as datas e quantas pessoas vão. O site calcula uma estimativa na
              hora e a gente confirma a disponibilidade pelo WhatsApp — sem compromisso.
            </p>
            <ul className="mt-6 space-y-3 text-tinta">
              {[
                `${dados.capacidade}`,
                "50% na reserva (via PIX), restante no check-in",
                "Crianças de 6 a 12 anos pagam meia · até 5 anos cortesia",
                "Resposta rápida pelo WhatsApp",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mata-600 text-xs text-white">✓</span>
                  <span className="text-sm sm:text-base">{t}</span>
                </li>
              ))}
            </ul>

            {fotos.length > 1 && (
              <div className="mt-8 grid grid-cols-3 gap-2">
                {fotos.slice(0, 3).map((f) => (
                  <div key={f.src} className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-areia-200">
                    <Image src={f.src} alt={f.alt} fill sizes="200px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormularioReserva
            acomodacaoInicial={dados.id}
            fixarAcomodacao
            dadosIniciais={dadosIniciais}
          />
        </div>
      </main>

      <Rodape />
    </>
  );
}

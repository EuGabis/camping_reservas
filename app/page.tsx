import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import BotaoWhatsapp from "@/components/BotaoWhatsapp";
import FormularioReserva from "@/components/FormularioReserva";
import Carrossel from "@/components/Carrossel";
import Galeria from "@/components/Galeria";
import { ACOMODACOES, ModalidadeId, centavosParaReais } from "@/lib/precos";
import { SOBRE, COMODIDADES, REGRAS, HORARIOS, CONTATO } from "@/lib/conteudo";
import {
  fotosHero,
  fotosParque,
  fotosCamping,
  fotosBarracas,
  fotosPousada,
  fotosGaleria,
} from "@/lib/fotos";

function aPartirDe(modalidade: ModalidadeId): string {
  const valores = ACOMODACOES.filter((a) => a.modalidade === modalidade).map((a) => a.adultoSemana);
  return centavosParaReais(Math.min(...valores));
}

const pousadaTodas = [
  ...fotosPousada.suite,
  ...fotosPousada.quartoVista,
  ...fotosPousada.quartoCorredor,
  ...fotosPousada.geral,
];

const MODALIDADES_BLOCO = [
  {
    id: "camping" as ModalidadeId,
    titulo: "Camping",
    texto:
      "Traga sua barraca e escolha entre as 5 áreas espalhadas pela mata, com pontos de energia 220v, cozinha comunitária, lava-pratos e muito verde ao redor.",
    fotos: fotosCamping,
  },
  {
    id: "barracas" as ModalidadeId,
    titulo: "Hotel de Barracas",
    texto:
      "A tenda já montada e estruturada esperando por você — a experiência do camping, sem precisar carregar nem armar nada.",
    fotos: fotosBarracas,
  },
  {
    id: "pousada" as ModalidadeId,
    titulo: "Pousada Casa Camping",
    texto:
      "Suítes e quartos com vista para o verde, para quem prefere o conforto de quatro paredes com a natureza logo ali fora.",
    fotos: pousadaTodas,
  },
];

export default function Home() {
  return (
    <>
      <Cabecalho />
      <BotaoWhatsapp />

      <main id="topo" className="w-full min-w-0">
        {/* ===== HERO ===== */}
        <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
          <Carrossel slides={fotosHero} />
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-mata-900/60 via-mata-900/35 to-mata-900/85" />
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-areia-50 sm:px-6">
            <p className="aparece mb-3 text-xs font-medium uppercase tracking-[0.2em] text-areia-200 sm:mb-4 sm:tracking-[0.25em]">
              São Roque · SP · a 60 km de São Paulo
            </p>
            <h1 className="aparece font-display text-3xl leading-tight sm:text-5xl lg:text-6xl">
              Durma debaixo das árvores,{" "}
              <span className="italic text-terra-400">acorde no meio da mata.</span>
            </h1>
            <p className="aparece mx-auto mt-4 max-w-xl text-base text-areia-100 sm:mt-5 sm:text-lg">
              Um refúgio de 10 hectares com lagos, trilha e cascata — feito por
              campistas, para quem gosta de natureza de verdade.
            </p>
            <div className="aparece mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
              <a href="#reservar" className="w-full rounded-full bg-terra-500 px-8 py-3.5 text-center font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-terra-600 sm:w-auto">
                Fazer meu pedido de reserva
              </a>
              <a href="#hospedagem" className="w-full rounded-full border border-areia-100/60 px-8 py-3.5 text-center font-semibold text-areia-50 backdrop-blur transition-colors hover:bg-areia-50/10 sm:w-auto">
                Ver as acomodações
              </a>
            </div>
          </div>
        </section>

        {/* ===== SOBRE ===== */}
        <section id="sobre" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">O parque</p>
              <h2 className="text-2xl text-mata-800 sm:text-3xl lg:text-4xl">{SOBRE.chamada}</h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-tinta-suave sm:text-lg">
                {SOBRE.paragrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-areia-200 pt-6 sm:gap-4">
                {[
                  ["10 ha", "de mata nativa"],
                  ["80+", "espécies de árvores"],
                  ["4 lagos", "pesca e contemplação"],
                ].map(([n, t]) => (
                  <div key={t}>
                    <dt className="font-display text-xl font-semibold text-mata-700 sm:text-2xl">{n}</dt>
                    <dd className="mt-0.5 text-xs leading-snug text-tinta-suave sm:text-sm">{t}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <Galeria fotos={fotosParque} modo="mosaico" colunas="grid-cols-2" />
          </div>
        </section>

        {/* ===== HOSPEDAGEM / MODALIDADES ===== */}
        <section id="hospedagem" className="bg-areia-100 py-16 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">Onde ficar</p>
              <h2 className="text-2xl text-mata-800 sm:text-3xl lg:text-4xl">Três jeitos de passar a noite na mata</h2>
              <p className="mt-4 text-base text-tinta-suave sm:text-lg">
                Da barraca embaixo das estrelas ao conforto de uma suíte com vista — escolha o seu.
              </p>
            </div>

            <div className="mt-12 space-y-14 lg:mt-16 lg:space-y-20">
              {MODALIDADES_BLOCO.map((m, idx) => (
                <div key={m.id} className="grid min-w-0 items-center gap-8 lg:grid-cols-12">
                  <div className={`min-w-0 lg:col-span-4 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                    <h3 className="font-display text-xl text-mata-800 sm:text-2xl lg:text-3xl">{m.titulo}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-tinta-suave sm:text-base">{m.texto}</p>
                    <p className="mt-4 font-display text-lg font-semibold text-terra-500">
                      A partir de {aPartirDe(m.id)}{" "}
                      <span className="text-sm font-normal text-tinta-suave">/ pessoa · noite</span>
                    </p>
                    <a href="#reservar" className="mt-4 inline-block rounded-full bg-mata-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mata-800">
                      Reservar {m.titulo}
                    </a>
                    <p className="mt-3 text-xs text-tinta-suave">
                      {m.fotos.length} fotos · toque para ampliar
                    </p>
                  </div>
                  <div className={`min-w-0 lg:col-span-8 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                    <Galeria fotos={m.fotos} modo="faixa" auto />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ESTRUTURA ===== */}
        <section id="estrutura" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">Estrutura</p>
            <h2 className="text-2xl text-mata-800 sm:text-3xl lg:text-4xl">Tudo o que você precisa, sem sair do verde</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {COMODIDADES.map((c) => (
              <div key={c.titulo} className="rounded-2xl border border-areia-200 bg-white p-4 sm:p-5">
                <h3 className="text-base font-semibold text-mata-700 sm:text-lg">{c.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{c.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== PREÇOS ===== */}
        <section id="precos" className="bg-mata-800 py-16 text-areia-50 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-400">Valores 2026</p>
              <h2 className="text-2xl text-areia-50 sm:text-3xl lg:text-4xl">Preços por pessoa, por noite</h2>
              <p className="mt-4 text-sm text-areia-200 sm:text-base">Crianças de 6 a 12 anos pagam meia · até 5 anos não pagam.</p>
            </div>

            {/* Tabela visível em telas md+ */}
            <div className="mt-12 hidden overflow-hidden rounded-xl2 ring-1 ring-mata-600 md:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-mata-900/60 text-sm uppercase tracking-wide text-areia-200">
                  <tr>
                    <th className="px-5 py-4">Acomodação</th>
                    <th className="px-5 py-4">Estadia 2+ noites</th>
                    <th className="px-5 py-4">Noite única / fim de semana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mata-700/70">
                  {ACOMODACOES.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-mata-700/40">
                      <td className="px-5 py-4">
                        <p className="font-medium text-areia-50">{a.nome}</p>
                        <p className="text-xs text-areia-300">{a.capacidade}</p>
                      </td>
                      <td className="px-5 py-4 font-display text-lg">{centavosParaReais(a.adultoSemana)}</td>
                      <td className="px-5 py-4 font-display text-lg">{centavosParaReais(a.adultoUmaNoite)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para mobile */}
            <div className="mt-8 space-y-3 md:hidden">
              {ACOMODACOES.map((a) => (
                <div key={a.id} className="rounded-xl bg-mata-700/50 px-4 py-4 ring-1 ring-mata-600">
                  <p className="font-semibold text-areia-50">{a.nome}</p>
                  <p className="mb-3 text-xs text-areia-300">{a.capacidade}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-mata-900/40 p-2.5">
                      <p className="text-xs text-areia-300">2+ noites</p>
                      <p className="font-display text-base font-semibold text-areia-50">{centavosParaReais(a.adultoSemana)}</p>
                    </div>
                    <div className="rounded-lg bg-mata-900/40 p-2.5">
                      <p className="text-xs text-areia-300">Noite única / fds</p>
                      <p className="font-display text-base font-semibold text-areia-50">{centavosParaReais(a.adultoUmaNoite)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-areia-300">
              Trailer/motorhome: +R$ 5,00 por pessoa/noite. Pagamento: 50% na reserva e o restante no check-in (PIX ou cartão).
            </p>
          </div>
        </section>

        {/* ===== GALERIA ===== */}
        <section id="galeria" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">Galeria</p>
            <h2 className="text-2xl text-mata-800 sm:text-3xl lg:text-4xl">Um passeio pelo Vapo Camping</h2>
            <p className="mt-4 text-base text-tinta-suave sm:text-lg">
              {fotosGaleria.length} momentos do parque. Toque em qualquer foto para ver em tela cheia.
            </p>
          </div>
          <div className="mt-10 sm:mt-12">
            <Galeria fotos={fotosGaleria} modo="mosaico" />
          </div>
        </section>

        {/* ===== RESERVAR ===== */}
        <section id="reservar" className="bg-areia-100 py-16 sm:py-24 lg:py-28">
          <div className="mx-auto grid min-w-0 max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0 lg:sticky lg:top-28">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">Reserve seu lugar</p>
              <h2 className="text-2xl text-mata-800 sm:text-3xl lg:text-4xl">
                Faça seu pedido em <span className="sublinhado-mao">um minuto</span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-tinta-suave sm:mt-5 sm:text-lg">
                Escolha a acomodação, as datas e quantas pessoas vão. O site calcula uma
                estimativa na hora e a gente confirma a disponibilidade pelo WhatsApp — sem compromisso.
              </p>
              <ul className="mt-5 space-y-3 text-tinta sm:mt-6">
                {[
                  "Resposta rápida pelo WhatsApp",
                  "50% na reserva, restante no check-in",
                  "Crianças até 5 anos não pagam",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mata-600 text-xs text-white">✓</span>
                    <span className="text-sm sm:text-base">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <FormularioReserva />
          </div>
        </section>

        {/* ===== REGRAS + HORÁRIOS ===== */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid min-w-0 gap-10 md:grid-cols-2 md:gap-12">
            <div className="min-w-0">
              <h2 className="text-xl text-mata-800 sm:text-2xl lg:text-3xl">Boa convivência</h2>
              <ul className="mt-5 space-y-3 sm:mt-6">
                {REGRAS.map((r) => (
                  <li key={r} className="flex gap-3 text-sm text-tinta-suave sm:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terra-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl text-mata-800 sm:text-2xl lg:text-3xl">Horários</h2>
              <dl className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                {[
                  ["Funcionamento", HORARIOS.funcionamento],
                  ["Check-in camping", HORARIOS.checkinCamping],
                  ["Check-in hospedagem", HORARIOS.checkinHospedagem],
                  ["Check-out", HORARIOS.checkout],
                ].map(([t, v]) => (
                  <div key={t} className="rounded-xl border border-areia-200 bg-white p-3.5 sm:p-4">
                    <dt className="text-sm font-semibold text-mata-700">{t}</dt>
                    <dd className="mt-1 text-sm text-tinta-suave sm:text-base">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ===== COMO CHEGAR ===== */}
        <section id="como-chegar" className="bg-areia-100 py-16 sm:py-24 lg:py-28">
          <div className="mx-auto grid min-w-0 max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
            <div className="min-w-0">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">Como chegar</p>
              <h2 className="text-2xl text-mata-800 sm:text-3xl lg:text-4xl">Pertinho da Estrada do Vinho</h2>
              <p className="mt-4 text-base leading-relaxed text-tinta-suave sm:mt-5 sm:text-lg">
                Estamos em São Roque, a cidade do vinho, a cerca de uma hora de São Paulo.
                Vizinhos da famosa Estrada do Vinho, com vinícolas, restaurantes e pesqueiros.
              </p>
              <address className="mt-5 not-italic text-sm text-tinta sm:mt-6 sm:text-base">
                <p className="font-medium">{CONTATO.endereco}</p>
                <p>{CONTATO.bairro}</p>
                <p>CEP {CONTATO.cep}</p>
              </address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTATO.endereco + ", " + CONTATO.bairro)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-full bg-mata-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-mata-800 sm:mt-6 sm:text-base"
              >
                Abrir no Google Maps
              </a>
            </div>
            <div className="overflow-hidden rounded-xl2 shadow-md ring-1 ring-areia-200">
              <iframe
                title="Mapa do Vapo Camping EcoPark"
                className="h-64 w-full border-0 sm:h-80 md:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(CONTATO.endereco + ", " + CONTATO.bairro)}&output=embed`}
              />
            </div>
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}

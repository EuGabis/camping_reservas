import { ACOMODACOES, centavosParaReais } from "@/lib/precos";
import { POUSADA } from "@/lib/conteudo";

const quartos = ACOMODACOES.filter((a) => a.modalidade === "pousada");

function Check() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mata-600/10 text-mata-700">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Traco() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terra-500/10 text-terra-600">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14" strokeLinecap="round" />
      </svg>
    </span>
  );
}

const CARD = "rounded-2xl border border-areia-200 bg-white p-6 sm:p-7";
const TITULO_CARD = "font-display text-lg text-mata-800 sm:text-xl";
const ROTULO = "text-xs font-semibold uppercase tracking-[0.12em] text-terra-500";

export default function DetalhesPousada() {
  return (
    <section id="pousada" className="bg-areia-50 py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-terra-500">A Pousada</p>
          <h2 className="text-2xl text-mata-800 sm:text-3xl lg:text-4xl">
            Pousada Casa Camping, nos detalhes
          </h2>
          <p className="mt-4 text-base text-tinta-suave sm:text-lg">{POUSADA.intro}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-3">
          {/* Quartos e valores */}
          <div className={CARD}>
            <h3 className={TITULO_CARD}>Quartos e valores</h3>
            <ul className="mt-5 space-y-4">
              {quartos.map((q) => (
                <li key={q.id} className="border-b border-areia-100 pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-tinta">{q.nome}</p>
                  <p className="mt-0.5 text-xs text-tinta-suave">{POUSADA.banheiro[q.id]}</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-areia-100 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-tinta-suave">2+ noites</p>
                      <p className="font-display text-base font-semibold text-mata-700">
                        {centavosParaReais(q.adultoSemana)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-areia-100 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-tinta-suave">1 noite</p>
                      <p className="font-display text-base font-semibold text-mata-700">
                        {centavosParaReais(q.adultoUmaNoite)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-tinta-suave">
              Valor por pessoa. Crianças de 6 a 12 anos pagam meia diária; até 5 anos, cortesia.
            </p>
          </div>

          {/* Ocupação e horários */}
          <div className={CARD}>
            <h3 className={TITULO_CARD}>Ocupação e horários</h3>
            <ul className="mt-5 space-y-2.5">
              {POUSADA.ocupacao.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-tinta-suave">
                  <Check />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2.5 border-t border-areia-100 pt-5">
              {POUSADA.horarios.map(([label, valor]) => (
                <div key={label}>
                  <dt className={ROTULO}>{label}</dt>
                  <dd className="mt-0.5 text-sm text-tinta">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Incluso / não incluso */}
          <div className={CARD}>
            <h3 className={TITULO_CARD}>O que está incluso</h3>
            <ul className="mt-5 space-y-2.5">
              {POUSADA.incluso.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-tinta-suave">
                  <Check />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-areia-100 pt-5 text-xs font-semibold uppercase tracking-[0.12em] text-tinta-suave">
              Não incluso
            </p>
            <ul className="mt-3 space-y-2.5">
              {POUSADA.naoIncluso.map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-tinta-suave">
                  <Traco />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-areia-100 pt-5">
              {POUSADA.observacoes.map((o) => (
                <p key={o} className="text-xs leading-relaxed text-tinta-suave">
                  {o}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="/reservar/suite-vista?escolher=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-mata-700 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-mata-800"
          >
            Reservar a Pousada
          </a>
        </div>
      </div>
    </section>
  );
}

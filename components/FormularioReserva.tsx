"use client";

import { useMemo, useState } from "react";
import {
  ACOMODACOES,
  MODALIDADES,
  ModalidadeId,
  calcularEstimativa,
  centavosParaReais,
} from "@/lib/precos";
import { CONTATO } from "@/lib/conteudo";

const hojeISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

interface Hospede {
  nome: string;
  nascimento: string; // YYYY-MM-DD
  responsavel: string; // preenchido quando é criança
}

interface Estado {
  modalidade: ModalidadeId;
  acomodacaoId: string;
  checkin: string;
  checkout: string;
  adultos: number;
  criancas: number;
  bebes: number;
  trailer: boolean;
  nome: string;
  email: string;
  telefone: string;
  observacoes: string;
  hospedes: Hospede[];
  site: string; // honeypot
}

// Idade em anos a partir de uma data ISO (YYYY-MM-DD). null se vazio/inválido.
function idadeAnos(nascimento: string): number | null {
  if (!nascimento) return null;
  const nasc = new Date(nascimento + "T00:00:00");
  if (Number.isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

// Nome "sem abreviação": ao menos 2 palavras, cada uma com 2+ letras.
function nomeCompletoValido(nome: string): boolean {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return partes.length >= 2 && partes.every((p) => p.replace(/[.]/g, "").length >= 2);
}

const inicial: Estado = {
  modalidade: "camping",
  acomodacaoId: "camping-area",
  checkin: "",
  checkout: "",
  adultos: 2,
  criancas: 0,
  bebes: 0,
  trailer: false,
  nome: "",
  email: "",
  telefone: "",
  observacoes: "",
  hospedes: [],
  site: "",
};

export default function FormularioReserva({
  acomodacaoInicial,
  fixarAcomodacao = false,
  escolherInicial = false,
  dadosIniciais,
}: {
  acomodacaoInicial?: string;
  fixarAcomodacao?: boolean;
  // Abre já destravado no seletor de acomodação (ex.: "Reservar Pousada" da home).
  escolherInicial?: boolean;
  dadosIniciais?: {
    checkin?: string;
    checkout?: string;
    adultos?: number;
    criancas?: number;
    bebes?: number;
  };
} = {}) {
  const base = ACOMODACOES.find((a) => a.id === acomodacaoInicial);
  const estadoInicial: Estado = {
    ...inicial,
    ...(base ? { acomodacaoId: base.id, modalidade: base.modalidade } : {}),
    ...(dadosIniciais?.checkin ? { checkin: dadosIniciais.checkin } : {}),
    ...(dadosIniciais?.checkout ? { checkout: dadosIniciais.checkout } : {}),
    ...(dadosIniciais?.adultos ? { adultos: dadosIniciais.adultos } : {}),
    ...(dadosIniciais?.criancas != null ? { criancas: dadosIniciais.criancas } : {}),
    ...(dadosIniciais?.bebes != null ? { bebes: dadosIniciais.bebes } : {}),
  };
  const [s, setS] = useState<Estado>(estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<{ codigo: string; valor: number } | null>(null);
  const [etapa, setEtapa] = useState<"pix" | "confirmacao">("pix");
  const [pixCopiado, setPixCopiado] = useState(false);
  // Na página de uma acomodação específica ela vem travada, mas o visitante pode
  // destravar e escolher outra sem precisar voltar.
  const [trocando, setTrocando] = useState(escolherInicial);
  const travado = fixarAcomodacao && !trocando;

  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(CONTATO.pix);
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2500);
    } catch {
      setPixCopiado(false);
    }
  }

  const acomodacoesDaModalidade = useMemo(
    () => ACOMODACOES.filter((a) => a.modalidade === s.modalidade),
    [s.modalidade]
  );

  const estimativa = useMemo(() => {
    if (!s.checkin || !s.checkout) return null;
    return calcularEstimativa({
      acomodacaoId: s.acomodacaoId,
      checkin: s.checkin,
      checkout: s.checkout,
      adultos: s.adultos,
      criancas: s.criancas,
      bebes: s.bebes,
      trailer: s.trailer,
    });
  }, [s]);

  function trocarModalidade(m: ModalidadeId) {
    const primeira = ACOMODACOES.find((a) => a.modalidade === m);
    setS((prev) => ({
      ...prev,
      modalidade: m,
      acomodacaoId: primeira?.id ?? prev.acomodacaoId,
      trailer: m === "camping" ? prev.trailer : false,
    }));
  }

  function atualizar<K extends keyof Estado>(campo: K, valor: Estado[K]) {
    setS((prev) => ({ ...prev, [campo]: valor }));
  }

  // Quantos hóspedes além do cabeça da reserva.
  const numHospedesExtras = Math.max(0, s.adultos + s.criancas + s.bebes - 1);

  function setHospede(i: number, campo: keyof Hospede, valor: string) {
    setS((prev) => {
      const arr = [...prev.hospedes];
      while (arr.length <= i) arr.push({ nome: "", nascimento: "", responsavel: "" });
      arr[i] = { ...arr[i], [campo]: valor };
      return { ...prev, hospedes: arr };
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!s.checkin || !s.checkout) {
      setErro("Escolha as datas de entrada e saída.");
      return;
    }
    if (estimativa && !estimativa.ok) {
      setErro(estimativa.erro ?? "Verifique os dados informados.");
      return;
    }

    // Valida hóspedes preenchidos (os demais são opcionais).
    const hospedesPreenchidos: Hospede[] = [];
    for (let i = 0; i < numHospedesExtras; i++) {
      const h = s.hospedes[i];
      if (!h || (!h.nome.trim() && !h.nascimento)) continue; // vazio: ignora
      if (h.nome.trim() && !nomeCompletoValido(h.nome)) {
        setErro(`Hóspede ${i + 2}: informe o nome completo, sem abreviação.`);
        return;
      }
      const idade = idadeAnos(h.nascimento);
      if (idade !== null && idade < 18 && h.nome.trim() && !h.responsavel.trim()) {
        setErro(`Hóspede ${i + 2} é menor de idade: informe o responsável.`);
        return;
      }
      hospedesPreenchidos.push(h);
    }

    setEnviando(true);
    try {
      const totalCliente = estimativa?.total ?? 0;
      const sinalCliente = Math.round(totalCliente / 2);
      const obsPagamento = `Pagamento: sinal 50% = ${centavosParaReais(
        sinalCliente
      )} via PIX (${CONTATO.pix}); restante no check-in.`;

      const blocoHospedes =
        hospedesPreenchidos.length > 0
          ? "Hóspedes:\n" +
            [`- ${s.nome} (cabeça da reserva)`]
              .concat(
                hospedesPreenchidos.map((h) => {
                  const nasc = h.nascimento ? ` — nasc. ${h.nascimento}` : "";
                  const resp = h.responsavel.trim()
                    ? ` — responsável: ${h.responsavel.trim()}`
                    : "";
                  return `- ${h.nome || "(sem nome)"}${nasc}${resp}`;
                })
              )
              .join("\n")
          : "";

      const observacoesComPagamento = [s.observacoes, blocoHospedes, obsPagamento]
        .filter((p) => p && p.trim())
        .join("\n\n");

      const resp = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: s.nome,
          email: s.email,
          telefone: s.telefone,
          acomodacaoId: s.acomodacaoId,
          checkin: s.checkin,
          checkout: s.checkout,
          adultos: s.adultos,
          criancas: s.criancas,
          bebes: s.bebes,
          trailer: s.trailer,
          observacoes: observacoesComPagamento,
          site: s.site,
        }),
      });
      const dados = await resp.json();
      if (!resp.ok || !dados.ok) {
        setErro(dados.erro ?? "Não foi possível enviar agora.");
        return;
      }
      setEtapa("pix");
      setPixCopiado(false);
      setSucesso({ codigo: dados.codigo, valor: dados.valorEstimado ?? estimativa?.total ?? 0 });
    } catch {
      setErro("Falha de conexão. Tente novamente ou fale pelo WhatsApp.");
    } finally {
      setEnviando(false);
    }
  }

  const acomodacaoNome =
    ACOMODACOES.find((a) => a.id === s.acomodacaoId)?.nome ?? "";

  if (sucesso) {
    const sinal = Math.round(sucesso.valor / 2);
    const restante = sucesso.valor - sinal;

    // Etapa 1: pagamento do sinal via PIX
    if (etapa === "pix") {
      return (
        <div className="rounded-xl bg-white p-6 text-center shadow-lg ring-1 ring-areia-200 sm:rounded-xl2 sm:p-8">
          <svg
            className="mx-auto text-mata-700"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="6" rx="1.5" />
            <path d="M14 15h6M14 18.5h4" />
          </svg>
          <h3 className="mt-3 text-xl text-mata-800 sm:text-2xl">Falta pouco! Pague o sinal</h3>
          <p className="mt-2 text-sm text-tinta-suave sm:text-base">
            Para garantir sua reserva, pague <strong className="text-mata-700">50% agora via PIX</strong>.
            O restante você paga no check-in.
          </p>

          <div className="mt-5 rounded-xl bg-mata-800 p-4 text-left text-areia-50">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-areia-200">Sinal agora (50%)</span>
              <span className="font-display text-2xl font-semibold">{centavosParaReais(sinal)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs text-areia-300">
              <span>Restante no check-in</span>
              <span>{centavosParaReais(restante)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs text-areia-300">
              <span>Total estimado</span>
              <span>{centavosParaReais(sucesso.valor)}</span>
            </div>
          </div>

          <div className="mt-4 text-left">
            <label className="mb-1 block text-sm font-medium text-tinta">Chave PIX (e-mail)</label>
            <div className="flex items-stretch gap-2">
              <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-lg border border-areia-300 bg-areia-50 px-3 py-2.5 text-sm text-tinta">
                {CONTATO.pix}
              </code>
              <button
                type="button"
                onClick={copiarPix}
                className="shrink-0 rounded-lg bg-mata-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mata-800"
              >
                {pixCopiado ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <button
            onClick={() => setEtapa("confirmacao")}
            className="mt-5 w-full rounded-full bg-terra-500 px-6 py-3.5 font-semibold text-white shadow transition-transform hover:scale-[1.01] hover:bg-terra-600"
          >
            Realizei o PIX — enviar comprovante e confirmar
          </button>
          <button
            onClick={() => {
              setSucesso(null);
              setS(estadoInicial);
            }}
            className="mt-4 block w-full text-sm text-tinta-suave underline"
          >
            Voltar
          </button>
        </div>
      );
    }

    // Etapa 2: pedido confirmado → enviar comprovante pelo WhatsApp
    const msg = encodeURIComponent(
      `Olá! Acabei de enviar um pedido de reserva pelo site.\n\n` +
        `*Código:* ${sucesso.codigo}\n` +
        `*Nome:* ${s.nome}\n` +
        `*Acomodação:* ${acomodacaoNome}\n` +
        `*Entrada:* ${s.checkin}  *Saída:* ${s.checkout}\n` +
        `*Pessoas:* ${s.adultos} adulto(s), ${s.criancas} criança(s), ${s.bebes} até 5 anos\n` +
        `*Valor estimado:* ${centavosParaReais(sucesso.valor)}\n` +
        `*Sinal (50%):* ${centavosParaReais(sinal)} via PIX\n` +
        (s.observacoes ? `*Observações:* ${s.observacoes}\n` : "") +
        `\nJá realizei o PIX do sinal e vou enviar o comprovante aqui. Podemos confirmar a disponibilidade?`
    );
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-lg ring-1 ring-areia-200 sm:rounded-xl2 sm:p-8">
        <svg
          className="mx-auto text-mata-700"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
        <h3 className="mt-3 text-xl text-mata-800 sm:text-2xl">Pedido recebido!</h3>
        <p className="mt-2 text-sm text-tinta-suave sm:text-base">
          Seu código é <strong className="text-mata-700">{sucesso.codigo}</strong>. Guarde-o.
          Agora envie o <strong className="text-mata-700">comprovante do PIX</strong> pelo WhatsApp
          para confirmarmos sua reserva:
        </p>
        <a
          href={`https://wa.me/${CONTATO.whatsapp}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full bg-[#25D366] px-7 py-3 font-semibold text-white shadow transition-transform hover:scale-105"
        >
          Enviar comprovante pelo WhatsApp
        </a>
        <button
          onClick={() => {
            setSucesso(null);
            setS(estadoInicial);
          }}
          className="mt-4 block w-full text-sm text-tinta-suave underline"
        >
          Fazer outro pedido
        </button>
      </div>
    );
  }

  const campo =
    "w-full rounded-lg border border-areia-300 bg-areia-50 px-3 py-2.5 text-tinta outline-none transition focus:border-mata-500 focus:ring-2 focus:ring-mata-400/40";
  const rotulo = "mb-1 block text-sm font-medium text-tinta";

  return (
    <form
      onSubmit={enviar}
      className="rounded-xl2 bg-white p-6 shadow-lg ring-1 ring-areia-200 sm:p-8"
    >
      {/* honeypot anti-spam: invisível para humanos */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Não preencha este campo
          <input
            tabIndex={-1}
            autoComplete="off"
            value={s.site}
            onChange={(e) => atualizar("site", e.target.value)}
          />
        </label>
      </div>

      {travado && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mata-700/10 px-3 py-2.5 text-sm text-mata-800">
          <span>
            Acomodação: <strong>{acomodacaoNome || "selecionada"}</strong>
          </span>
          <button
            type="button"
            onClick={() => setTrocando(true)}
            className="font-semibold text-terra-600 underline underline-offset-2 transition hover:text-terra-500"
          >
            Trocar
          </button>
        </div>
      )}

      {!travado && (
        <div className="mb-5 grid grid-cols-1 gap-2 xs:grid-cols-3 sm:grid-cols-3">
          {(Object.keys(MODALIDADES) as ModalidadeId[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => trocarModalidade(m)}
              className={`rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                s.modalidade === m
                  ? "bg-mata-700 text-white shadow"
                  : "bg-areia-100 text-tinta hover:bg-areia-200"
              }`}
            >
              {MODALIDADES[m].nome}
            </button>
          ))}
        </div>
      )}

      {!travado && acomodacoesDaModalidade.length > 1 && (
        <div className="mb-4">
          <label className={rotulo}>Acomodação</label>
          <select
            className={campo}
            value={s.acomodacaoId}
            onChange={(e) => atualizar("acomodacaoId", e.target.value)}
          >
            {acomodacoesDaModalidade.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className={rotulo}>Entrada</label>
          <input
            type="date"
            className={campo}
            min={hojeISO()}
            value={s.checkin}
            onChange={(e) => atualizar("checkin", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={rotulo}>Saída</label>
          <input
            type="date"
            className={campo}
            min={s.checkin || hojeISO()}
            value={s.checkout}
            onChange={(e) => atualizar("checkout", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={rotulo}>Adultos</label>
          <input
            type="number"
            min={1}
            max={20}
            className={campo}
            value={s.adultos}
            onChange={(e) => atualizar("adultos", Math.max(1, +e.target.value || 1))}
          />
        </div>
        <div>
          <label className={rotulo}>Crianças <span className="font-normal text-tinta-suave">6–12</span></label>
          <input
            type="number"
            min={0}
            max={20}
            className={campo}
            value={s.criancas}
            onChange={(e) => atualizar("criancas", Math.max(0, +e.target.value || 0))}
          />
        </div>
        <div>
          <label className={rotulo}>Até 5 anos</label>
          <input
            type="number"
            min={0}
            max={20}
            className={campo}
            value={s.bebes}
            onChange={(e) => atualizar("bebes", Math.max(0, +e.target.value || 0))}
          />
        </div>
      </div>

      {s.modalidade === "camping" && (
        <label className="mb-4 flex items-center gap-2 text-sm text-tinta">
          <input
            type="checkbox"
            checked={s.trailer}
            onChange={(e) => atualizar("trailer", e.target.checked)}
            className="h-4 w-4 rounded border-areia-300 text-mata-600"
          />
          Vou de trailer / motorhome (+R$ 5,00 por pessoa/noite)
        </label>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={rotulo}>Nome completo</label>
          <input
            className={campo}
            value={s.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div>
          <label className={rotulo}>Telefone / WhatsApp</label>
          <input
            className={campo}
            value={s.telefone}
            onChange={(e) => atualizar("telefone", e.target.value)}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={rotulo}>E-mail</label>
        <input
          type="email"
          className={campo}
          value={s.email}
          onChange={(e) => atualizar("email", e.target.value)}
          required
        />
      </div>

      {numHospedesExtras > 0 && (
        <div className="mb-5 rounded-xl border border-areia-200 bg-areia-50/60 p-4">
          <p className="text-sm font-semibold text-tinta">
            Demais hóspedes <span className="font-normal text-tinta-suave">(opcional)</span>
          </p>
          <p className="mt-0.5 mb-3 text-xs text-tinta-suave">
            Você é o cabeça da reserva (dados acima). Se puder, informe os outros hóspedes.
            Nome completo, sem abreviação. Para crianças, informe o responsável.
          </p>

          <div className="flex flex-col gap-4">
            {Array.from({ length: numHospedesExtras }).map((_, i) => {
              const h = s.hospedes[i] ?? { nome: "", nascimento: "", responsavel: "" };
              const idade = idadeAnos(h.nascimento);
              const ehCrianca = idade !== null && idade < 18;
              return (
                <div key={i} className="rounded-lg border border-areia-200 bg-white p-3">
                  <p className="mb-2 text-xs font-medium text-tinta-suave">
                    Hóspede {i + 2}
                    {idade !== null ? ` · ${idade} ano(s)` : ""}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={rotulo}>Nome completo</label>
                      <input
                        className={campo}
                        value={h.nome}
                        onChange={(e) => setHospede(i, "nome", e.target.value)}
                        placeholder="Nome e sobrenome"
                      />
                    </div>
                    <div>
                      <label className={rotulo}>Data de nascimento</label>
                      <input
                        type="date"
                        className={campo}
                        max={hojeISO()}
                        value={h.nascimento}
                        onChange={(e) => setHospede(i, "nascimento", e.target.value)}
                      />
                    </div>
                  </div>
                  {ehCrianca && (
                    <div className="mt-3">
                      <label className={rotulo}>
                        Responsável <span className="font-normal text-tinta-suave">(pai/mãe ou cabeça da reserva)</span>
                      </label>
                      <input
                        className={campo}
                        value={h.responsavel}
                        onChange={(e) => setHospede(i, "responsavel", e.target.value)}
                        placeholder="Nome do responsável"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className={rotulo}>Alguma observação? <span className="font-normal text-tinta-suave">(opcional)</span></label>
        <textarea
          className={`${campo} min-h-20 resize-y`}
          value={s.observacoes}
          onChange={(e) => atualizar("observacoes", e.target.value)}
          maxLength={800}
          placeholder="Ex.: vamos com um pet pequeno, chegada por volta das 15h…"
        />
      </div>

      {estimativa && estimativa.ok && (
        <div className="mb-5 rounded-xl bg-mata-800 p-4 text-areia-50">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-areia-200">Valor estimado</span>
            <span className="font-display text-2xl font-semibold">
              {centavosParaReais(estimativa.total)}
            </span>
          </div>
          <p className="mt-1 text-xs text-areia-300">
            {estimativa.noites} noite(s) · {estimativa.detalhes.join(" · ")}
          </p>
          <p className="mt-2 text-xs text-areia-300">
            Estimativa sujeita à confirmação de disponibilidade pela equipe.
          </p>
        </div>
      )}

      {estimativa && !estimativa.ok && (
        <p className="mb-4 rounded-lg bg-terra-500/10 px-3 py-2 text-sm text-terra-600">
          {estimativa.erro}
        </p>
      )}

      {erro && (
        <p className="mb-4 rounded-lg bg-terra-500/10 px-3 py-2 text-sm text-terra-600">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-terra-500 px-6 py-3.5 font-semibold text-white shadow transition-transform hover:scale-[1.01] hover:bg-terra-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar pedido de reserva"}
      </button>
      <p className="mt-3 text-center text-xs text-tinta-suave">
        Sem compromisso. A reserva só é confirmada após o pagamento de 50%.
      </p>
    </form>
  );
}

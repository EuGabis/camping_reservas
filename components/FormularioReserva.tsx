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
  site: string; // honeypot
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
  site: "",
};

export default function FormularioReserva() {
  const [s, setS] = useState<Estado>(inicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<{ codigo: string; valor: number } | null>(null);

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

    setEnviando(true);
    try {
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
          observacoes: s.observacoes,
          site: s.site,
        }),
      });
      const dados = await resp.json();
      if (!resp.ok || !dados.ok) {
        setErro(dados.erro ?? "Não foi possível enviar agora.");
        return;
      }
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
    const msg = encodeURIComponent(
      `Olá! Acabei de enviar um pedido de reserva pelo site.\n\n` +
        `*Código:* ${sucesso.codigo}\n` +
        `*Nome:* ${s.nome}\n` +
        `*Acomodação:* ${acomodacaoNome}\n` +
        `*Entrada:* ${s.checkin}  *Saída:* ${s.checkout}\n` +
        `*Pessoas:* ${s.adultos} adulto(s), ${s.criancas} criança(s), ${s.bebes} até 5 anos\n` +
        `*Valor estimado:* ${centavosParaReais(sucesso.valor)}\n` +
        (s.observacoes ? `*Observações:* ${s.observacoes}\n` : "") +
        `\nPodemos confirmar a disponibilidade?`
    );
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-lg ring-1 ring-areia-200 sm:rounded-xl2 sm:p-8">
        <p className="text-4xl" aria-hidden>🌲</p>
        <h3 className="mt-3 text-xl text-mata-800 sm:text-2xl">Pedido recebido!</h3>
        <p className="mt-2 text-sm text-tinta-suave sm:text-base">
          Seu código é <strong className="text-mata-700">{sucesso.codigo}</strong>. Guarde-o.
          Para confirmar a disponibilidade e o pagamento de 50%, fale com a gente:
        </p>
        <a
          href={`https://wa.me/${CONTATO.whatsapp}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full bg-[#25D366] px-7 py-3 font-semibold text-white shadow transition-transform hover:scale-105"
        >
          Confirmar pelo WhatsApp
        </a>
        <button
          onClick={() => {
            setSucesso(null);
            setS(inicial);
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

      {acomodacoesDaModalidade.length > 1 && (
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

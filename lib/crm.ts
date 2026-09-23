// Integração com o Vapo CRM: encaminha cada reserva recebida no site para o
// endpoint de ingestão do CRM, que deduplica o cliente e grava no Supabase.
//
// Configuração (variáveis de ambiente do site):
//   CRM_INGEST_URL   ex.: https://vapo-crm.vercel.app/api/reservas
//   INGEST_API_KEY   a MESMA chave configurada no CRM
//
// É best-effort: se a integração não estiver configurada ou o CRM falhar, o
// pedido do site não quebra — apenas registramos o erro no log.

import type { ModalidadeId } from "@/lib/precos";

const MODALIDADE_CRM: Record<ModalidadeId, string> = {
  camping: "CAMPING",
  barracas: "BARRACAS",
  pousada: "POUSADA",
};

export interface ReservaParaCRM {
  nome: string;
  email: string;
  telefone: string;
  modalidade: ModalidadeId;
  acomodacaoNome: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  adultos: number;
  criancas: number;
  bebes: number;
  trailer: boolean;
  observacoes?: string | null;
  valorEstimado: number; // centavos
}

export interface ResultadoCRM {
  ok: boolean;
  codigo?: string;
}

// ── Facility via CRM (o CRM é o dono do motor de reserva) ────────
//
// O site NÃO fala com o Facility direto: consulta preço/disponibilidade e lança
// a reserva através do CRM, que guarda o token e o mapeamento. Autenticação com
// a mesma INGEST_API_KEY; chamadas sempre do servidor do site.

const CRM_DISPONIBILIDADE_URL =
  process.env.CRM_DISPONIBILIDADE_URL ?? "https://vapo-crm.vercel.app/api/site/disponibilidade";
const CRM_RESERVA_URL =
  process.env.CRM_RESERVA_URL ?? "https://vapo-crm.vercel.app/api/site/reserva";

export interface DisponibilidadeResposta {
  ok: boolean;
  disponivel?: number;
  esgotado?: boolean;
  valorTotal?: number; // reais
  noites?: number;
  tarifaNome?: string;
  semTarifa?: boolean;
  erro?: string;
}

export async function buscarDisponibilidadeCRM(p: {
  acomodacaoId: string;
  checkin: string;
  checkout: string;
  adultos: number;
  criancas: number;
  bebes: number;
  trailer: boolean;
}): Promise<DisponibilidadeResposta> {
  const key = process.env.INGEST_API_KEY;
  if (!key) return { ok: false, erro: "integração não configurada" };
  try {
    const resp = await fetch(CRM_DISPONIBILIDADE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify(p),
      signal: AbortSignal.timeout(15000),
    });
    const j = (await resp.json().catch(() => ({}))) as DisponibilidadeResposta;
    if (!resp.ok && !("esgotado" in j)) {
      return { ok: false, erro: j.erro ?? `HTTP ${resp.status}` };
    }
    return j;
  } catch {
    return { ok: false, erro: "falha de conexão" };
  }
}

export interface ReservaViaCRM {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  acomodacaoId: string;
  acomodacaoNome: string;
  modalidade: ModalidadeId;
  checkin: string;
  checkout: string;
  adultos: number;
  criancas: number;
  bebes: number;
  trailer: boolean;
  observacoes?: string | null;
}

export interface ReservaViaCRMResposta {
  ok: boolean;
  codigo?: string;
  valorEstimado?: number; // centavos
  facility?: boolean;
  esgotado?: boolean;
  erro?: string;
}

export async function enviarReservaCRM(r: ReservaViaCRM): Promise<ReservaViaCRMResposta> {
  const key = process.env.INGEST_API_KEY;
  if (!key) return { ok: false, erro: "integração não configurada" };
  const corpo = JSON.stringify({
    nome: r.nome,
    email: r.email,
    telefone: r.telefone,
    cpf: r.cpf,
    acomodacaoId: r.acomodacaoId,
    acomodacaoNome: r.acomodacaoNome,
    modalidade: MODALIDADE_CRM[r.modalidade] ?? r.modalidade.toUpperCase(),
    checkin: r.checkin,
    checkout: r.checkout,
    adultos: r.adultos,
    criancas: r.criancas,
    bebes: r.bebes,
    trailer: r.trailer,
    observacoes: r.observacoes ?? "",
  });
  // 2 tentativas: a 1ª "aquece" o CRM em cold start.
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    try {
      const resp = await fetch(CRM_RESERVA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: corpo,
        signal: AbortSignal.timeout(20000),
      });
      const j = (await resp.json().catch(() => ({}))) as ReservaViaCRMResposta;
      if (resp.status === 409 || j.esgotado) return { ok: false, esgotado: true };
      if (resp.ok) return j;
      if (resp.status >= 400 && resp.status < 500) {
        console.error(`[CRM] reserva rejeitada (${resp.status}): ${JSON.stringify(j)}`);
        return { ok: false, erro: j.erro ?? "dados inválidos" };
      }
      console.error(`[CRM] reserva tentativa ${tentativa} falhou (${resp.status})`);
    } catch (e) {
      console.error(`[CRM] reserva tentativa ${tentativa} erro:`, e);
    }
  }
  return { ok: false, erro: "falha ao registrar" };
}

export async function encaminharReservaCRM(r: ReservaParaCRM): Promise<ResultadoCRM> {
  const url = process.env.CRM_INGEST_URL;
  const key = process.env.INGEST_API_KEY;

  // Integração desligada: não configurada ainda.
  if (!url || !key) return { ok: false };

  const corpoJson = JSON.stringify({
    modalidade: MODALIDADE_CRM[r.modalidade] ?? r.modalidade.toUpperCase(),
    acomodacao: r.acomodacaoNome,
    checkin: r.checkin,
    checkout: r.checkout,
    adultos: r.adultos,
    criancas: r.criancas,
    bebes: r.bebes,
    trailer: r.trailer,
    observacoes: r.observacoes ?? "",
    valorEstimado: r.valorEstimado,
    nome: r.nome,
    email: r.email,
    telefone: r.telefone,
    consentimentoLgpd: true,
  });

  // 2 tentativas: a 1ª "aquece" o CRM em caso de cold start; a 2ª costuma passar.
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: corpoJson,
        signal: AbortSignal.timeout(7000),
      });

      const corpo = (await resp.json().catch(() => ({}))) as { codigo?: string };
      if (resp.ok) {
        return { ok: true, codigo: corpo.codigo };
      }
      // 4xx (ex.: validação) não adianta repetir.
      if (resp.status >= 400 && resp.status < 500) {
        console.error(`[CRM] ingestão rejeitada (${resp.status}): ${JSON.stringify(corpo)}`);
        return { ok: false };
      }
      console.error(`[CRM] tentativa ${tentativa} falhou (${resp.status})`);
    } catch (e) {
      console.error(`[CRM] tentativa ${tentativa} erro:`, e);
    }
  }
  return { ok: false };
}

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

export async function encaminharReservaCRM(r: ReservaParaCRM): Promise<ResultadoCRM> {
  const url = process.env.CRM_INGEST_URL;
  const key = process.env.INGEST_API_KEY;

  // Integração desligada: não configurada ainda.
  if (!url || !key) return { ok: false };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
      },
      body: JSON.stringify({
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
      }),
      // Não deixa pendurar a função serverless se o CRM demorar.
      signal: AbortSignal.timeout(8000),
    });

    const corpo = await resp.json().catch(() => ({}) as { codigo?: string });
    if (!resp.ok) {
      console.error(`[CRM] ingestão falhou (${resp.status}): ${JSON.stringify(corpo)}`);
      return { ok: false };
    }
    return { ok: true, codigo: (corpo as { codigo?: string }).codigo };
  } catch (e) {
    console.error("[CRM] erro ao encaminhar reserva:", e);
    return { ok: false };
  }
}

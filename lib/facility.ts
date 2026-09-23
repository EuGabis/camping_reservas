// Integração com o FacilityHotel — o motor de reserva e tarifário oficial do
// Vapo Camping. SERVER-ONLY: usa o token de integração, que nunca pode ir para o
// navegador. As chamadas são feitas com o módulo https nativo porque o endpoint
// de disponibilidade exige um GET com corpo JSON (o fetch não permite corpo em
// GET).
//
// Variáveis de ambiente:
//   FACILITY_URL    base, ex.: https://vapocampingecopark.facilityhotel.com.br/integracao/hotelDoForte
//   FACILITY_TOKEN  token de integração (secreto)

import https from "node:https";

const base = () => (process.env.FACILITY_URL ?? "").replace(/\/+$/, "");
const token = () => process.env.FACILITY_TOKEN ?? "";

export interface DataFacility {
  dia: number;
  mes: number;
  ano: number;
}

export interface TarifaFacility {
  id: number;
  nome: string;
  numeroAdultos: number;
  numeroAdicional: number;
  valorTotalReserva: number; // reais (não inclui crianças)
  valorCrianca1: number; // reais, total das crianças da categoria 1
  valorCrianca2: number; // reais, total das crianças da categoria 2
}

export interface CategoriaFacility {
  id: number;
  nome: string;
  disponibilidade: number;
  tarifas: TarifaFacility[];
}

function isoParaData(iso: string): DataFacility {
  const [ano, mes, dia] = iso.split("-").map((n) => parseInt(n, 10));
  return { dia, mes, ano };
}

// Requisição HTTPS crua (GET pode levar corpo). Server-only.
function requisitar(
  caminho: string,
  metodo: "GET" | "POST",
  corpo: unknown,
): Promise<{ status: number; texto: string }> {
  const raiz = base();
  const tk = token();
  if (!raiz || !tk) {
    return Promise.reject(new Error("FACILITY_URL/FACILITY_TOKEN ausentes no ambiente."));
  }
  const url = new URL(raiz + caminho);
  const payload = JSON.stringify(corpo ?? {});
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        port: url.port || 443,
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          token: tk,
        },
        timeout: 15000,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, texto: data }));
      },
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("timeout ao contatar o Facility")));
    req.write(payload);
    req.end();
  });
}

export interface ParamsDisponibilidade {
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  numeroAdultos: number;
  numeroCriancas1: number;
  numeroCriancas2: number;
}

// Consulta disponibilidade e tarifas de TODAS as categorias para o período.
export async function consultarDisponibilidade(
  p: ParamsDisponibilidade,
): Promise<CategoriaFacility[]> {
  const corpo = {
    inicio: isoParaData(p.checkin),
    fim: isoParaData(p.checkout),
    numeroAdultos: p.numeroAdultos,
    numeroCriancas1: p.numeroCriancas1,
    numeroCriancas2: p.numeroCriancas2,
  };
  const { status, texto } = await requisitar("/retornadisponibilidade", "GET", corpo);
  if (status !== 200) {
    throw new Error(`Facility disponibilidade HTTP ${status}: ${texto.slice(0, 200)}`);
  }
  const json = JSON.parse(texto) as { categorias?: CategoriaFacility[] };
  return Array.isArray(json.categorias) ? json.categorias : [];
}

// ── Lançamento de reserva ───────────────────────────────────────

export interface ResponsavelFacility {
  nomeCompleto: string;
  cpf: string;
  telefone?: string;
  email?: string;
}

export type CategoriaPessoa = "ADULTO" | "CRIANCA1" | "CRIANCA2";

export interface IntegranteFacility {
  nomeCompleto: string;
  categoriaPessoa: CategoriaPessoa;
}

export interface AcomodacaoReservaFacility {
  valorTotal: number;
  valorDescontoTotal?: number;
  idtarifa: number;
  confirmada?: boolean;
  responsavel: ResponsavelFacility;
  integrantes?: IntegranteFacility[];
  pagamentos?: unknown[];
}

export interface ReservaFacility {
  identificador: string;
  inicio: DataFacility;
  fim: DataFacility;
  acomodacoes: AcomodacaoReservaFacility[];
}

export interface ResultadoReservaFacility {
  ok: boolean;
  status: string;
  mensagem: string;
}

export async function lancarReserva(r: ReservaFacility): Promise<ResultadoReservaFacility> {
  const { status, texto } = await requisitar("/lancarReserva", "POST", r);
  let json: { status?: string; mensagem?: string } = {};
  try {
    json = JSON.parse(texto);
  } catch {
    // resposta não-JSON: mantemos o texto cru na mensagem
  }
  const httpOk = status >= 200 && status < 300;
  const apiOk = json.status ? String(json.status) === "200" : httpOk;
  return {
    ok: httpOk && apiOk,
    status: String(json.status ?? status),
    mensagem: String(json.mensagem ?? texto.slice(0, 200)),
  };
}

// Helper: monta {dia,mes,ano} a partir de uma data ISO (para o POST).
export function dataParaFacility(iso: string): DataFacility {
  return isoParaData(iso);
}

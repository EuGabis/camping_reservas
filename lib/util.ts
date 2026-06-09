// Gera um código curto e legível para a reserva, ex.: VP-7K3Q9
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem caracteres ambíguos

export function gerarCodigo(): string {
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  for (const b of bytes) s += ALFABETO[b % ALFABETO.length];
  return `VP-${s}`;
}

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Limitador de memória local (fallback para desenvolvimento / sem Redis configurado)
const janela = new Map<string, { contagem: number; reinicio: number }>();

// Instância do limitador distribuído Upstash (usado em produção na Vercel)
let upstashRatelimit: Ratelimit | null = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  upstashRatelimit = new Ratelimit({
    redis: new Redis({
      url: redisUrl,
      token: redisToken,
    }),
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 pedidos por minuto por IP
    analytics: false,
  });
}

export async function permitido(chave: string, max = 5, janelaMs = 60_000): Promise<boolean> {
  if (upstashRatelimit) {
    try {
      const { success } = await upstashRatelimit.limit(chave);
      return success;
    } catch (e) {
      console.error("Erro no Upstash Rate Limit, fazendo fallback para memória local", e);
    }
  }

  // Fallback: Rate limiter simples em memória
  const agora = Date.now();
  const reg = janela.get(chave);
  if (!reg || agora > reg.reinicio) {
    janela.set(chave, { contagem: 1, reinicio: agora + janelaMs });
    return true;
  }
  if (reg.contagem >= max) return false;
  reg.contagem += 1;
  return true;
}

export function formatarData(d: Date | string): string {
  const data = typeof d === "string" ? new Date(d) : d;
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

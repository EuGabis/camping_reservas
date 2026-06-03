// Gera um código curto e legível para a reserva, ex.: VP-7K3Q9
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem caracteres ambíguos

export function gerarCodigo(): string {
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  for (const b of bytes) s += ALFABETO[b % ALFABETO.length];
  return `VP-${s}`;
}

// Rate limiter simples em memória (por instância). Suficiente para conter
// abuso básico do formulário público. Para produção em escala, troque por
// um serviço dedicado (ex.: Upstash Ratelimit).
const janela = new Map<string, { contagem: number; reinicio: number }>();

export function permitido(chave: string, max = 5, janelaMs = 60_000): boolean {
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

// Conteúdo dinâmico gerenciado no Vapo CRM (área Site do painel): campanhas
// (pacotes e ofertas), foto principal do hero e fotos extras da galeria.
// Busca com cache de 5 minutos; em qualquer falha o site segue com o
// conteúdo padrão, sem quebrar nada.

const URL_CONTEUDO =
  process.env.CRM_CONTEUDO_URL ?? "https://vapo-crm.vercel.app/api/site/conteudo";

export interface CampanhaCRM {
  titulo: string;
  descricao: string | null;
  imagem_url: string | null;
  preco: string | null;
  inicio: string | null;
  fim: string | null;
}

export interface ConteudoCRM {
  hero: string | null;
  galeria: { url: string; titulo: string | null }[];
  campanhas: CampanhaCRM[];
}

const VAZIO: ConteudoCRM = { hero: null, galeria: [], campanhas: [] };

export async function buscarConteudoCRM(): Promise<ConteudoCRM> {
  try {
    const resp = await fetch(URL_CONTEUDO, { next: { revalidate: 300 } });
    if (!resp.ok) return VAZIO;
    const j = (await resp.json()) as Partial<ConteudoCRM>;
    return {
      hero: typeof j.hero === "string" && j.hero ? j.hero : null,
      galeria: Array.isArray(j.galeria) ? j.galeria.filter((g) => g && g.url) : [],
      campanhas: Array.isArray(j.campanhas) ? j.campanhas.filter((c) => c && c.titulo) : [],
    };
  } catch {
    return VAZIO;
  }
}

// Formata AAAA-MM-DD como DD/MM sem depender de fuso horário.
function dataCurta(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function periodoCampanha(c: CampanhaCRM): string | null {
  if (c.inicio && c.fim) return `${dataCurta(c.inicio)} a ${dataCurta(c.fim)}`;
  if (c.fim) return `até ${dataCurta(c.fim)}`;
  if (c.inicio) return `a partir de ${dataCurta(c.inicio)}`;
  return null;
}

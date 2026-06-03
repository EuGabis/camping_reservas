// Listas de fotos do parque. Caminhos vêm de lib/fotos-manifest.json,
// gerado no build por scripts/gerar-fotos.mjs (predev/prebuild) — assim
// nenhuma foto é empacotada na função serverless.

import manifesto from "./fotos-manifest.json";

export interface Foto {
  src: string;
  alt: string;
}

// Remove artes/posts (não são fotos): PNGs decorativos e cartazes de promoção.
const NAO_E_FOTO = /(\.png$)|corpus-christi/i;

function limpar(srcs: string[]): string[] {
  return srcs.filter((s) => !NAO_E_FOTO.test(s));
}

function comAlt(srcs: string[], base: string): Foto[] {
  return srcs.map((src, i) => ({ src, alt: `${base} — foto ${i + 1}` }));
}

const galeriaLimpa = limpar(manifesto.galeria);

// Galeria geral (fotos profissionais limpas do parque)
export const fotosGaleria = comAlt(galeriaLimpa, "Vapo Camping EcoPark");

// Hospedagem
export const fotosBarracas = comAlt(
  limpar(manifesto.barracas),
  "Hotel de Barracas do Vapo Camping EcoPark"
);

export const fotosPousada = {
  suite: comAlt(limpar(manifesto.pousada.suite), "Suíte com vista — Pousada Casa Camping"),
  quartoVista: comAlt(limpar(manifesto.pousada.quartoVista), "Quarto com vista — Pousada Casa Camping"),
  quartoCorredor: comAlt(limpar(manifesto.pousada.quartoCorredor), "Quarto corredor — Pousada Casa Camping"),
  geral: comAlt(limpar(manifesto.pousada.geral), "Sala e cozinha — Pousada Casa Camping"),
};

// helper: monta uma curadoria por nomes de arquivo (com fallback)
function curar(nomes: string[], fallback: string[], minimo = 3): string[] {
  const alvo = nomes.map((n) => `/fotos/galeria-geral/${n}`).filter((s) => galeriaLimpa.includes(s));
  return alvo.length >= minimo ? alvo : fallback;
}

// Banner (hero): aéreas e paisagens amplas
export const fotosHero: Foto[] = curar(
  [
    "dji_fly_20230422_113642_136_1682175380132_photo_optimized.jpg",
    "dji_fly_20230422_114406_146_1682175226872_photo_optimized.jpg",
    "VAPO-CAMPING-101.jpg",
    "VAPO-CAMPING-201.jpg",
    "VAPO-CAMPING-270.jpg",
    "VAPO-CAMPING-117.jpg",
  ],
  galeriaLimpa.slice(0, 6)
).map((src, i) => ({ src, alt: `Vista do Vapo Camping EcoPark — banner ${i + 1}` }));

// "O parque": 4 tomadas aéreas para uma abertura elegante (grid 2x2)
export const fotosParque: Foto[] = curar(
  ["n2.jpg", "n3.jpg", "19.jpg", "20.jpg"],
  galeriaLimpa.slice(0, 4),
  3
).map((src, i) => ({ src, alt: `Vista aérea do Vapo Camping EcoPark — foto ${i + 1}` }));

// Carrossel da modalidade Camping (tendas, áreas e drone)
export const fotosCamping: Foto[] = curar(
  [
    "Camping-2.jpeg",
    "Camping-6.jpeg",
    "Barracas-2.jpeg",
    "Barracas-3.jpeg",
    "04.jpg",
    "05.jpg",
    "07.jpg",
    "09.jpg",
    "11.jpg",
    "1-1.jpg",
    "19.jpg",
    "20.jpg",
    "n2.jpg",
    "n3.jpg",
  ],
  galeriaLimpa.slice(0, 12),
  4
).map((src, i) => ({ src, alt: `Camping no Vapo Camping EcoPark — foto ${i + 1}` }));

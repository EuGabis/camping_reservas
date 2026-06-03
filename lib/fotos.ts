// Listas de fotos do parque. Os caminhos vêm de lib/fotos-manifest.json,
// gerado em tempo de build pelo script scripts/gerar-fotos.mjs (predev/prebuild).
// Assim NENHUMA foto é empacotada na função serverless — elas ficam estáticas.

import manifesto from "./fotos-manifest.json";

export interface Foto {
  src: string;
  alt: string;
}

function comAlt(srcs: string[], base: string): Foto[] {
  return srcs.map((src, i) => ({ src, alt: `${base} — foto ${i + 1}` }));
}

export const fotosEstrutura = comAlt(
  manifesto.estrutura,
  "Áreas de camping e estrutura do Vapo Camping EcoPark"
);

export const fotosBarracas = comAlt(
  manifesto.barracas,
  "Hotel de Barracas do Vapo Camping EcoPark"
);

export const fotosGaleria = comAlt(manifesto.galeria, "Vapo Camping EcoPark");

export const fotosPousada = {
  suite: comAlt(manifesto.pousada.suite, "Suíte com vista — Pousada Casa Camping"),
  quartoVista: comAlt(manifesto.pousada.quartoVista, "Quarto com vista — Pousada Casa Camping"),
  quartoCorredor: comAlt(manifesto.pousada.quartoCorredor, "Quarto corredor — Pousada Casa Camping"),
  geral: comAlt(manifesto.pousada.geral, "Sala e cozinha — Pousada Casa Camping"),
};

// Slides do banner (hero): curadoria de fotos aéreas/paisagens; cai de volta
// nas primeiras da galeria caso a curadoria não exista.
const CURADORIA_HERO = [
  "dji_fly_20230422_113642_136_1682175380132_photo_optimized.jpg",
  "dji_fly_20230422_114406_146_1682175226872_photo_optimized.jpg",
  "VAPO-CAMPING-101.jpg",
  "VAPO-CAMPING-201.jpg",
  "VAPO-CAMPING-270.jpg",
  "VAPO-CAMPING-117.jpg",
].map((f) => `/fotos/galeria-geral/${f}`);

const heroExistentes = CURADORIA_HERO.filter((s) => manifesto.galeria.includes(s));

export const fotosHero: Foto[] = (
  heroExistentes.length >= 3 ? heroExistentes : manifesto.galeria.slice(0, 6)
).map((src, i) => ({ src, alt: `Vista do Vapo Camping EcoPark — banner ${i + 1}` }));

// Fotos cênicas para a seção "O parque"
export const fotosParque: Foto[] = fotosGaleria.slice(0, 6);

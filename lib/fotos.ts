// Lê automaticamente as fotos de /public/fotos (e subpastas).
// Qualquer imagem nova adicionada nessas pastas entra no site sozinha —
// nenhuma foto fica de fora. Roda no servidor (build), nunca no cliente.

import fs from "node:fs";
import path from "node:path";

export interface Foto {
  src: string;
  alt: string;
}

const RAIZ = path.join(process.cwd(), "public", "fotos");
const EXTENSOES = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
// arquivos que não são fotos do parque (logos, marcas)
const IGNORAR = /(^|\/)(logo|vapo-camping-ecopark)\b/i;

function listar(subpasta: string): string[] {
  const dir = path.join(RAIZ, subpasta);
  let arquivos: string[] = [];
  try {
    arquivos = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return arquivos
    .filter((f) => EXTENSOES.has(path.extname(f).toLowerCase()))
    .filter((f) => !IGNORAR.test(f))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map((f) => `/fotos/${subpasta ? subpasta + "/" : ""}${f}`.replace(/\\/g, "/"));
}

function comAlt(srcs: string[], base: string): Foto[] {
  return srcs.map((src, i) => ({ src, alt: `${base} — foto ${i + 1}` }));
}

// ---- Coleções por categoria ----
export const fotosEstrutura = comAlt(
  listar("estrutura"),
  "Áreas de camping e estrutura do Vapo Camping EcoPark"
);

export const fotosBarracas = comAlt(
  listar("hotel-de-barracas"),
  "Hotel de Barracas do Vapo Camping EcoPark"
);

export const fotosGaleria = comAlt(
  listar("galeria-geral"),
  "Vapo Camping EcoPark"
);

export const fotosPousada = {
  suite: comAlt(listar("pousada-casa-camping/suite"), "Suíte com vista — Pousada Casa Camping"),
  quartoVista: comAlt(listar("pousada-casa-camping/quarto-vista"), "Quarto com vista — Pousada Casa Camping"),
  quartoCorredor: comAlt(listar("pousada-casa-camping/quarto-corredor"), "Quarto corredor — Pousada Casa Camping"),
  geral: comAlt(listar("pousada-casa-camping/geral-sala-cozinha"), "Sala e cozinha — Pousada Casa Camping"),
};

// Slides do banner (hero): mistura aérea + paisagens. Cai de volta na galeria
// geral caso a curadoria não exista, garantindo que o hero nunca fique vazio.
const CURADORIA_HERO = [
  "dji_fly_20230422_113642_136_1682175380132_photo_optimized.jpg",
  "dji_fly_20230422_114406_146_1682175226872_photo_optimized.jpg",
  "VAPO-CAMPING-101.jpg",
  "VAPO-CAMPING-201.jpg",
  "VAPO-CAMPING-270.jpg",
  "VAPO-CAMPING-117.jpg",
].map((f) => `/fotos/galeria-geral/${f}`);

const heroExistentes = CURADORIA_HERO.filter((s) =>
  fotosGaleria.some((f) => f.src === s)
);

export const fotosHero: Foto[] = (
  heroExistentes.length >= 3
    ? heroExistentes
    : fotosGaleria.slice(0, 6).map((f) => f.src)
).map((src, i) => ({ src, alt: `Vista do Vapo Camping EcoPark — banner ${i + 1}` }));

// Algumas fotos cênicas para a seção "O parque"
export const fotosParque: Foto[] = fotosGaleria.slice(0, 6);

// Capa de cada modalidade (primeira foto disponível)
export const capas = {
  camping: fotosEstrutura[0]?.src ?? fotosGaleria[0]?.src ?? "",
  barracas: fotosBarracas[0]?.src ?? "",
  pousada: fotosPousada.suite[0]?.src ?? fotosPousada.geral[0]?.src ?? "",
};

// Gera lib/fotos-manifest.json a partir das pastas em public/fotos.
// Roda automaticamente antes de `dev` e `build` (scripts predev/prebuild).
// Isso evita ler o sistema de arquivos em runtime — o que faria o Next
// empacotar as fotos dentro da função serverless e estourar o limite.

import fs from "node:fs";
import path from "node:path";

const RAIZ = path.join(process.cwd(), "public", "fotos");
const EXTENSOES = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const IGNORAR = /^(logo|vapo-camping-ecopark)/i;

function listar(subpasta) {
  const dir = path.join(RAIZ, subpasta);
  let arquivos = [];
  try {
    arquivos = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return arquivos
    .filter((f) => EXTENSOES.has(path.extname(f).toLowerCase()))
    .filter((f) => !IGNORAR.test(f))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map((f) => `/fotos/${subpasta ? subpasta + "/" : ""}${f}`);
}

const manifesto = {
  estrutura: listar("estrutura"),
  barracas: listar("hotel-de-barracas"),
  galeria: listar("galeria-geral"),
  pousada: {
    suite: listar("pousada-casa-camping/suite"),
    quartoVista: listar("pousada-casa-camping/quarto-vista"),
    quartoCorredor: listar("pousada-casa-camping/quarto-corredor"),
    geral: listar("pousada-casa-camping/geral-sala-cozinha"),
  },
};

const destino = path.join(process.cwd(), "lib", "fotos-manifest.json");
fs.writeFileSync(destino, JSON.stringify(manifesto, null, 2) + "\n");

const totalPousada = Object.values(manifesto.pousada).reduce((s, a) => s + a.length, 0);
console.log(
  `✓ fotos-manifest.json: galeria=${manifesto.galeria.length}, estrutura=${manifesto.estrutura.length}, barracas=${manifesto.barracas.length}, pousada=${totalPousada}`
);

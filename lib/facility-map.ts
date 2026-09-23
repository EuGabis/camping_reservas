// Mapeia as acomodações do site para as categorias/tarifas do FacilityHotel.
//
// As categorias têm id estável (6 camping, 7 trailer, 8 casa compartilhada,
// 11 hotel de barracas). Dentro de uma categoria, várias tarifas são devolvidas
// (day use, cortesia, temporadas antigas etc.), então a tarifa correta é
// escolhida pelo NOME — mais robusto que o id, que o Facility troca por
// temporada. A equipe do Facility deve validar a tarifa escolhida no go-live.

import type { CategoriaFacility, TarifaFacility } from "@/lib/facility";

export const CATEGORIA_CAMPING = 6;
export const CATEGORIA_TRAILER = 7;
export const CATEGORIA_CASA = 8;
export const CATEGORIA_BARRACAS = 11;

interface MapaAcomodacao {
  categoriaId: number;
  // Para categorias com mais de uma acomodação (Casa Compartilhada), a tarifa
  // certa precisa conter esta palavra-chave no nome.
  chaveTarifa?: string;
}

const MAPA: Record<string, MapaAcomodacao> = {
  "camping-area": { categoriaId: CATEGORIA_CAMPING },
  "barraca-estruturada": { categoriaId: CATEGORIA_BARRACAS },
  "suite-vista": { categoriaId: CATEGORIA_CASA, chaveTarifa: "SUITE" },
  "quarto-vista": { categoriaId: CATEGORIA_CASA, chaveTarifa: "QUARTO VISTA" },
  "quarto-corredor": { categoriaId: CATEGORIA_CASA, chaveTarifa: "QUARTO CORREDOR" },
};

// Tarifas que nunca representam a diária padrão de pernoite.
const EXCLUIR = /(DAY\s*USE|CORTESIA|AIRBNB|ANTECIPAD)/i;
// Marcador de tarifa de uma única diária.
const UMA_DIARIA = /(1\s*DI[ÁA]RIA|UMA\s*DI[ÁA]RIA)/i;

// Categoria do Facility para uma acomodação do site. O trailer do camping usa a
// categoria própria (7).
export function categoriaDoSite(acomodacaoId: string, trailer: boolean): number | null {
  if (acomodacaoId === "camping-area" && trailer) return CATEGORIA_TRAILER;
  return MAPA[acomodacaoId]?.categoriaId ?? null;
}

// Escolhe a tarifa de pernoite dentro de uma categoria, conforme a acomodação e
// o número de noites (1 diária vs 2+). Devolve null se nenhuma servir.
export function escolherTarifa(
  categoria: CategoriaFacility,
  acomodacaoId: string,
  noites: number,
): TarifaFacility | null {
  const chave = MAPA[acomodacaoId]?.chaveTarifa;
  let candidatas = categoria.tarifas.filter(
    (t) => !EXCLUIR.test(t.nome) && t.valorTotalReserva > 0,
  );
  if (chave) {
    candidatas = candidatas.filter((t) => t.nome.toUpperCase().includes(chave));
  }
  const umaNoite = noites <= 1;
  const naFaixa = candidatas.filter((t) => UMA_DIARIA.test(t.nome) === umaNoite);
  const escolha = (naFaixa.length ? naFaixa : candidatas).sort(
    (a, b) => a.valorTotalReserva - b.valorTotalReserva,
  );
  return escolha[0] ?? null;
}

// Valor total (reais) de uma tarifa, incluindo crianças.
export function valorTotalTarifa(t: TarifaFacility): number {
  return t.valorTotalReserva + (t.valorCrianca1 || 0) + (t.valorCrianca2 || 0);
}

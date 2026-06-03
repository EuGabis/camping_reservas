// Tabela de preços e cálculo de estimativa.
// Valores em centavos para evitar erros de ponto flutuante.
// Base: tabela 2026 (jan–jun) do Vapo Camping EcoPark.
// O valor calculado é uma ESTIMATIVA — a confirmação final é feita pela equipe.

export type ModalidadeId = "camping" | "barracas" | "pousada";

export type AcomodacaoId =
  | "camping-area"
  | "barraca-estruturada"
  | "suite-vista"
  | "quarto-vista"
  | "quarto-corredor";

export interface Acomodacao {
  id: AcomodacaoId;
  modalidade: ModalidadeId;
  nome: string;
  descricao: string;
  capacidade: string;
  // preço por adulto, por noite (centavos)
  adultoSemana: number; // estadia com 2+ noites (ou noite de semana, no camping)
  adultoUmaNoite: number; // noite única / fim de semana
  minAdultos: number;
}

export const ACOMODACOES: Acomodacao[] = [
  {
    id: "camping-area",
    modalidade: "camping",
    nome: "Camping (área aberta)",
    descricao:
      "Sua barraca em meio à mata, com pontos de energia 220v, cozinha comunitária e lava-pratos.",
    capacidade: "Por pessoa",
    adultoSemana: 5400, // dias de semana
    adultoUmaNoite: 7400, // sábado / domingo / véspera de feriado
    minAdultos: 1,
  },
  {
    id: "barraca-estruturada",
    modalidade: "barracas",
    nome: "Hotel de Barracas",
    descricao:
      "Tenda já montada e estruturada, para quem quer a experiência do camping sem montar nada.",
    capacidade: "Mínimo 2 adultos",
    adultoSemana: 11000, // estadia mínima de 2 noites
    adultoUmaNoite: 16000, // 1 noite
    minAdultos: 2,
  },
  {
    id: "suite-vista",
    modalidade: "pousada",
    nome: "Suíte com vista",
    descricao: "Suíte com banheiro privativo e vista para a mata nativa.",
    capacidade: "Mínimo 2 adultos",
    adultoSemana: 13000,
    adultoUmaNoite: 19000,
    minAdultos: 2,
  },
  {
    id: "quarto-vista",
    modalidade: "pousada",
    nome: "Quarto com vista",
    descricao: "Quarto confortável com vista para o verde do parque.",
    capacidade: "Mínimo 2 adultos",
    adultoSemana: 10000,
    adultoUmaNoite: 14000,
    minAdultos: 2,
  },
  {
    id: "quarto-corredor",
    modalidade: "pousada",
    nome: "Quarto corredor",
    descricao: "Opção mais econômica da Pousada Casa Camping.",
    capacidade: "Mínimo 2 adultos",
    adultoSemana: 9000,
    adultoUmaNoite: 13000,
    minAdultos: 2,
  },
];

export const MODALIDADES: Record<
  ModalidadeId,
  { id: ModalidadeId; nome: string; resumo: string }
> = {
  camping: {
    id: "camping",
    nome: "Camping",
    resumo: "Traga sua barraca e durma embalado pelos sons da mata.",
  },
  barracas: {
    id: "barracas",
    nome: "Hotel de Barracas",
    resumo: "A tenda já montada, esperando por você.",
  },
  pousada: {
    id: "pousada",
    nome: "Pousada Casa Camping",
    resumo: "Quartos e suítes com a natureza logo ali fora.",
  },
};

export const TRAILER_POR_PESSOA_NOITE = 500; // +R$5,00/pessoa/noite

export function acomodacaoPorId(id: string): Acomodacao | undefined {
  return ACOMODACOES.find((a) => a.id === id);
}

export function centavosParaReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function ehFimDeSemana(data: Date): boolean {
  const dia = data.getUTCDay(); // 0 dom, 5 sex, 6 sáb
  return dia === 5 || dia === 6 || dia === 0;
}

export interface EntradaCalculo {
  acomodacaoId: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  adultos: number;
  criancas: number; // 6 a 12 anos -> meia
  bebes: number; // até 5 anos -> grátis
  trailer: boolean;
}

export interface ResultadoCalculo {
  ok: boolean;
  erro?: string;
  noites: number;
  total: number; // centavos
  detalhes: string[];
}

export function diferencaNoites(checkin: string, checkout: string): number {
  const inicio = new Date(checkin + "T00:00:00Z");
  const fim = new Date(checkout + "T00:00:00Z");
  const ms = fim.getTime() - inicio.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function calcularEstimativa(entrada: EntradaCalculo): ResultadoCalculo {
  const acomodacao = acomodacaoPorId(entrada.acomodacaoId);
  const detalhes: string[] = [];

  if (!acomodacao) {
    return { ok: false, erro: "Acomodação inválida.", noites: 0, total: 0, detalhes };
  }

  const noites = diferencaNoites(entrada.checkin, entrada.checkout);
  if (!Number.isFinite(noites) || noites < 1) {
    return {
      ok: false,
      erro: "A data de saída precisa ser depois da data de entrada.",
      noites: 0,
      total: 0,
      detalhes,
    };
  }

  if (entrada.adultos < acomodacao.minAdultos) {
    return {
      ok: false,
      erro: `Esta opção exige no mínimo ${acomodacao.minAdultos} ${
        acomodacao.minAdultos === 1 ? "adulto" : "adultos"
      }.`,
      noites,
      total: 0,
      detalhes,
    };
  }

  let total = 0;

  if (acomodacao.modalidade === "camping") {
    // Diária varia por dia: fim de semana é mais cara.
    const inicio = new Date(entrada.checkin + "T00:00:00Z");
    let adultosTotal = 0;
    let criancasTotal = 0;
    for (let i = 0; i < noites; i++) {
      const dia = new Date(inicio);
      dia.setUTCDate(inicio.getUTCDate() + i);
      const diaria = ehFimDeSemana(dia)
        ? acomodacao.adultoUmaNoite
        : acomodacao.adultoSemana;
      adultosTotal += diaria * entrada.adultos;
      criancasTotal += Math.round(diaria / 2) * entrada.criancas;
    }
    total = adultosTotal + criancasTotal;
    detalhes.push(`${entrada.adultos} adulto(s) × ${noites} noite(s)`);
    if (entrada.criancas > 0)
      detalhes.push(`${entrada.criancas} criança(s) 6–12 anos (meia diária)`);

    if (entrada.trailer) {
      const pessoas = entrada.adultos + entrada.criancas;
      const extra = TRAILER_POR_PESSOA_NOITE * pessoas * noites;
      total += extra;
      detalhes.push(`Trailer/motorhome: +${centavosParaReais(extra)}`);
    }
  } else {
    // Barracas e pousada: tarifa por adulto/noite muda se for 1 noite ou 2+.
    const tarifa = noites >= 2 ? acomodacao.adultoSemana : acomodacao.adultoUmaNoite;

    // 1º e 2º adultos: tarifa cheia. 3º e 4º: 30% de desconto.
    let custoAdultosPorNoite = 0;
    for (let i = 0; i < entrada.adultos; i++) {
      custoAdultosPorNoite += i >= 2 ? Math.round(tarifa * 0.7) : tarifa;
    }
    const custoCriancasPorNoite = Math.round(tarifa / 2) * entrada.criancas;

    total = (custoAdultosPorNoite + custoCriancasPorNoite) * noites;

    detalhes.push(
      `${entrada.adultos} adulto(s) × ${noites} noite(s) (${centavosParaReais(
        tarifa
      )}/noite)`
    );
    if (entrada.adultos > 2) detalhes.push("3º e 4º adultos com 30% de desconto");
    if (entrada.criancas > 0)
      detalhes.push(`${entrada.criancas} criança(s) 6–12 anos (meia diária)`);
  }

  if (entrada.bebes > 0)
    detalhes.push(`${entrada.bebes} criança(s) até 5 anos — cortesia`);

  return { ok: true, noites, total, detalhes };
}

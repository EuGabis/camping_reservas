// Conteúdo institucional do site, centralizado para facilitar edição.
// Textos baseados no material oficial do Vapo Camping EcoPark.

export const CONTATO = {
  nome: "Vapo Camping EcoPark",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5511986659885",
  whatsappExibicao: "(11) 98665-9885",
  pix: "pix@vapocamping.com.br",
  msgWhatsapp: "Cheguei aqui através do site Vapo Camping EcoPark",
  endereco: "Alameda Nossa Senhora da Guadalupe, 953",
  bairro: "Alto da Serra — São Roque, SP",
  cep: "18143-410",
  instagram: "https://instagram.com/vapocamping",
  facebook: "https://facebook.com/vapocamping",
  youtube: "https://www.youtube.com/@VapoCampingTripseacampamentos",
};

export const SOBRE = {
  paragrafos: [
    "Cercado pelo verde da mata nativa, o Vapo Camping EcoPark é um refúgio para quem gosta de apreciar e contemplar a natureza. Situado em uma área de 10 hectares, parte dela sendo uma Área de Preservação Permanente (APP), com árvores nativas de mais de 80 espécies, 4 lagos para pesca e trilha. Integrado a esta natureza exuberante, há animais de diversas espécies, como gansos, jacus, saguis, esquilos, além de uma infinidade de pássaros.",
    "Localizado na cidade de São Roque, a 60 km de São Paulo, considerada a cidade do vinho, tem como sua principal atração a Estrada do Vinho, via de 10 quilômetros de extensão com vinícolas, restaurantes, bares, sítios, pesqueiros, plantação de uvas e alcachofras.",
    "A gastronomia é o que mais atrai turistas nesta rota, com pratos diversificados, para todos os bolsos e gostos. Mas as atrações não param por aí: a linda cidade de São Roque, situada em meio às montanhas, tem atividades para aventureiros, passeios culturais, uma vida noturna agitada e ótimas opções de compras.",
    "O Vapo Camping EcoPark conta com uma estrutura completa para que todos possam aproveitar da melhor forma o dia de lazer e sossego dentro do camping.",
  ],
};

export interface Comodidade {
  titulo: string;
  texto: string;
}

export const COMODIDADES: Comodidade[] = [
  { titulo: "Banheiros e chuveiros", texto: "Vestiários masculinos e femininos com vários vasos e chuveiros quentes." },
  { titulo: "5 áreas de camping", texto: "Espaços amplos com pontos de energia 220v distribuídos pelo camping." },
  { titulo: "Trailer e motorhome", texto: "Área específica com ponto de água e energia elétrica para quem viaja sobre rodas." },
  { titulo: "Cozinha comunitária", texto: "Geladeira, fogão, micro-ondas e filtro à disposição de todos." },
  { titulo: "Lava-pratos e tanques", texto: "Lava-pratos em todas as áreas e tanques para lavar roupas." },
  { titulo: "4 lagos para pesca", texto: "Pesque, contemple e relaxe à beira d'água em meio à mata." },
  { titulo: "Trilha", texto: "Trilha interna para uma caminhada revigorante em meio ao verde." },
  { titulo: "Fauna preservada", texto: "Gansos, saguis, esquilos, jacus e dezenas de espécies de pássaros." },
];

export const REGRAS: string[] = [
  "Silêncio das 22h às 8h — sem som automotivo ou caixas de som.",
  "Equipamentos com resistência elétrica não são permitidos.",
  "Pets pequenos são bem-vindos no camping, sempre na coleira (não permitidos em barracas e quartos).",
  "Acesso às áreas sociais das 8h30 às 18h.",
  "Funcionamento de quinta a segunda — fechado às terças e quartas.",
  "Pagamento: 50% na reserva via PIX e o restante no check-in (PIX ou cartão).",
];

export const HORARIOS = {
  funcionamento: "Quinta a segunda-feira (fechado terça e quarta)",
  checkinCamping: "Sáb a qui: 8h30–16h · Sex e véspera de feriado: 8h30–21h",
  checkinHospedagem: "14h–21h (aos sábados até 16h)",
  checkout: "Camping até 18h · Quartos e Hotel de Barracas até 12h",
};

// Informações detalhadas da Pousada Casa Camping (quartos, regras e o que está
// incluso). Os preços vêm de lib/precos.ts (fonte única); aqui ficam só os
// textos qualitativos. `banheiro` é indexado pelo id da acomodação.
export const POUSADA = {
  intro:
    "Suíte e quartos com vista para o verde, para quem prefere o conforto de quatro paredes com a mata logo ali fora.",
  banheiro: {
    "suite-vista": "Banheiro privativo",
    "quarto-vista": "Banheiro compartilhado",
    "quarto-corredor": "Banheiro compartilhado · sem janela",
  } as Record<string, string>,
  ocupacao: [
    "Mínimo de 2 adultos e máximo de 3 pessoas por quarto",
    "Valor por pessoa, a partir de 13 anos",
    "Crianças de 6 a 12 anos pagam meia diária · até 5 anos, cortesia",
    "Funcionamento de quinta a segunda (fechado terça e quarta)",
    "Não é permitido pet nos quartos",
  ],
  horarios: [
    ["Check-in", "14h às 21h (aos sábados até 16h)"],
    ["Check-out", "8h30 às 12h"],
    ["Áreas sociais", "Entrada a partir das 8h30 · saída até 18h"],
    ["Pagamento", "50% na reserva; o restante no check-in em até 2x sem juros no cartão"],
  ] as [string, string][],
  incluso: [
    "Diária do camping",
    "Cozinha e sala compartilhada, exclusivas para hóspedes dos quartos",
  ],
  naoIncluso: ["Café da manhã", "Cobertores", "Roupas de cama e banho"],
  observacoes: [
    "Banheiro compartilhado de uso exclusivo do quarto com vista e do quarto de corredor (2 unidades).",
    "Roupa de cama disponível mediante taxa — consulte a equipe.",
  ],
};

// Logo em /public/logo.png. As fotos do parque são lidas automaticamente
// de /public/fotos em lib/fotos.ts.
export const LOGO = "/logo.png";

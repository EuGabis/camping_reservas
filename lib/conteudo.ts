// Conteúdo institucional do site, centralizado para facilitar edição.
// Textos baseados no material oficial do Vapo Camping EcoPark.

export const CONTATO = {
  nome: "Vapo Camping EcoPark",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5511986659885",
  whatsappExibicao: "(11) 98665-9885",
  endereco: "Alameda Nossa Senhora da Guadalupe, 953",
  bairro: "Alto da Serra — São Roque, SP",
  cep: "18143-410",
  instagram: "https://instagram.com/vapocamping",
  facebook: "https://facebook.com/vapocamping",
};

export const SOBRE = {
  chamada: "Um refúgio especial, criado por campistas.",
  paragrafos: [
    "Cercado pelo verde da mata nativa, o Vapo Camping EcoPark é um refúgio para quem gosta de apreciar e contemplar a natureza. Numa área de 10 hectares — parte dela Área de Preservação Permanente — com árvores nativas de mais de 80 espécies, 4 lagos para pesca e trilha.",
    "Integrado a essa natureza exuberante, há animais de diversas espécies, como gansos, jacus, saguis, esquilos, além de uma grande diversidade de pássaros.",
    "Localizado em São Roque, a 60 km de São Paulo — a cidade do vinho — temos como vizinha a famosa Estrada do Vinho, com 10 quilômetros de vinícolas, restaurantes, bares e pesqueiros. Aqui você tem estrutura completa para aproveitar o dia de lazer e o sossego do camping.",
  ],
};

export interface Comodidade {
  titulo: string;
  texto: string;
}

export const COMODIDADES: Comodidade[] = [
  { titulo: "Banheiros e chuveiros", texto: "Vestiários masculinos e femininos com vários sanitários e chuveiros quentes." },
  { titulo: "5 áreas de camping", texto: "Espaços amplos com pontos de energia 220v distribuídos pelo parque." },
  { titulo: "Trailer e motorhome", texto: "Área específica com ponto de água para quem viaja sobre rodas." },
  { titulo: "Cozinha comunitária", texto: "Geladeira, fogão, micro-ondas e filtro à disposição de todos." },
  { titulo: "Lava-pratos e tanques", texto: "Lava-pratos em todas as áreas e tanques para lavar roupas." },
  { titulo: "4 lagos para pesca", texto: "Pesque, contemple e relaxe à beira d'água em meio à mata." },
  { titulo: "Trilha e cascata", texto: "Trilha pela mata nativa, cascata e roda d'água para explorar." },
  { titulo: "Fauna preservada", texto: "Gansos, saguis, esquilos, jacus e dezenas de espécies de pássaros." },
];

export const REGRAS: string[] = [
  "Silêncio das 22h às 8h — sem som automotivo ou caixas de som.",
  "Equipamentos com resistência elétrica não são permitidos.",
  "Pets pequenos são bem-vindos no camping, sempre na coleira (não permitidos em barracas e quartos).",
  "Acesso às áreas sociais das 8h30 às 18h.",
  "Funcionamento de quinta a segunda — fechado às terças e quartas.",
  "Pagamento: 50% na reserva e o restante no check-in, via PIX ou cartão.",
];

export const HORARIOS = {
  funcionamento: "Quinta a segunda-feira (fechado terça e quarta)",
  checkinCamping: "Sáb a qui: 8h30–16h · Sex e véspera de feriado: 8h30–21h",
  checkinHospedagem: "14h–21h (aos sábados até 16h)",
  checkout: "Camping até 18h · Hospedagem até 12h",
};

// Fotos reais do camping, em /public/fotos. Veja public/fotos/LEIA-ME.txt
// para saber qual imagem salvar com cada nome de arquivo.
export const LOGO = "/logo.png";

export const FOTOS = {
  // Banner do topo: foto limpa da primeira versão (troque por uma foto larga
  // e sem moldura do próprio camping quando tiver uma boa).
  hero: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=2000&q=80",
  mata: "/fotos/areas-camping.jpg",
  lago: "/fotos/lagos.jpg",
  fogueira: "/fotos/camping-noite.jpg",
  barraca: "/fotos/camping-noite.jpg",
  pousada: "/fotos/lagos.jpg", // trocar quando houver foto da pousada
  trilha: "/fotos/camping-dia.jpg",
};

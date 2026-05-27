import type {
  Listing, User, Report, Payment, Conversation, ChatMessage,
  Review, Favorite, BlogPost, FlaggedListing, SituacaoDocumental,
  VerificacaoLocalizacao, IpEntry, PendingRegistration, BlockedAttempt,
} from "./types";

// ============ CONSTANTES ============

export const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR",
  "PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export const BRANDS = [
  "Chevrolet", "Volkswagen", "Ford", "Fiat", "Dodge", "Willys",
  "Puma", "Renault", "Simca", "GM",
];

export const FIPE_BY_MODEL: Record<string, number> = {
  "Opala": 35000,
  "Opala 2.5": 35000,
  "Galaxie": 98000,
  "Galaxie 500": 98000,
  "Brasília": 12000,
  "Charger": 140000,
  "Charger RT": 140000,
  "Charger R/T": 140000,
  "Kombi": 22000,
  "Kombi Standard": 22000,
  "Veraneio": 15000,
  "Veraneio C10": 15000,
  "Corcel": 25000,
  "Corcel II GT": 25000,
  "147": 11000,
  "Fiat 147": 11000,
  "Maverick": 30000,
  "Maverick 2.3": 30000,
  "Variant": 13000,
  "Puma": 72000,
  "Puma GTE": 72000,
  "Rural": 20000,
  "Rural Willys": 20000,
  "Gordini": 18000,
  "Renault Gordini": 18000,
  "Chambord": 16000,
  "Simca Chambord": 16000,
  "Fusca": 18000,
  "Fusca 1300": 18000,
};

export function fipeFor(model: string): number {
  if (FIPE_BY_MODEL[model]) return FIPE_BY_MODEL[model];
  for (const k of Object.keys(FIPE_BY_MODEL)) {
    if (model.includes(k) || k.includes(model)) return FIPE_BY_MODEL[k];
  }
  return 50000;
}

// ============ HELPERS DE IP ============

function makeIps(cidade: string, estado: string): IpEntry[] {
  const base = [
    { ip: "177.32.15.201", cidade, estado, timestamp: "2024-01-20 14:30" },
    { ip: "177.32.15.202", cidade, estado, timestamp: "2024-01-18 09:12" },
    { ip: "189.40.22.100", cidade, estado, timestamp: "2024-01-15 18:55" },
    { ip: "201.17.45.88",  cidade, estado, timestamp: "2024-01-12 11:02" },
    { ip: "177.32.15.205", cidade, estado, timestamp: "2024-01-10 20:40" },
    { ip: "189.40.22.104", cidade, estado, timestamp: "2024-01-08 08:33" },
    { ip: "201.17.45.91",  cidade, estado, timestamp: "2024-01-06 16:20" },
    { ip: "177.32.15.210", cidade, estado, timestamp: "2024-01-04 22:15" },
    { ip: "189.40.22.110", cidade, estado, timestamp: "2024-01-02 10:05" },
    { ip: "201.17.45.99",  cidade, estado, timestamp: "2023-12-30 13:44" },
  ];
  return base;
}

// IPs suspeitos para user_07 — 3 estados diferentes em < 2h
const ipsRobertoMelo: IpEntry[] = [
  { ip: "200.10.55.10", cidade: "Recife",        estado: "PE", timestamp: "2024-01-20 08:00" },
  { ip: "177.98.12.44", cidade: "Manaus",         estado: "AM", timestamp: "2024-01-20 08:45" },
  { ip: "189.22.33.77", cidade: "Porto Velho",    estado: "RO", timestamp: "2024-01-20 09:50" },
  { ip: "200.10.55.11", cidade: "Recife",         estado: "PE", timestamp: "2024-01-18 14:00" },
  { ip: "201.33.88.50", cidade: "Recife",         estado: "PE", timestamp: "2024-01-15 10:30" },
  { ip: "200.10.55.12", cidade: "Recife",         estado: "PE", timestamp: "2024-01-12 09:00" },
  { ip: "189.22.33.78", cidade: "Recife",         estado: "PE", timestamp: "2024-01-10 11:20" },
  { ip: "200.10.55.13", cidade: "Recife",         estado: "PE", timestamp: "2024-01-08 16:00" },
  { ip: "201.33.88.51", cidade: "Recife",         estado: "PE", timestamp: "2024-01-05 08:00" },
  { ip: "200.10.55.14", cidade: "Recife",         estado: "PE", timestamp: "2024-01-02 17:00" },
];

// ============ USUÁRIOS (10 total) ============

export const mockUsers: User[] = [
  // user_01 — João Carvalho
  {
    id: "u1",
    name: "João Carvalho",
    email: "joao@email.com",
    phone: "(11) 99871-0001",
    city: "São Paulo",
    state: "SP",
    plan: "premium",
    status: "ativo",
    memberSince: "2022-03-10",
    responseRate: 94,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: true, kyc: true },
    fingerprints: ["FP_001_unique"],
    ipsRecentes: makeIps("São Paulo", "SP"),
    taxaResposta: 94,
    tempoMedioResposta: "~45min",
    carrosVendidos: 8,
    sellerScore: 94,
  },
  // user_02 — Maria Santos
  {
    id: "u2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(21) 98762-0002",
    city: "Rio de Janeiro",
    state: "RJ",
    plan: "premium",
    status: "ativo",
    memberSince: "2022-07-14",
    responseRate: 87,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: true, kyc: false },
    fingerprints: ["FP_002_unique"],
    ipsRecentes: makeIps("Rio de Janeiro", "RJ"),
    taxaResposta: 87,
    tempoMedioResposta: "~1h30",
    carrosVendidos: 5,
    sellerScore: 87,
  },
  // user_03 — Carlos Lima
  {
    id: "u3",
    name: "Carlos Lima",
    email: "carlos@email.com",
    phone: "(31) 97651-0003",
    city: "Belo Horizonte",
    state: "MG",
    plan: "gratuito",
    status: "ativo",
    memberSince: "2023-01-22",
    responseRate: 72,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: false, kyc: false },
    fingerprints: ["FP_003_unique"],
    ipsRecentes: makeIps("Belo Horizonte", "MG"),
    taxaResposta: 72,
    tempoMedioResposta: "~3h",
    carrosVendidos: 2,
    sellerScore: 72,
  },
  // user_04 — Ana Ferreira
  {
    id: "u4",
    name: "Ana Ferreira",
    email: "ana@email.com",
    phone: "(41) 96540-0004",
    city: "Curitiba",
    state: "PR",
    plan: "gratuito",
    status: "ativo",
    memberSince: "2023-04-05",
    responseRate: 65,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: false, kyc: false },
    fingerprints: ["FP_004_unique"],
    ipsRecentes: makeIps("Curitiba", "PR"),
    taxaResposta: 65,
    tempoMedioResposta: "~4h",
    carrosVendidos: 1,
    sellerScore: 65,
  },
  // user_05 — Pedro Oliveira
  {
    id: "u5",
    name: "Pedro Oliveira",
    email: "pedro@email.com",
    phone: "(51) 95430-0005",
    city: "Porto Alegre",
    state: "RS",
    plan: "gratuito",
    status: "ativo",
    memberSince: "2023-11-12",
    responseRate: 40,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: false, cpf: false, kyc: false },
    fingerprints: ["FP_005_unique"],
    ipsRecentes: makeIps("Porto Alegre", "RS"),
    taxaResposta: 40,
    tempoMedioResposta: "~8h",
    carrosVendidos: 0,
    sellerScore: 40,
    badges: ["Vendedor novo"],
  },
  // user_06 — Sandra Costa
  {
    id: "u6",
    name: "Sandra Costa",
    email: "sandra@email.com",
    phone: "(62) 94320-0006",
    city: "Goiânia",
    state: "GO",
    plan: "premium",
    status: "ativo",
    memberSince: "2022-09-18",
    responseRate: 78,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: false, kyc: false },
    fingerprints: ["FP_006_unique"],
    ipsRecentes: makeIps("Goiânia", "GO"),
    taxaResposta: 78,
    tempoMedioResposta: "~2h",
    carrosVendidos: 3,
    sellerScore: 78,
  },
  // user_07 — Roberto Melo (SUSPENSO / banido, VPN, denúncias)
  {
    id: "u7",
    name: "Roberto Melo",
    email: "roberto@email.com",
    phone: "(81) 93210-0007",
    city: "Recife",
    state: "PE",
    plan: "gratuito",
    status: "suspenso",
    memberSince: "2023-06-30",
    responseRate: 28,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: true, kyc: false },
    fingerprints: ["FP_007_BANIDO"],
    ipsRecentes: ipsRobertoMelo,
    taxaResposta: 28,
    tempoMedioResposta: "~24h",
    carrosVendidos: 0,
    sellerScore: 28,
    denunciasProcedentesCont: 3,
  },
  // user_08 — Lucia Souza (fingerprint coincide com user_07)
  {
    id: "u8",
    name: "Lucia Souza",
    email: "lucia@email.com",
    phone: "(71) 92100-0008",
    city: "Salvador",
    state: "BA",
    plan: "gratuito",
    status: "ativo",
    memberSince: "2024-01-03",
    responseRate: 55,
    role: "user",
    approved: true,
    verificacoes: { email: true, telefone: false, cpf: false, kyc: false },
    fingerprints: ["FP_ABC123"],
    ipsRecentes: makeIps("Salvador", "BA"),
    taxaResposta: 55,
    tempoMedioResposta: "~6h",
    carrosVendidos: 0,
    sellerScore: 55,
  },
  // admin_01 — Admin Master
  {
    id: "u9",
    name: "Admin Master",
    email: "admin@classicosbr.com",
    phone: "(11) 91000-0009",
    city: "São Paulo",
    state: "SP",
    plan: "premium",
    status: "ativo",
    memberSince: "2021-01-01",
    responseRate: 100,
    role: "admin",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: true, kyc: true },
    fingerprints: ["FP_ADMIN_001"],
    ipsRecentes: makeIps("São Paulo", "SP"),
    taxaResposta: 100,
    tempoMedioResposta: "~10min",
    carrosVendidos: 0,
    sellerScore: 100,
  },
  // admin_02 — Admin Suporte
  {
    id: "u10",
    name: "Admin Suporte",
    email: "suporte@classicosbr.com",
    phone: "(21) 91000-0010",
    city: "Rio de Janeiro",
    state: "RJ",
    plan: "premium",
    status: "ativo",
    memberSince: "2021-06-15",
    responseRate: 100,
    role: "admin",
    approved: true,
    verificacoes: { email: true, telefone: true, cpf: true, kyc: true },
    fingerprints: ["FP_ADMIN_002"],
    ipsRecentes: makeIps("Rio de Janeiro", "RJ"),
    taxaResposta: 100,
    tempoMedioResposta: "~15min",
    carrosVendidos: 0,
    sellerScore: 100,
  },
];

// ============ HELPERS DE LOCALIZAÇÃO ============

function locVerificada(cidade: string, st: string): VerificacaoLocalizacao {
  return { badge: "verificada", fonteA: `${cidade}, ${st}`, fonteB: `${cidade}, ${st}`, fonteC: `${cidade}, ${st}` };
}
function locProvavel(cidade: string, st: string): VerificacaoLocalizacao {
  return { badge: "provavel", fonteA: `${cidade}, ${st}`, fonteB: null, fonteC: `${cidade}, ${st}` };
}
function locSemDados(cidade: string, st: string): VerificacaoLocalizacao {
  return { badge: "semDados", fonteA: `${cidade}, ${st}`, fonteB: null, fonteC: null };
}
function locDivergencia(cidade: string, st: string, outra: string): VerificacaoLocalizacao {
  return { badge: "divergencia", fonteA: `${cidade}, ${st}`, fonteB: outra, fonteC: outra };
}

// ============ HELPERS DOCUMENTAIS ============

const docProprio: SituacaoDocumental = {
  documentoNome: "proprio",
  transferenciasAcumuladas: "nenhuma",
  ipva: "isentoAntiguidade",
  ipvaAnosAtraso: null,
  licenciamento: "emDia",
  chassi: "visivelLegivel",
  motor: "original",
  multas: "nenhuma",
  multasValor: null,
  aceitaAjudarRegularizacao: "sim",
  documentosFisicos: ["CRLV original", "Manual do proprietário", "Nota fiscal"],
};

function docTerceiro(ipvaAnos?: number): SituacaoDocumental {
  return {
    documentoNome: "terceiro",
    transferenciasAcumuladas: "1a2",
    ipva: ipvaAnos != null ? "atrasado" : "emDia",
    ipvaAnosAtraso: ipvaAnos ?? null,
    licenciamento: ipvaAnos != null ? "atrasado" : "emDia",
    chassi: "visivelLegivel",
    motor: "trocadoMesmaFamilia",
    multas: "comMultas",
    multasValor: 650,
    aceitaAjudarRegularizacao: "parcialmente",
    documentosFisicos: ["CRLV antigo"],
  };
}

const docTerceiroIpva3: SituacaoDocumental = docTerceiro(3);
const docTerceiroIpva1: SituacaoDocumental = docTerceiro(1);
const docTerceiroIpva2: SituacaoDocumental = docTerceiro(2);

const docProprioChassiOk: SituacaoDocumental = {
  ...docProprio,
};

const docTerceiroAtrasadoSucata: SituacaoDocumental = {
  documentoNome: "terceiro",
  transferenciasAcumuladas: "3oumais",
  ipva: "naoSeAplica",
  ipvaAnosAtraso: null,
  licenciamento: "sucata",
  chassi: "parcialmenteLegivel",
  motor: "trocadoMesmaFamilia",
  multas: "naoVerificado",
  multasValor: null,
  aceitaAjudarRegularizacao: "nao",
  documentosFisicos: [],
};

const docTerceiroAtrasadoLicAt: SituacaoDocumental = {
  documentoNome: "terceiro",
  transferenciasAcumuladas: "1a2",
  ipva: "emDia",
  ipvaAnosAtraso: null,
  licenciamento: "atrasado",
  chassi: "visivelLegivel",
  motor: "trocadoMesmaFamilia",
  multas: "naoVerificado",
  multasValor: null,
  aceitaAjudarRegularizacao: "parcialmente",
  documentosFisicos: ["CRLV antigo"],
};

const docFalecidoIlegivel: SituacaoDocumental = {
  documentoNome: "falecido",
  transferenciasAcumuladas: "naosei",
  ipva: "atrasado",
  ipvaAnosAtraso: 5,
  licenciamento: "atrasado",
  chassi: "ilegivel",
  motor: "semNumero",
  multas: "naoVerificado",
  multasValor: null,
  aceitaAjudarRegularizacao: "nao",
  documentosFisicos: [],
};

const docFalecidoChassiNaoLocalizado: SituacaoDocumental = {
  documentoNome: "falecido",
  transferenciasAcumuladas: "naosei",
  ipva: "atrasado",
  ipvaAnosAtraso: 4,
  licenciamento: "atrasado",
  chassi: "naoLocalizado",
  motor: "semNumero",
  multas: "naoVerificado",
  multasValor: null,
  aceitaAjudarRegularizacao: "nao",
  documentosFisicos: [],
};

const docEmpresaExtinta: SituacaoDocumental = {
  documentoNome: "empresaExtinta",
  transferenciasAcumuladas: "3oumais",
  ipva: "atrasado",
  ipvaAnosAtraso: 2,
  licenciamento: "atrasado",
  chassi: "visivelLegivel",
  motor: "original",
  multas: "comMultas",
  multasValor: 1200,
  aceitaAjudarRegularizacao: "nao",
  documentosFisicos: [],
};

const docEmpresaExtintaSucata: SituacaoDocumental = {
  documentoNome: "empresaExtinta",
  transferenciasAcumuladas: "3oumais",
  ipva: "naoSeAplica",
  ipvaAnosAtraso: null,
  licenciamento: "sucata",
  chassi: "ilegivel",
  motor: "semNumero",
  multas: "naoVerificado",
  multasValor: null,
  aceitaAjudarRegularizacao: "nao",
  documentosFisicos: [],
};

const docDesconhecidoIlegivel: SituacaoDocumental = {
  documentoNome: "desconhecido",
  transferenciasAcumuladas: "naosei",
  ipva: "atrasado",
  ipvaAnosAtraso: 8,
  licenciamento: "atrasado",
  chassi: "ilegivel",
  motor: "semNumero",
  multas: "naoVerificado",
  multasValor: null,
  aceitaAjudarRegularizacao: "nao",
  documentosFisicos: [],
};

const docTerceiroIlegivel: SituacaoDocumental = {
  documentoNome: "terceiro",
  transferenciasAcumuladas: "3oumais",
  ipva: "atrasado",
  ipvaAnosAtraso: 3,
  licenciamento: "atrasado",
  chassi: "ilegivel",
  motor: "semNumero",
  multas: "naoVerificado",
  multasValor: null,
  aceitaAjudarRegularizacao: "nao",
  documentosFisicos: [],
};

const docProprioIpva1: SituacaoDocumental = {
  ...docProprio,
  ipva: "atrasado",
  ipvaAnosAtraso: 1,
};

// ============ ANÚNCIOS (15 total) ============

export const mockListings: Listing[] = [
  // listing_01 — Chevrolet Opala 1979
  {
    id: "l1",
    title: "Chevrolet Opala 1979 2.5 8v Azul Metálico",
    brand: "Chevrolet",
    model: "Opala 2.5",
    year: 1979,
    category: "completo",
    engine: "2.5 8v",
    color: "Azul Metálico",
    km: 87000,
    chassi: "OPL79SP001",
    documento: "OK",
    price: 38000,
    description: "Opala 1979 em excelente estado de conservação, segundo dono desde 1995. Motor 2.5 oito válvulas completamente revisado em 2022, incluindo troca de juntas, velas, cabos e bobina. Pintura original com retoques pontuais, sem massa corrida. Estofamento em couro caramelo bem conservado, painel sem trincas.\n\nDocumentação 100% em nome do proprietário, IPVA isento por antiguidade conforme lei estadual de São Paulo. Chassi visível e legível, número de motor original. Acompanha manual do fabricante, nota fiscal de compra e todas as revisões anotadas. Vistoria cautelar disponível a qualquer momento. Carro aprovado em encontros de clássicos em 2021, 2022 e 2023.",
    photos: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
    ],
    city: "São Paulo",
    state: "SP",
    sellerId: "u1",
    status: "ativo",
    createdAt: "2024-01-10",
    precoFipe: 35000,
    percFipe: 8,
    distancia: "a 12 km de você",
    scoreConfianca: 92,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locVerificada("São Paulo", "SP"),
    situacaoDocumental: docProprioChassiOk,
  },

  // listing_02 — VW Fusca 1972 1300 Bege
  {
    id: "l2",
    title: "VW Fusca 1972 1300 Bege",
    brand: "Volkswagen",
    model: "Fusca 1300",
    year: 1972,
    category: "fazer",
    engine: "1.3",
    color: "Bege",
    km: 145000,
    chassi: "FUS72RJ002",
    documento: "Pendente transferência",
    price: 12500,
    description: "Fusca 1972 com motor 1300 original, precisa de restauração na lataria e pintura. Motor funciona e anda, carburador revisado recentemente. Parte elétrica funcionando, faróis e lanternas originais. Interior necessita de estofamento novo e painel restaurado.\n\nDocumento em nome de terceiro, IPVA com 3 anos de atraso para regularização. Chassi visível e legível. Motor da mesma família, porém trocado conforme nota do mecânico. Ideal para projetos de restauração. Preço negociável para pagamento à vista. Localizado no Rio de Janeiro, aceito visita com hora marcada.",
    photos: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
    city: "Rio de Janeiro",
    state: "RJ",
    sellerId: "u2",
    status: "ativo",
    createdAt: "2024-01-08",
    precoFipe: 18000,
    percFipe: -31,
    distancia: "a 450 km de você",
    scoreConfianca: 68,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locProvavel("Rio de Janeiro", "RJ"),
    situacaoDocumental: docTerceiroIpva3,
  },

  // listing_03 — Ford Galaxie 500 1968 V8 Vermelho
  {
    id: "l3",
    title: "Ford Galaxie 500 1968 V8 Vermelho",
    brand: "Ford",
    model: "Galaxie 500",
    year: 1968,
    category: "completo",
    engine: "V8 4.8",
    color: "Vermelho",
    km: 62000,
    chassi: "GLX68SP003",
    documento: "OK",
    price: 95000,
    description: "Ford Galaxie 500 de 1968 em estado de colecionador. Motor V8 4.8 litros funcionando perfeitamente, revisão completa em 2023 com troca de correia, bomba d'água e filtros. Pintura original em vermelho, apenas polida, sem repintura. Cromados em excelente estado, frisos e emblemas originais.\n\nDocumento em nome do vendedor, IPVA isento por antiguidade. Chassi visível e legível. Carro participou de encontros nacionais de clássicos e recebeu prêmio de melhor conservação na categoria \"Pré-73\" em 2022. Acompanha pasta completa de documentos e histórico de manutenção. Localizado em Campinas, SP. Aceito propostas sérias.",
    photos: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80",
    ],
    city: "Campinas",
    state: "SP",
    sellerId: "u1",
    status: "ativo",
    createdAt: "2024-01-05",
    precoFipe: 98000,
    percFipe: -3,
    distancia: "a 95 km de você",
    scoreConfianca: 88,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locVerificada("Campinas", "SP"),
    situacaoDocumental: {
      ...docProprioChassiOk,
      licenciamento: "emDia",
    },
  },

  // listing_04 — VW Brasília 1981 1300 Verde
  {
    id: "l4",
    title: "VW Brasília 1981 1300 Verde",
    brand: "Volkswagen",
    model: "Brasília",
    year: 1981,
    category: "pecas",
    engine: "1.3",
    color: "Verde",
    km: 210000,
    chassi: "BRA81MG004",
    documento: "Sem documento completo",
    price: 4500,
    description: "Brasília 1981 para retirada de peças. Motor travado, lataria com pontos de ferrugem. Bancos, painel e faróis em bom estado para reaproveitamento. Vidros intactos. Portas funcionando.\n\nDocumento em nome de terceiro, licenciamento como sucata. Chassi parcialmente legível. Vendida no estado, sem garantias. Retirada por conta do comprador, temos empilhadeira para auxílio no carregamento. Ideal para restauradores que precisam de peças originais difíceis de encontrar.",
    photos: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
    ],
    city: "Belo Horizonte",
    state: "MG",
    sellerId: "u3",
    status: "ativo",
    createdAt: "2024-01-12",
    precoFipe: 12000,
    percFipe: -63,
    distancia: "a 580 km de você",
    scoreConfianca: 35,
    alertaPrecoSuspeito: true,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locSemDados("Belo Horizonte", "MG"),
    situacaoDocumental: docTerceiroAtrasadoSucata,
  },

  // listing_05 — Dodge Charger RT 1975 318 Preto
  {
    id: "l5",
    title: "Dodge Charger RT 1975 318 Preto",
    brand: "Dodge",
    model: "Charger R/T",
    year: 1975,
    category: "completo",
    engine: "5.2 V8 318",
    color: "Preto",
    km: 73000,
    chassi: "CHR75SP005",
    documento: "OK",
    price: 145000,
    description: "Dodge Charger RT 1975 em estado de coleção. Motor 318 V8 todo revisado, transmissão automática funcionando perfeitamente. Lataria original sem soldas, pintura preta refletindo com perfeição. Interior com banco corrido reestofado em couro preto, painel completo com todos os instrumentos funcionando.\n\nDocumento em nome do proprietário, IPVA isento por antiguidade. Chassi visível, legível e confere com documentação. Motor original com número gravado. Histórico de 22 anos na família, todas as revisões documentadas. Carro foi campeão na categoria \"Muscle Cars\" no Encontro Nacional de Clássicos 2023. Aceito visita técnica.",
    photos: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    ],
    city: "São Paulo",
    state: "SP",
    sellerId: "u1",
    status: "ativo",
    createdAt: "2024-01-02",
    precoFipe: 140000,
    percFipe: 4,
    distancia: "a 18 km de você",
    scoreConfianca: 90,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locVerificada("São Paulo", "SP"),
    situacaoDocumental: docProprioChassiOk,
  },

  // listing_06 — VW Kombi Standard 1985 Branca
  {
    id: "l6",
    title: "VW Kombi Standard 1985 Branca",
    brand: "Volkswagen",
    model: "Kombi Standard",
    year: 1985,
    category: "fazer",
    engine: "1.5 boxer",
    color: "Branca",
    km: 185000,
    chassi: "KMB85PR006",
    documento: "Regularização pendente",
    price: 18000,
    description: "Kombi Standard 1985 para fazer. Motor parado há dois anos, necessita revisão completa. Lataria em bom estado com apenas dois pontos de ferrugem nos soleiros. Vidros e borrachas boas. Banco do motorista em couro original um pouco gasto.\n\nDocumento em nome de terceiro, licenciamento com atraso. Motor trocado por um da mesma família 1600. Chassi visível e legível. Ótima para projeto food truck ou camper vintage. Aceito troca por carro do ano mais popular.",
    photos: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    ],
    city: "Curitiba",
    state: "PR",
    sellerId: "u4",
    status: "ativo",
    createdAt: "2024-01-07",
    precoFipe: 22000,
    percFipe: -18,
    distancia: "a 870 km de você",
    scoreConfianca: 58,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locProvavel("Curitiba", "PR"),
    situacaoDocumental: docTerceiroAtrasadoLicAt,
  },

  // listing_07 — GM Veraneio C10 1988 Bege
  {
    id: "l7",
    title: "GM Veraneio C10 1988 Bege",
    brand: "GM",
    model: "Veraneio C10",
    year: 1988,
    category: "pecas",
    engine: "4.1 diesel",
    color: "Bege",
    km: 320000,
    chassi: "VER88PE007",
    documento: "Irregular",
    price: 6000,
    description: "Veraneio C10 1988 para retirada de peças. Motor diesel ainda funciona. Lataria com muita ferrugem e amassados. Banco traseiro de 8 lugares ainda em bom estado. Eixos, diferencial e caixa de transferência em condição de uso.\n\nDocumento em nome de pessoa falecida, chassi ilegível. Requer regularização extrajudicial. Preço para venda rápida de peças. Retirada obrigatória em 10 dias após pagamento.",
    photos: [
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80",
    ],
    city: "Recife",
    state: "PE",
    sellerId: "u7",
    status: "pendente",
    createdAt: "2024-01-15",
    precoFipe: 15000,
    percFipe: -60,
    distancia: "a 2500 km de você",
    scoreConfianca: 22,
    alertaPrecoSuspeito: true,
    fotoDuplicadaFlag: true,
    verificacaoLocalizacao: locDivergencia("Recife", "PE", "Manaus, AM"),
    situacaoDocumental: docFalecidoIlegivel,
  },

  // listing_08 — Ford Corcel II GT 1979 Laranja
  {
    id: "l8",
    title: "Ford Corcel II GT 1979 Laranja",
    brand: "Ford",
    model: "Corcel II GT",
    year: 1979,
    category: "completo",
    engine: "1.6 CHT",
    color: "Laranja",
    km: 98000,
    chassi: "COR79RJ008",
    documento: "OK",
    price: 22000,
    description: "Corcel II GT 1979 em ótimo estado. Motor 1.6 CHT revisado, carburador novo, sistema de arrefecimento trocado. Pintura laranja original levemente desbotada mas sem ferrugem. Interior praticamente original com painel completo, todos os instrumentos funcionando.\n\nDocumentação em nome do proprietário, IPVA isento por antiguidade. Chassi visível e legível confere com documento. Segundo dono desde 1988. Carro bastante procurado por sua raridade na cor laranja original. Localizado em Niterói, RJ.",
    photos: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    ],
    city: "Niterói",
    state: "RJ",
    sellerId: "u2",
    status: "ativo",
    createdAt: "2024-01-06",
    precoFipe: 25000,
    percFipe: -12,
    distancia: "a 460 km de você",
    scoreConfianca: 82,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locVerificada("Niterói", "RJ"),
    situacaoDocumental: {
      ...docProprioChassiOk,
      licenciamento: "emDia",
    },
  },

  // listing_09 — Fiat 147 CL 1983 Amarelo
  {
    id: "l9",
    title: "Fiat 147 CL 1983 Amarelo",
    brand: "Fiat",
    model: "Fiat 147",
    year: 1983,
    category: "fazer",
    engine: "1.3",
    color: "Amarelo",
    km: 175000,
    chassi: "F14783PE009",
    documento: "Irregular",
    price: 8500,
    description: "Fiat 147 CL 1983 amarelo para restauro. Lataria com alguns amassados e pontos de ferrugem controlados. Motor liga mas precisa de revisão completa. Carburador necessita de recalibração. Interior precisando de estofamento novo.\n\nDocumento em nome de empresa extinta, chassi ilegível. Situação documental complexa que requer atenção jurídica. Preço abaixo do mercado reflete a situação documental. Ideal para colecionador com paciência para regularização.",
    photos: [
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
    ],
    city: "Recife",
    state: "PE",
    sellerId: "u7",
    status: "pendente",
    createdAt: "2024-01-14",
    precoFipe: 11000,
    percFipe: -23,
    distancia: "a 2500 km de você",
    scoreConfianca: 25,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locSemDados("Recife", "PE"),
    situacaoDocumental: {
      documentoNome: "empresaExtinta",
      transferenciasAcumuladas: "3oumais",
      ipva: "atrasado",
      ipvaAnosAtraso: 6,
      licenciamento: "atrasado",
      chassi: "ilegivel",
      motor: "semNumero",
      multas: "naoVerificado",
      multasValor: null,
      aceitaAjudarRegularizacao: "nao",
      documentosFisicos: [],
    },
  },

  // listing_10 — Ford Maverick 1977 2.3 Marrom
  {
    id: "l10",
    title: "Ford Maverick 1977 2.3 Marrom",
    brand: "Ford",
    model: "Maverick 2.3",
    year: 1977,
    category: "completo",
    engine: "2.3 4cc",
    color: "Marrom",
    km: 112000,
    chassi: "MAV77GO010",
    documento: "OK",
    price: 32000,
    description: "Ford Maverick 1977 motor 2.3 quatro cilindros em excelente estado. Pintura marrom original restaurada profissionalmente em 2021. Interior completamente restaurado com tecido original reproduzido. Motor revisado com troca de todos os componentes de desgaste.\n\nDocumentação em nome do proprietário, IPVA com 1 ano de atraso sendo regularizado. Chassi visível e legível confere com documento. Terceiro dono, histórico completo desde 1977. Carro muito elogiado em encontros de clássicos de Goiás. Aceito visita com dia e hora marcados.",
    photos: [
      "https://images.unsplash.com/photo-1591553274543-f6e4fbd4c1ae?w=800&q=80",
      "https://images.unsplash.com/photo-1536700503589-a4e5e21fa2c4?w=800&q=80",
    ],
    city: "Goiânia",
    state: "GO",
    sellerId: "u6",
    status: "ativo",
    createdAt: "2024-01-04",
    precoFipe: 30000,
    percFipe: 7,
    distancia: "a 920 km de você",
    scoreConfianca: 80,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locVerificada("Goiânia", "GO"),
    situacaoDocumental: docProprioIpva1,
  },

  // listing_11 — VW Variant 1974 1600 Branco
  {
    id: "l11",
    title: "VW Variant 1974 1600 Branco",
    brand: "Volkswagen",
    model: "Variant",
    year: 1974,
    category: "fazer",
    engine: "1.6",
    color: "Branco",
    km: 0,
    chassi: "VAR74RS011",
    documento: "Pendente",
    price: 9800,
    description: "VW Variant 1974 para restauração. Carroceria sadia com potencial de restauro excelente. Motor trancado, precisa de revisão completa. Documentação pendente de transferência. Interior desmontado, falta estofamento.\n\nDocumento em nome de terceiro, chassi ilegível dificultando identificação. Motor sem número visível. Foto do veículo com possível duplicidade — verifique antes de negociar. Preço para quem conhece e quer um projeto desafiador. Localizado em Porto Alegre, RS.",
    photos: [
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80",
    ],
    city: "Porto Alegre",
    state: "RS",
    sellerId: "u5",
    status: "pendente",
    createdAt: "2024-01-13",
    precoFipe: 13000,
    percFipe: -25,
    distancia: "a 1100 km de você",
    scoreConfianca: 42,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: true,
    verificacaoLocalizacao: locDivergencia("Porto Alegre", "RS", "São Paulo, SP"),
    situacaoDocumental: docTerceiroIlegivel,
  },

  // listing_12 — Puma GTE 1974 1600 Vermelho
  {
    id: "l12",
    title: "Puma GTE 1974 1600 Vermelho",
    brand: "Puma",
    model: "Puma GTE",
    year: 1974,
    category: "completo",
    engine: "1.6 boxer",
    color: "Vermelho",
    km: 68000,
    chassi: "PUM74MG012",
    documento: "Transferência em andamento",
    price: 78000,
    description: "Puma GTE 1974 em vermelho, veículo raro e cobiçado por colecionadores. Motor boxer 1.6 funcionando, necessita de revisão preventiva. Lataria original com apenas pequenos retoques. Capota em bom estado.\n\nDocumento em nome de terceiro, IPVA com 2 anos de atraso. Processo de transferência em andamento no detran. Chassi visível e legível. Veículo faz parte de acervo de colecionador que está renovando a frota. Anúncio pausado aguardando conclusão do processo documental.",
    photos: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
    ],
    city: "Belo Horizonte",
    state: "MG",
    sellerId: "u3",
    status: "pausado",
    createdAt: "2024-01-09",
    precoFipe: 72000,
    percFipe: 8,
    distancia: "a 580 km de você",
    scoreConfianca: 62,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locSemDados("Belo Horizonte", "MG"),
    situacaoDocumental: docTerceiroIpva2,
  },

  // listing_13 — Rural Willys 4x4 1966 Verde
  {
    id: "l13",
    title: "Rural Willys 4x4 1966 Verde",
    brand: "Willys",
    model: "Rural Willys",
    year: 1966,
    category: "pecas",
    engine: "3.0 6cc",
    color: "Verde",
    km: 0,
    chassi: "RUR66BA013",
    documento: "Irregular",
    price: 11000,
    description: "Rural Willys 4x4 de 1966 para retirada de peças. Carroceria de madeira ainda com partes aproveitáveis. Motor não funciona. Eixos e diferencial podem ser reaproveitados. Peças raras para restauradores.\n\nDocumento em nome de pessoa falecida, chassi não localizado fisicamente no veículo. Situação documental muito complicada. Vendida estritamente para peças. Retirada dentro de 15 dias.",
    photos: [
      "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80",
    ],
    city: "Salvador",
    state: "BA",
    sellerId: "u8",
    status: "pausado",
    createdAt: "2024-01-11",
    precoFipe: 20000,
    percFipe: -45,
    distancia: "a 1600 km de você",
    scoreConfianca: 30,
    alertaPrecoSuspeito: false,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locSemDados("Salvador", "BA"),
    situacaoDocumental: docFalecidoChassiNaoLocalizado,
  },

  // listing_14 — Renault Gordini 1969 1.0 Azul
  {
    id: "l14",
    title: "Renault Gordini 1969 1.0 Azul",
    brand: "Renault",
    model: "Renault Gordini",
    year: 1969,
    category: "fazer",
    engine: "1.0",
    color: "Azul",
    km: 0,
    chassi: "GOD69PE014",
    documento: "Irregular",
    price: 5000,
    description: "Renault Gordini 1969 para projeto de restauração. Lataria com ferrugem generalizada, porém estrutura ainda sólida. Motor desmontado. Peças originais do painel presentes. Raridade no mercado brasileiro.\n\nDocumento desconhecido, chassi ilegível, divergência entre localização do anúncio e EXIF das fotos. Preço muito abaixo da tabela FIPE. Anúncio foi removido por suspeita de irregularidade. Contato apenas por mensagem no sistema.",
    photos: [
      "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800&q=80",
    ],
    city: "Recife",
    state: "PE",
    sellerId: "u7",
    status: "removido",
    createdAt: "2024-01-16",
    precoFipe: 18000,
    percFipe: -72,
    distancia: "a 2500 km de você",
    scoreConfianca: 18,
    alertaPrecoSuspeito: true,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locDivergencia("Recife", "PE", "Manaus, AM"),
    situacaoDocumental: docDesconhecidoIlegivel,
  },

  // listing_15 — Simca Chambord 1960 6cil Preto
  {
    id: "l15",
    title: "Simca Chambord 1960 6cil Preto",
    brand: "Simca",
    model: "Simca Chambord",
    year: 1960,
    category: "pecas",
    engine: "2.4 6cil",
    color: "Preto",
    km: 0,
    chassi: "SIM60BA015",
    documento: "Irregular",
    price: 7500,
    description: "Simca Chambord 1960 para peças. Um dos modelos mais raros do Brasil. Motor inativo há décadas. Carroceria com muita ferrugem. Portas e para-choques aproveitáveis. Espelhos e cromados parcialmente preservados.\n\nDocumento em nome de empresa extinta, licenciamento como sucata. Veículo extremamente raro — qualquer parte pode ser valiosa para restauradores. Retirada por conta do comprador. Anúncio removido por suspeita documental.",
    photos: [
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80",
    ],
    city: "Salvador",
    state: "BA",
    sellerId: "u8",
    status: "removido",
    createdAt: "2024-01-17",
    precoFipe: 16000,
    percFipe: -53,
    distancia: "a 1600 km de você",
    scoreConfianca: 20,
    alertaPrecoSuspeito: true,
    fotoDuplicadaFlag: false,
    verificacaoLocalizacao: locSemDados("Salvador", "BA"),
    situacaoDocumental: docEmpresaExtintaSucata,
  },
];

// ============ CONVERSAS (5) ============

export const mockConversations: Conversation[] = [
  // conv_01: u5 ↔ u1, anúncio l1 (Opala)
  { id: "c1", anuncioId: "l1", compradorId: "u5", vendedorId: "u1" },
  // conv_02: u3 ↔ u2, anúncio l3 (Galaxie)
  { id: "c2", anuncioId: "l3", compradorId: "u3", vendedorId: "u2" },
  // conv_03: u4 ↔ u1, anúncio l5 (Charger)
  { id: "c3", anuncioId: "l5", compradorId: "u4", vendedorId: "u1", suspeita: true },
  // conv_04: u6 ↔ u2, anúncio l8 (Corcel)
  { id: "c4", anuncioId: "l8", compradorId: "u6", vendedorId: "u2" },
  // conv_05: u8 ↔ u3, anúncio l2 (Fusca)
  { id: "c5", anuncioId: "l2", compradorId: "u8", vendedorId: "u3", suspeita: true },
];

// ============ MENSAGENS ============

function mkMsg(
  id: string, conversaId: string, autorId: string, texto: string, ts: string,
  ip: string, cidade: string, estado: string, suspeito = false,
  status: "sent" | "delivered" | "read" = "read",
): ChatMessage {
  return { id, conversaId, autorId, texto, timestamp: ts, status, ip_address: ip, ip_cidade: cidade, ip_estado: estado, padraoSuspeito: suspeito };
}

export const mockMessages: ChatMessage[] = [
  // conv_01: u5 ↔ u1 (Opala) — IPs São Paulo
  mkMsg("m01","c1","u5","Olá! O Opala 1979 ainda está disponível?","2024-01-20 09:00","189.45.12.10","Porto Alegre","RS"),
  mkMsg("m02","c1","u1","Bom dia! Sim, ainda disponível. Tenho interesse em mostrar o carro pessoalmente.","2024-01-20 09:15","177.32.15.201","São Paulo","SP"),
  mkMsg("m03","c1","u5","Que ótimo! Qual o histórico de manutenção? Tem comprovantes?","2024-01-20 09:30","189.45.12.10","Porto Alegre","RS"),
  mkMsg("m04","c1","u1","Tenho caderneta de revisões desde 2010. Motor revisado em 2022 com nota fiscal.","2024-01-20 09:45","177.32.15.201","São Paulo","SP"),
  mkMsg("m05","c1","u5","Aceita R$ 35.000 à vista?","2024-01-20 10:00","189.45.12.10","Porto Alegre","RS"),
  mkMsg("m06","c1","u1","É um pouco abaixo do que esperava, mas podemos conversar. Quando pode vir ver?","2024-01-20 10:20","177.32.15.201","São Paulo","SP"),

  // conv_02: u3 ↔ u2 (Galaxie) — IPs MG e RJ
  mkMsg("m07","c2","u3","Boa tarde! Tenho interesse no Galaxie 500. Aceita troca com complemento?","2024-01-19 14:00","201.17.45.88","Belo Horizonte","MG"),
  mkMsg("m08","c2","u2","Boa tarde, Carlos! Depende do veículo oferecido. O que tem para oferecer?","2024-01-19 14:20","187.50.22.33","Rio de Janeiro","RJ"),
  mkMsg("m09","c2","u3","Tenho um Maverick 1977 bem conservado. Faço troca mais R$ 40.000.","2024-01-19 14:35","201.17.45.88","Belo Horizonte","MG"),
  mkMsg("m10","c2","u2","Preciso ver fotos do Maverick. Manda pelo chat.","2024-01-19 14:50","187.50.22.33","Rio de Janeiro","RJ"),
  mkMsg("m11","c2","u3","Mando as fotos ainda hoje. Quando posso agendar visita ao Galaxie?","2024-01-19 15:05","201.17.45.88","Belo Horizonte","MG"),
  mkMsg("m12","c2","u2","[Oferta automática gerada] Proposta formal de R$92.000 registrada no sistema.","2024-01-19 15:10","187.50.22.33","Rio de Janeiro","RJ"),

  // conv_03: u4 ↔ u1 (Charger) — IPs PR e SP — padrão suspeito na msg_3
  mkMsg("m13","c3","u4","Olá! Vi o Charger RT, está disponível?","2024-01-18 10:00","200.45.33.21","Curitiba","PR"),
  mkMsg("m14","c3","u1","Sim, disponível! Carro em estado de coleção.","2024-01-18 10:15","177.32.15.201","São Paulo","SP"),
  mkMsg("m15","c3","u4","posso fazer pix agora de reserva R$ 5.000 pra garantir","2024-01-18 10:30","200.45.33.21","Curitiba","PR", true),
  mkMsg("m16","c3","u1","Prefiro não receber reserva antes de você ver o veículo pessoalmente. Segurança de ambos.","2024-01-18 10:45","177.32.15.201","São Paulo","SP"),
  mkMsg("m17","c3","u4","Entendo. Posso ir no sábado?","2024-01-18 11:00","200.45.33.21","Curitiba","PR"),
  mkMsg("m18","c3","u1","Sábado de manhã perfeito. Te mando o endereço.","2024-01-18 11:10","177.32.15.201","São Paulo","SP"),

  // conv_04: u6 ↔ u2 (Corcel) — IPs GO e RJ
  mkMsg("m19","c4","u6","Boa noite! Esse Corcel II GT ainda está à venda?","2024-01-17 20:00","177.98.45.10","Goiânia","GO"),
  mkMsg("m20","c4","u2","Boa noite! Sim, ainda disponível. Lindo carro!","2024-01-17 20:15","187.50.22.33","Rio de Janeiro","RJ"),
  mkMsg("m21","c4","u6","Aceita R$ 19.000?","2024-01-17 20:30","177.98.45.10","Goiânia","GO"),
  mkMsg("m22","c4","u2","Meu preço mínimo é R$ 21.000. Posso fazer por esse valor.","2024-01-17 20:45","187.50.22.33","Rio de Janeiro","RJ"),
  mkMsg("m23","c4","u6","Fechado por R$ 21.000. Como procedemos?","2024-01-17 21:00","177.98.45.10","Goiânia","GO"),
  mkMsg("m24","c4","u2","Ótimo! Vamos agendar visita e vistoria juntos antes de fechar.","2024-01-17 21:15","187.50.22.33","Rio de Janeiro","RJ"),

  // conv_05: u8 ↔ u3 (Fusca) — IPs BA e MG — padrão suspeito na msg_2
  mkMsg("m25","c5","u8","Olá! Fusca 1972 ainda disponível?","2024-01-16 08:00","200.10.55.88","Salvador","BA"),
  mkMsg("m26","c5","u8","meu whatsapp é (71) 99999-1234 pode me chamar lá","2024-01-16 08:02","200.10.55.88","Salvador","BA", true),
  mkMsg("m27","c5","u3","Prefiro manter o contato aqui pelo chat por segurança. O Fusca está disponível sim!","2024-01-16 08:30","201.17.45.88","Belo Horizonte","MG"),
  mkMsg("m28","c5","u8","Tudo bem. Qual o menor valor?","2024-01-16 08:45","200.10.55.88","Salvador","BA"),
  mkMsg("m29","c5","u3","Posso fazer por R$ 11.500 à vista.","2024-01-16 09:00","201.17.45.88","Belo Horizonte","MG"),
  mkMsg("m30","c5","u8","Preciso pensar. Me dá alguns dias?","2024-01-16 09:15","200.10.55.88","Salvador","BA"),
];

// ============ DENÚNCIAS (5) ============

export const mockReports: Report[] = [
  { id: "rep01", listingId: "l14", reason: "Informações falsas", reporter: "u3", date: "2024-01-20", status: "aberta" },
  { id: "rep02", listingId: "l15", reason: "Golpe", reporter: "u4", date: "2024-01-19", status: "analise" },
  { id: "rep03", listingId: "l7",  reason: "Anúncio duplicado", reporter: "u5", date: "2024-01-18", status: "aberta" },
  { id: "rep04", listingId: "l11", reason: "Veículo não existe", reporter: "u6", date: "2024-01-17", status: "aberta" },
  // report_05 é sobre perfil de usuário — usamos listingId para armazenar o userId do denunciado
  { id: "rep05", listingId: "u7",  reason: "Vendedor suspeito", reporter: "u2", date: "2024-01-16", status: "aberta" },
];

// ============ CADASTROS PENDENTES (3) ============

export const mockPendingRegistrations: PendingRegistration[] = [
  { id: "p1", nome: "Carlos Mendes",       email: "carlosmend@email.com", data: "2024-01-15" },
  { id: "p2", nome: "Ana Paula Rocha",     email: "anarocha@email.com",   data: "2024-01-14" },
  { id: "p3", nome: "Roberto Figueiredo",  email: "robertof@email.com",   data: "2024-01-13" },
];

// ============ PAGAMENTOS (6) ============

export const mockPayments: Payment[] = [
  { id: "pay01", userId: "u1", plan: "Premium",  amount: 29.90, date: "2024-01-05", status: "pago" },
  { id: "pay02", userId: "u2", plan: "Premium",  amount: 29.90, date: "2024-01-06", status: "pago" },
  { id: "pay03", userId: "u6", plan: "Premium",  amount: 29.90, date: "2024-01-07", status: "pago" },
  { id: "pay04", userId: "u1", plan: "Premium",  amount: 29.90, date: "2023-12-05", status: "pago" },
  { id: "pay05", userId: "u3", plan: "Premium",  amount: 29.90, date: "2023-12-06", status: "falhou" },
  { id: "pay06", userId: "u8", plan: "Premium",  amount: 29.90, date: "2024-01-10", status: "pendente" },
];

// ============ BLOG (8 artigos) ============

export const mockBlogPosts: BlogPost[] = [
  {
    id: "art01",
    slug: "historia-opala",
    titulo: "História do Opala: o ícone do automobilismo brasileiro",
    categoria: "Cultura",
    excerpt: "Descubra como o Chevrolet Opala se tornou o símbolo máximo da indústria automotiva nacional.",
    conteudo: `O Chevrolet Opala foi produzido no Brasil entre 1968 e 1992, sendo um dos automóveis mais amados pelos brasileiros. Lançado em um período de grande efervescência econômica e política, o Opala rapidamente conquistou o coração dos motoristas nacionais com seu design elegante e motorização robusta.

Durante os anos 1970, o Opala dominou as pistas do automobilismo brasileiro na Stock Car, tornando-se sinônimo de velocidade e performance. Pilotos lendários como Chico Landi e Paulo Gomes escreveram capítulos históricos ao volante deste carro, consolidando seu status de ícone nacional.

A versão SS (Super Sport) e o topo de linha Diplomata foram as jóias da coroa desta família, com interiores luxuosos e motores de alta performance. O motor seis cilindros 4.1 litros era temido e respeitado nas ruas e estradas do Brasil, entregando uma sonoridade única que ainda hoje faz os colecionadores suspirarem.

Hoje, o Opala é um dos clássicos mais valorizados do mercado brasileiro, com exemplares bem conservados atingindo valores expressivos. Clubes de proprietários espalhados pelo Brasil mantêm viva a chama desta história automotiva, realizando encontros e preservando exemplares originais para as futuras gerações.`,
    imagemCapa: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    tempoLeitura: "8 min",
    dataPublicacao: "2024-01-10",
    status: "Publicado",
    anunciosRelacionados: ["l1", "l3"],
  },
  {
    id: "art02",
    slug: "avaliar-fusca",
    titulo: "Como avaliar um Fusca antes de comprar",
    categoria: "Guias",
    excerpt: "Guia completo com tudo o que você precisa verificar ao comprar um Volkswagen Fusca.",
    conteudo: `O Volkswagen Fusca é um dos carros clássicos mais negociados no Brasil, o que infelizmente atrai tanto oportunidades excelentes quanto armadilhas para compradores desavisados. Saber o que verificar antes de fechar negócio pode economizar muito dinheiro e dor de cabeça.

O primeiro ponto de atenção é o chassi. No Fusca, o número do chassi fica estampado em uma plaqueta na frente do painel, visível pelo para-brisa, e também gravado no próprio assoalho. Confira se os números conferem com o documento e se não há sinais de adulteração. Chassis remarados ou ilegíveis são um alerta vermelho imediato.

A parte mecânica deve ser inspecionada com atenção especial ao motor traseiro. Verifique vazamentos de óleo na tampa do motor, estado das mangueiras do sistema de aquecimento, e funcionamento do câmbio e embreagem. O barulho de \"tuc-tuc\" no motor pode indicar desgaste de tuchos, problema comum e de custo moderado de reparo.

Não se esqueça de verificar a carroceria embaixo do carro. O Fusca é susceptível à ferrugem nos longarinas e nos quadros das portas traseiras. Use um ímã para identificar áreas com massa. Por fim, sempre exija a realização de vistoria cautelar antes de qualquer pagamento — é um investimento que protege sua compra.`,
    imagemCapa: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    tempoLeitura: "12 min",
    dataPublicacao: "2024-01-08",
    status: "Publicado",
    anunciosRelacionados: ["l2"],
  },
  {
    id: "art03",
    slug: "classicos-valorizados",
    titulo: "Os 10 clássicos mais valorizados do Brasil",
    categoria: "Mercado",
    excerpt: "Ranking dos modelos que mais valorizaram nos últimos anos e por que continuam sendo boas apostas.",
    conteudo: `O mercado de automóveis clássicos brasileiros vive um momento de expansão sem precedentes. Com a valorização do dólar encarecendo importações e uma geração de colecionadores chegando à maturidade financeira, os clássicos nacionais estão se tornando ativos cada vez mais cobiçados.

No topo da lista de valorização está o Ford Galaxie 500, cuja raridade e apelo internacional o colocam em destaque. Exemplares em bom estado chegam a valores entre R$ 80.000 e R$ 150.000, com tendência de alta contínua. O Dodge Charger RT também ocupa posição privilegiada, especialmente as versões 318 e 383 que chegaram ao Brasil.

O Puma GTE é outra aposta sólida — o único esportivo genuinamente brasileiro da época, com carroceria de fibra de vidro e motor Volkswagen. Sua raridade garante valorização constante. O Chevrolet Opala, especialmente as versões SS e Diplomata, completa o pódio dos mais valorizados.

Entre os acessíveis com potencial de valorização, destacam-se o Ford Maverick GT, a VW Variant e o Willys Rural. Estes modelos ainda podem ser encontrados por preços razoáveis e tendem a se valorizar à medida que exemplares originais vão escasseando. A regra de ouro é sempre buscar o maior grau de originalidade possível.`,
    imagemCapa: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80",
    tempoLeitura: "10 min",
    dataPublicacao: "2024-01-06",
    status: "Publicado",
    anunciosRelacionados: [],
  },
  {
    id: "art04",
    slug: "restauracao-passo-passo",
    titulo: "Restauração passo a passo: como resgatar um clássico",
    categoria: "Restauração",
    excerpt: "Aprenda a planejar e executar uma restauração de clássico sem desperdício de dinheiro.",
    conteudo: `Restaurar um clássico é uma jornada apaixonante que exige planejamento cuidadoso, paciência e um bom entendimento dos custos envolvidos. Antes de comprar um carro para restaurar, é fundamental avaliar o grau de trabalho necessário e ter uma estimativa realista dos gastos.

O primeiro passo é a avaliação da carroceria. Ferrugem estrutural nos longarinas, colunas e assoalho pode inviabilizar economicamente uma restauração ou torná-la muito cara. Use um profissional de funilaria experiente em clássicos para avaliar a extensão dos danos antes de comprar o veículo. Uma carroceria sadia, mesmo com pintura ruim, vale muito mais do que uma carroceria comprometida com pintura bonita.

A parte mecânica deve ser abordada de forma sistemática: motor, câmbio, suspensão e freios. Comece sempre pelos freios — segurança é prioridade. Em seguida, ataque o motor com uma revisão completa. Documente tudo com fotos e guarde cada peça removida, pois pode ser necessário reaproveitá-las ou usá-las como referência para novas peças.

A fase de pintura e acabamento é a mais visível e a que exige maior investimento. Fuja de atalhos como pintura sobre massa grossa — isso esconde problemas que voltarão em poucos anos. Opte por jateamento, tratamento anticorrosivo e pintura em cabine com tinta de alta qualidade. O resultado valerá cada centavo.`,
    imagemCapa: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80",
    tempoLeitura: "15 min",
    dataPublicacao: "2024-01-04",
    status: "Publicado",
    anunciosRelacionados: [],
  },
  {
    id: "art05",
    slug: "guia-documentacao",
    titulo: "Guia completo de documentação de clássicos",
    categoria: "Documentação",
    excerpt: "Entenda IPVA, CRLV, transferência e tudo mais sobre a burocracia dos clássicos brasileiros.",
    conteudo: `A documentação é um dos aspectos mais críticos na compra de um automóvel clássico. Diferentemente de carros modernos, os clássicos frequentemente acumulam históricos documentais complexos que precisam ser entendidos e regularizados antes da transação.

O IPVA de veículos com mais de 30 anos é isento em praticamente todos os estados brasileiros, o que é uma vantagem significativa. No entanto, mesmo com isenção, o licenciamento anual é obrigatório. Veículos com licenciamento em atraso têm restrição de circulação e podem gerar multas acumuladas que precisam ser quitadas pelo comprador.

A situação do chassi é fundamental — um chassi ilegível, recarimbado ou não localizado é sinal de alerta grave. O número do chassi deve conferir exatamente com o Certificado de Registro do Veículo (CRV). Qualquer divergência precisa ser esclarecida antes da compra, pois pode indicar clonagem ou adulteração.

Para transferência de propriedade, você precisará do CRV assinado pelo vendedor, comprovante de quitação de IPVA e licenciamento, laudos de vistoria e o DUT (Documento Único de Transferência) preenchido. Em casos de documento em nome de terceiros, falecidos ou empresas extintas, o processo é mais complexo e pode exigir ação judicial ou extrajudicial. Sempre consulte um despachante especializado em clássicos.`,
    imagemCapa: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    tempoLeitura: "18 min",
    dataPublicacao: "2024-01-02",
    status: "Publicado",
    anunciosRelacionados: [],
  },
  {
    id: "art06",
    slug: "pecas-raras",
    titulo: "Mercado de peças raras: onde encontrar",
    categoria: "Peças",
    excerpt: "Os melhores lugares para garimpar peças originais para seu clássico.",
    conteudo: `Encontrar peças originais para clássicos brasileiros pode ser um desafio, mas existem vários caminhos que os restauradores experientes conhecem. O segredo está em saber onde e como procurar, além de construir uma rede de contatos no mundo dos clássicos.

Os encontros e shows de clássicos são excelentes oportunidades para encontrar peças raras. Nestas ocasiões, colecionadores e comerciantes de peças reúnem-se em um mesmo local, facilitando a busca por itens específicos. Leve sempre a lista do que você precisa e fotos de referência para facilitar a identificação.

Os grupos especializados nas redes sociais são outra fonte valiosa. Clubes de proprietários de modelos específicos — como o Clube do Opala ou o Clube do Fusca — concentram pessoas que conhecem profundamente cada detalhe do veículo e frequentemente têm ou sabem onde encontrar as peças buscadas.

Os ferros-velhos especializados em veículos antigos existem em várias capitais brasileiras e merecem visita presencial. Em São Paulo, a região da Avenida Pompeia concentra diversos estabelecimentos especializados. Nestes locais, é possível encontrar desde peças mecânicas até itens de acabamento e decoração.`,
    imagemCapa: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&q=80",
    tempoLeitura: "9 min",
    dataPublicacao: "2024-01-14",
    status: "Rascunho",
    anunciosRelacionados: [],
  },
  {
    id: "art07",
    slug: "investir-classicos",
    titulo: "Investir em clássicos vale a pena?",
    categoria: "Mercado",
    excerpt: "Análise dos retornos financeiros e dos riscos do mercado de clássicos no Brasil.",
    conteudo: `O automóvel clássico como investimento é uma realidade consolidada em países como Estados Unidos, Inglaterra e Alemanha, mas no Brasil ainda está em fase de maturação. A pergunta que muitos fazem é: vale a pena investir em clássicos brasileiros?

Os números são encorajadores. Modelos como o Ford Galaxie, o Dodge Charger e o Puma GTE valorizaram em média 15% ao ano nos últimos cinco anos, superando a maioria dos investimentos financeiros tradicionais no mesmo período. O segredo está na seleção criteriosa do exemplar — originalidade, conservação e raridade são os fatores que mais impactam a valorização.

Os custos de manutenção devem ser considerados no cálculo de retorno. Um clássico bem conservado pode ter custos relativamente baixos de manutenção se revisado preventivamente. Os gastos com seguro, garagem climatizada e manutenção anual devem ser deduzidos do retorno bruto para obter o retorno real do investimento.

O aspecto emocional não deve ser ignorado — muitos colecionadores relatam que o prazer de possuir e usar o veículo é parte importante do retorno. Um Opala ou um Fusca nas ruas atrai olhares e sorrisos, proporcionando experiências que nenhum investimento financeiro pode replicar. Para maximizar o retorno, compre sempre o melhor exemplar que puder pagar, prefira versões raras e mantenha a originalidade.`,
    imagemCapa: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
    tempoLeitura: "11 min",
    dataPublicacao: "2024-01-12",
    status: "Publicado",
    anunciosRelacionados: [],
  },
  {
    id: "art08",
    slug: "cuidados-motor",
    titulo: "Cuidados essenciais com motor antigo",
    categoria: "Manutenção",
    excerpt: "Como manter um motor clássico funcionando bem por décadas.",
    conteudo: `Os motores de veículos clássicos foram projetados para durar décadas — e muitos deles estão cumprindo essa promessa após mais de 50 anos. No entanto, a longevidade depende de cuidados específicos que diferem dos carros modernos com injeção eletrônica e controle computadorizado.

O óleo de motor é a vida do propulsor clássico. Motores de carburador sem filtros modernos são mais susceptíveis à contaminação do óleo por combustível e resíduos de combustão. A troca deve ser realizada com frequência maior do que recomendado para carros modernos — a cada 3.000 km ou 3 meses, o que vier primeiro. Utilize lubrificantes com aditivo ZDDP (zinco dithiofosfato), essencial para motores com came no bloco, comum nos clássicos.

O sistema de arrefecimento merece atenção especial. A maioria dos clássicos usa termostato de abertura em temperaturas mais baixas do que os modernos. Troque o fluido de arrefecimento a cada dois anos e verifique periodicamente o estado das mangueiras e conexões. Superaquecimento é o maior inimigo de um motor antigo.

O carburador é o coração da alimentação e requer regulagem periódica. Aprenda a fazer a regulagem básica de marcha lenta e mistura ar/combustível — são ajustes simples que fazem grande diferença no desempenho e consumo. Mantenha sempre um kit de reparo do carburador como parte do kit de emergência do veículo.`,
    imagemCapa: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80",
    tempoLeitura: "7 min",
    dataPublicacao: "2024-01-16",
    status: "Rascunho",
    anunciosRelacionados: [],
  },
];

// ============ AVALIAÇÕES (10) ============

export const mockReviews: Review[] = [
  // u1 recebe 4 avaliações
  {
    id: "rv01", vendedorId: "u1", compradorId: "u5", reviewerNome: "Pedro Oliveira", data: "2023-12-10",
    criterios: { honestidade: 5, comunicacao: 5, veiculoComoDescrito: 5 },
    comentario: "Vendedor excepcional! João foi completamente transparente sobre o estado do Opala. Carro exatamente como descrito, sem surpresas.",
    respostaVendedor: "Muito obrigado Pedro! Foi um prazer negociar com você. Bom uso do Opala!",
  },
  {
    id: "rv02", vendedorId: "u1", compradorId: "u4", reviewerNome: "Ana Ferreira", data: "2023-10-15",
    criterios: { honestidade: 5, comunicacao: 4, veiculoComoDescrito: 5 },
    comentario: "Excelente experiência de compra. João sabe muito sobre o carro e é honesto com qualquer defeito.",
    respostaVendedor: null,
  },
  {
    id: "rv03", vendedorId: "u1", compradorId: "u6", reviewerNome: "Sandra Costa", data: "2023-08-22",
    criterios: { honestidade: 5, comunicacao: 5, veiculoComoDescrito: 4 },
    comentario: "Negociação justa e transparente. Recomendo fortemente.",
    respostaVendedor: "Obrigado Sandra! Sempre à disposição.",
  },
  {
    id: "rv04", vendedorId: "u1", compradorId: "u3", reviewerNome: "Carlos Lima", data: "2023-06-05",
    criterios: { honestidade: 4, comunicacao: 5, veiculoComoDescrito: 5 },
    comentario: "Compra sem complicação, documentação toda em ordem.",
    respostaVendedor: "Valeu Carlos! Qualquer dúvida pode me contatar.",
  },
  // u2 recebe 3 avaliações
  {
    id: "rv05", vendedorId: "u2", compradorId: "u3", reviewerNome: "Carlos Lima", data: "2023-11-20",
    criterios: { honestidade: 5, comunicacao: 5, veiculoComoDescrito: 5 },
    comentario: "Maria é uma vendedora incrível! Carro exatamente como descrito nas fotos.",
    respostaVendedor: "Obrigada Carlos! Feliz que ficou satisfeito.",
  },
  {
    id: "rv06", vendedorId: "u2", compradorId: "u5", reviewerNome: "Pedro Oliveira", data: "2023-09-08",
    criterios: { honestidade: 4, comunicacao: 4, veiculoComoDescrito: 4 },
    comentario: "Boa vendedora, demorou um pouco para responder mas foi honesta.",
    respostaVendedor: null,
  },
  {
    id: "rv07", vendedorId: "u2", compradorId: "u4", reviewerNome: "Ana Ferreira", data: "2023-07-14",
    criterios: { honestidade: 5, comunicacao: 4, veiculoComoDescrito: 5 },
    comentario: "Ótima experiência. Recomendo!",
    respostaVendedor: "Muito obrigada Ana!",
  },
  // u6 recebe 3 avaliações
  {
    id: "rv08", vendedorId: "u6", compradorId: "u1", reviewerNome: "João Carvalho", data: "2023-12-01",
    criterios: { honestidade: 4, comunicacao: 5, veiculoComoDescrito: 4 },
    comentario: "Sandra é muito atenciosa e transparente na negociação.",
    respostaVendedor: "Obrigada João! Fico feliz que tenha ficado satisfeito.",
  },
  {
    id: "rv09", vendedorId: "u6", compradorId: "u3", reviewerNome: "Carlos Lima", data: "2023-10-10",
    criterios: { honestidade: 5, comunicacao: 5, veiculoComoDescrito: 5 },
    comentario: "Maverick em perfeito estado. Sandra é uma vendedora confiável.",
    respostaVendedor: null,
  },
  {
    id: "rv10", vendedorId: "u6", compradorId: "u5", reviewerNome: "Pedro Oliveira", data: "2023-08-30",
    criterios: { honestidade: 4, comunicacao: 4, veiculoComoDescrito: 3 },
    comentario: "Carro precisava de alguns ajustes que não foram mencionados no anúncio, mas Sandra se comprometeu a ajudar.",
    respostaVendedor: "Pedro, lamento pela situação. Vou ser mais detalhado nos próximos anúncios.",
  },
];

// ============ FAVORITOS (20) ============

export const mockFavorites: Favorite[] = [
  { id: "fav01", usuarioId: "u1", anuncioId: "l2",  salvoEm: "2024-01-18" },
  { id: "fav02", usuarioId: "u1", anuncioId: "l7",  salvoEm: "2024-01-17" },
  { id: "fav03", usuarioId: "u2", anuncioId: "l1",  salvoEm: "2024-01-19" },
  { id: "fav04", usuarioId: "u2", anuncioId: "l5",  salvoEm: "2024-01-16" },
  { id: "fav05", usuarioId: "u2", anuncioId: "l10", salvoEm: "2024-01-15" },
  { id: "fav06", usuarioId: "u3", anuncioId: "l1",  salvoEm: "2024-01-20" },
  { id: "fav07", usuarioId: "u3", anuncioId: "l5",  salvoEm: "2024-01-14" },
  { id: "fav08", usuarioId: "u3", anuncioId: "l8",  salvoEm: "2024-01-13" },
  { id: "fav09", usuarioId: "u4", anuncioId: "l3",  salvoEm: "2024-01-20" },
  { id: "fav10", usuarioId: "u4", anuncioId: "l10", salvoEm: "2024-01-12" },
  { id: "fav11", usuarioId: "u5", anuncioId: "l1",  salvoEm: "2024-01-20" },
  { id: "fav12", usuarioId: "u5", anuncioId: "l3",  salvoEm: "2024-01-11" },
  { id: "fav13", usuarioId: "u6", anuncioId: "l1",  salvoEm: "2024-01-09" },
  { id: "fav14", usuarioId: "u6", anuncioId: "l3",  salvoEm: "2024-01-08" },
  { id: "fav15", usuarioId: "u6", anuncioId: "l8",  salvoEm: "2024-01-07" },
  { id: "fav16", usuarioId: "u8", anuncioId: "l10", salvoEm: "2024-01-06" },
  { id: "fav17", usuarioId: "u8", anuncioId: "l6",  salvoEm: "2024-01-05" },
  { id: "fav18", usuarioId: "u3", anuncioId: "l10", salvoEm: "2024-01-04" },
  { id: "fav19", usuarioId: "u4", anuncioId: "l6",  salvoEm: "2024-01-03" },
  { id: "fav20", usuarioId: "u5", anuncioId: "l8",  salvoEm: "2024-01-02" },
];

// ============ ANÚNCIOS FLAGADOS ============

export const mockFlaggedListings: FlaggedListing[] = [
  { id: "f1", anuncioId: "l4",  motivo: "Preço suspeitamente baixo", data: "2024-01-20", absolvido: false },
  { id: "f2", anuncioId: "l7",  motivo: "Preço suspeito + foto duplicada", data: "2024-01-19", absolvido: false },
  { id: "f3", anuncioId: "l9",  motivo: "Preço suspeitamente baixo", data: "2024-01-18", absolvido: false },
  { id: "f4", anuncioId: "l14", motivo: "Preço suspeito + divergência IP + EXIF", data: "2024-01-17", absolvido: false },
  { id: "f5", anuncioId: "l15", motivo: "Preço suspeitamente baixo", data: "2024-01-16", absolvido: false },
  { id: "f6", anuncioId: "l11", motivo: "Foto duplicada + divergência IP", data: "2024-01-15", absolvido: false },
];

// ============ TENTATIVAS BLOQUEADAS ============

export const mockBlockedAttempts: BlockedAttempt[] = [
  { id: "b1", dado: "192.168.1.45 (IP)", motivo: "IP repetido - 5 tentativas em 1h", timestamp: "2024-01-20 14:30" },
  { id: "b2", dado: "CPF 123.456.789-00", motivo: "CPF de usuário banido", timestamp: "2024-01-19 09:15" },
  { id: "b3", dado: "FP_ABC123 (Fingerprint)", motivo: "Fingerprint de conta banida (user_07)", timestamp: "2024-01-18 22:45" },
];

// ============ DADOS AUXILIARES ============

export const mockPlans = [
  { id: "pl1", name: "Gratuito", price: 0, limit: 3, photos: 5, featured: false },
  { id: "pl2", name: "Premium Mensal", price: 29.90, limit: 20, photos: 15, featured: true },
  { id: "pl3", name: "Premium Anual", price: 299, limit: 50, photos: 30, featured: true },
];

export const mockActivity = [
  { id: "a1", type: "listing", text: "Novo anúncio: Opala 1979 Azul Metálico", time: "há 2h" },
  { id: "a2", type: "user",    text: "Novo usuário: Lucia Souza (alerta fingerprint)", time: "há 3h" },
  { id: "a3", type: "report",  text: "Denúncia: Gordini 1969 — informações falsas", time: "há 4h" },
  { id: "a4", type: "listing", text: "Anúncio removido: Gordini 1969 (fraude)", time: "há 5h" },
  { id: "a5", type: "user",    text: "Usuário suspenso: Roberto Melo (3 denúncias)", time: "há 6h" },
  { id: "a6", type: "listing", text: "Novo anúncio: Dodge Charger RT 1975", time: "há 1d" },
  { id: "a7", type: "report",  text: "Denúncia resolvida: Veraneio C10 — duplicado", time: "há 1d" },
  { id: "a8", type: "user",    text: "Plano Premium ativado: Sandra Costa", time: "há 2d" },
  { id: "a9", type: "listing", text: "Novo anúncio: Puma GTE 1974", time: "há 2d" },
  { id: "a10",type: "user",    text: "Novo cadastro: Carlos Mendes (aprovação pendente)", time: "há 3d" },
];

export const mockWeeklySignups = [
  { week: "S1", count: 8  },
  { week: "S2", count: 14 },
  { week: "S3", count: 11 },
  { week: "S4", count: 19 },
  { week: "S5", count: 23 },
  { week: "S6", count: 17 },
  { week: "S7", count: 28 },
  { week: "S8", count: 32 },
];

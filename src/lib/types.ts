export type Category = "completo" | "fazer" | "pecas";

export const CATEGORY_LABELS: Record<Category, string> = {
  completo: "Carro completo",
  fazer: "Para fazer",
  pecas: "Para peças",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  completo: "#1D6E4E",
  fazer: "#185FA5",
  pecas: "#993C1D",
};

export type ListingStatus = "ativo" | "pausado" | "removido" | "pendente";
export type UserStatus = "ativo" | "suspenso" | "banido";
export type Plan = "gratuito" | "premium";

export interface Verificacoes {
  email: boolean;
  telefone: boolean;
  cpf: boolean;
  kyc: boolean;
}

export interface IpEntry {
  ip: string;
  cidade: string;
  estado: string;
  timestamp: string;
}

export type LocalizacaoBadge = "verificada" | "provavel" | "semDados" | "divergencia";

export interface VerificacaoLocalizacao {
  badge: LocalizacaoBadge;
  fonteA: string;
  fonteB: string | null;
  fonteC: string | null;
}

export type DocumentoNome = "proprio" | "terceiro" | "falecido" | "empresaExtinta" | "desconhecido";
export type TransferenciasAcc = "nenhuma" | "1a2" | "3oumais" | "naosei";
export type IpvaStatus = "emDia" | "isentoAntiguidade" | "atrasado" | "naoSeAplica";
export type LicenciamentoStatus = "emDia" | "atrasado" | "nuncaLicenciadoEstado" | "sucata" | "semPlaca";
export type ChassiStatus = "visivelLegivel" | "parcialmenteLegivel" | "ilegivel" | "recarimbado" | "naoLocalizado";
export type MotorStatus = "original" | "trocadoMesmaFamilia" | "trocadoDiferente" | "semNumero";
export type MultasStatus = "nenhuma" | "comMultas" | "naoVerificado";
export type AjudaRegularizacao = "sim" | "parcialmente" | "nao";

export interface SituacaoDocumental {
  documentoNome: DocumentoNome;
  transferenciasAcumuladas: TransferenciasAcc;
  ipva: IpvaStatus;
  ipvaAnosAtraso: number | null;
  licenciamento: LicenciamentoStatus;
  chassi: ChassiStatus;
  motor: MotorStatus;
  multas: MultasStatus;
  multasValor: number | null;
  aceitaAjudarRegularizacao: AjudaRegularizacao;
  documentosFisicos: string[];
}

export interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  category: Category;
  engine: string;
  color: string;
  km: number;
  chassi: string;
  documento: string;
  price: number | null;
  description: string;
  photos: string[];
  city: string;
  state: string;
  sellerId: string;
  status: ListingStatus;
  createdAt: string;
  precoFipe: number;
  percFipe: number;
  distancia: string;
  scoreConfianca: number;
  alertaPrecoSuspeito: boolean;
  fotoDuplicadaFlag: boolean;
  verificacaoLocalizacao: VerificacaoLocalizacao;
  situacaoDocumental: SituacaoDocumental;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  plan: Plan;
  status: UserStatus;
  memberSince: string;
  responseRate: number;
  avatar?: string;
  role: "user" | "admin";
  approved: boolean;
  verificacoes: Verificacoes;
  fingerprints: string[];
  ipsRecentes: IpEntry[];
  taxaResposta: number;
  tempoMedioResposta: string;
  carrosVendidos: number;
  sellerScore: number;
  badges?: string[];
  denunciasProcedentesCont?: number;
}

export interface Report {
  id: string;
  listingId: string;
  reason: string;
  reporter: string;
  date: string;
  status: "aberta" | "analise" | "resolvida";
}

export interface Payment {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  date: string;
  status: "pago" | "pendente" | "falhou";
}

export type MsgStatus = "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  conversaId: string;
  autorId: string;
  texto: string;
  timestamp: string;
  status: MsgStatus;
  ip_address: string;
  ip_cidade: string;
  ip_estado: string;
  padraoSuspeito: boolean;
}

export interface Conversation {
  id: string;
  anuncioId: string;
  compradorId: string;
  vendedorId: string;
  suspeita?: boolean;
}

export interface Review {
  id: string;
  vendedorId: string;
  compradorId: string;
  reviewerNome: string;
  data: string;
  criterios: {
    honestidade: number;
    comunicacao: number;
    veiculoComoDescrito: number;
  };
  comentario: string;
  respostaVendedor: string | null;
}

export interface Favorite {
  id: string;
  usuarioId: string;
  anuncioId: string;
  salvoEm: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  excerpt: string;
  conteudo: string;
  imagemCapa: string;
  tempoLeitura: string;
  dataPublicacao: string;
  status: "Publicado" | "Rascunho";
  anunciosRelacionados: string[];
}

export interface FlaggedListing {
  id: string;
  anuncioId: string;
  motivo: string;
  data: string;
  absolvido: boolean;
}

export interface PendingRegistration {
  id: string;
  nome: string;
  email: string;
  data: string;
}

export interface BlockedAttempt {
  id: string;
  dado: string;
  motivo: string;
  timestamp: string;
}

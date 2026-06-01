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

export type EstadoConservacao =
  | "concursoOriginal"
  | "restauradoCompleto"
  | "originalPreservado"
  | "bomEstadoUso"
  | "precisaReparos"
  | "paraRestaurar";

export type Originalidade =
  | "totalmenteOriginal"
  | "maioriaOriginal"
  | "restauradoOriginal"
  | "restauradoReposicao"
  | "modificadoTuning";

export type Raridade =
  | "unicoConhecido"
  | "muitoRaro"
  | "raro"
  | "incomum"
  | "comum";

export interface PrecificacaoGuiada {
  valor: number | null;
  estadoConservacao: EstadoConservacao;
  originalidade: Originalidade;
  raridade: Raridade;
  justificativa: string;
}

export const ESTADO_LABELS: Record<EstadoConservacao, string> = {
  concursoOriginal: "Estado de concurso / colecionador",
  restauradoCompleto: "Restaurado por completo",
  originalPreservado: "Original preservado",
  bomEstadoUso: "Bom estado, em uso",
  precisaReparos: "Precisa de reparos",
  paraRestaurar: "Para restaurar",
};

export const ORIGINALIDADE_LABELS: Record<Originalidade, string> = {
  totalmenteOriginal: "100% original (matching numbers)",
  maioriaOriginal: "Maioria das peças originais",
  restauradoOriginal: "Restaurado com peças originais",
  restauradoReposicao: "Restaurado com peças de reposição",
  modificadoTuning: "Modificado / customizado",
};

export const RARIDADE_LABELS: Record<Raridade, string> = {
  unicoConhecido: "Único exemplar conhecido",
  muitoRaro: "Muito raro (poucas unidades)",
  raro: "Raro",
  incomum: "Incomum",
  comum: "Comum no mercado",
};

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
  precificacao?: PrecificacaoGuiada;
  distancia: string;
  scoreConfianca: number;
  alertaPrecoSuspeito: boolean;
  fotoDuplicadaFlag: boolean;
  verificacaoLocalizacao: VerificacaoLocalizacao;
  situacaoDocumental: SituacaoDocumental;
  destaquePremium?: boolean;
  destaqueAte?: string;
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
  tipoAlvo?: "anuncio" | "evento" | "servico";
  alvoId?: string;
  descricao?: string;
  evidencias?: ReportEvidence[];
  trilhaAuditoria?: AuditTrailEntry[];
}

export interface ReportEvidence {
  tipo: "url" | "texto" | "imagem";
  valor: string;
  hash?: string;
}

export interface AuditTrailEntry {
  acao: string;
  autorId: string;
  autorNome?: string;
  em: string;
  meta?: Record<string, unknown>;
}

export type StatusModeracao = "pendente" | "aprovado" | "reprovado" | "novas-fotos";

export const STATUS_MODERACAO_LABELS: Record<StatusModeracao, string> = {
  pendente: "Aguardando análise",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  "novas-fotos": "Novas fotos solicitadas",
};

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

// ============ TRACEABILIDADE DE CLASSIFICADOS ============

export interface ImageTrace {
  nome: string;
  tamanhoBytes: number;
  tipoMime: string;
  hashSha256: string;
  capturadoEm?: string;          // EXIF DateTimeOriginal (se disponível)
  camera?: string;               // EXIF Make/Model
  gpsLat?: number;
  gpsLng?: number;
  origemSuspeita: boolean;       // sem EXIF + hash já visto antes
  reutilizadaDeAnuncioId?: string;
}

export interface TraceabilityRecord {
  ip: string;
  cidadeIp: string;
  estadoIp: string;
  userAgent: string;
  fingerprint: string;
  submetidoEm: string;
  imagens: ImageTrace[];
  divergenciaLocalizacao: boolean; // IP estado != anúncio estado
  scoreOrigem: number;             // 0-100
}

// ============ EVENTOS / ENCONTROS / EXPOSIÇÕES ============

export type TipoEvento = "encontro" | "exposicao" | "rally" | "leilao" | "feira";

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  encontro: "Encontro",
  exposicao: "Exposição",
  rally: "Rally / Passeio",
  leilao: "Leilão",
  feira: "Feira",
};

export interface ClassicEvent {
  id: string;
  titulo: string;
  tipo: TipoEvento;
  descricao: string;
  dataInicio: string;            // ISO
  dataFim?: string;
  cidade: string;
  estado: string;
  endereco: string;
  organizadorId: string;
  organizadorNome: string;
  capa: string;
  ingressoUrl?: string;
  precoEntrada?: number | null;  // null = gratuito
  publicoEsperado?: number;
  contato?: string;
  // Campos opcionais para divulgação rica
  horario?: string;                                   // Ex.: "A partir das 9h" ou "8h30 - 15h30"
  destaques?: string[];                               // Lista curta de atrações (premiações, espaço gastronômico, etc.)
  programacao?: { hora: string; atividade: string }[]; // Cronograma do dia
  atracoes?: string[];                                // Bandas, exposições, clubes convidados
  patrocinadores?: string[];                          // Nomes dos patrocinadores / parceiros
  instagram?: string;                                 // @handle ou URL
  site?: string;                                      // URL externa do evento
  regras?: string;                                    // Regras / requisitos para participantes
  observacoes?: string;                               // Outras observações livres
  status: "agendado" | "encerrado" | "cancelado";
  createdAt: string;
  statusModeracao?: StatusModeracao;
  rastreabilidade?: TraceabilityRecord;
  trilhaAuditoria?: AuditTrailEntry[];
  motivoReprovacao?: string;
}

// ============ SERVIÇOS / OFICINAS / AUTO-PEÇAS / CLASSIFICADOS DE PEÇAS ============

export type ServiceKind = "oficina" | "autopeca" | "servico" | "pecaClassificado";

export const SERVICE_KIND_LABELS: Record<ServiceKind, string> = {
  oficina: "Oficina especializada",
  autopeca: "Auto-peças",
  servico: "Serviço",
  pecaClassificado: "Peça à venda",
};

export interface ServiceListing {
  id: string;
  kind: ServiceKind;
  titulo: string;
  descricao: string;
  especialidades: string[];      // ex.: ["Opala", "VW ar"]
  preco?: number | null;         // null = sob consulta (oficinas/serviços), ou preço fixo (peças)
  estoque?: number;              // só para autopeca / pecaClassificado
  fotos: string[];
  cidade: string;
  estado: string;
  endereco?: string;
  anuncianteId: string;
  anuncianteNome: string;
  telefone?: string;
  whatsapp?: string;
  site?: string;
  status: "ativo" | "pausado" | "removido" | "pendente";
  createdAt: string;
  rastreabilidade: TraceabilityRecord;
  scoreConfianca: number;
  statusModeracao?: StatusModeracao;
  trilhaAuditoria?: AuditTrailEntry[];
  motivoReprovacao?: string;
}

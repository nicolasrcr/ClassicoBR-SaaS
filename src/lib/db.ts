/**
 * Data access layer — todas as operações CRUD via Supabase.
 * Mapeia snake_case (DB) ↔ camelCase (TypeScript).
 */
import { supabase } from "./supabase";
import type {
  Listing, User, Conversation, ChatMessage, Report,
  Payment, Review, Favorite, BlogPost, FlaggedListing,
  PendingRegistration, BlockedAttempt, ClassicEvent, ServiceListing,
  AuditTrailEntry, StatusModeracao,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function dbToListing(r: Record<string, unknown>): Listing {
  return {
    id: r.id as string,
    title: r.title as string,
    brand: r.brand as string,
    model: r.model as string,
    year: r.year as number,
    category: r.category as Listing["category"],
    engine: (r.engine ?? "") as string,
    color: (r.color ?? "") as string,
    km: (r.km ?? 0) as number,
    chassi: (r.chassi ?? "") as string,
    documento: (r.documento ?? "") as string,
    price: r.price as number | null,
    description: (r.description ?? "") as string,
    photos: (r.photos ?? []) as string[],
    city: r.city as string,
    state: r.state as string,
    sellerId: (r.seller_id ?? "") as string,
    status: r.status as Listing["status"],
    createdAt: r.created_at as string,
    precificacao: r.precificacao as Listing["precificacao"],
    distancia: (r.distancia ?? "") as string,
    scoreConfianca: (r.score_confianca ?? 0) as number,
    alertaPrecoSuspeito: (r.alerta_preco_suspeito ?? false) as boolean,
    fotoDuplicadaFlag: (r.foto_duplicada_flag ?? false) as boolean,
    verificacaoLocalizacao: (r.verificacao_localizacao ?? { badge: "semDados", fonteA: "", fonteB: null, fonteC: null }) as Listing["verificacaoLocalizacao"],
    situacaoDocumental: (r.situacao_documental ?? {}) as Listing["situacaoDocumental"],
    destaquePremium: (r.destaque_premium ?? false) as boolean,
    destaqueAte: r.destaque_ate as string | undefined,
  };
}

function dbToUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    phone: (r.phone ?? "") as string,
    city: (r.city ?? "") as string,
    state: (r.state ?? "") as string,
    plan: r.plan as User["plan"],
    status: r.status as User["status"],
    memberSince: r.member_since as string,
    responseRate: (r.response_rate ?? 0) as number,
    avatar: r.avatar as string | undefined,
    role: r.role as User["role"],
    approved: (r.approved ?? false) as boolean,
    verificacoes: (r.verificacoes ?? { email: false, telefone: false, cpf: false, kyc: false }) as User["verificacoes"],
    fingerprints: (r.fingerprints ?? []) as string[],
    ipsRecentes: (r.ips_recentes ?? []) as User["ipsRecentes"],
    taxaResposta: (r.taxa_resposta ?? 0) as number,
    tempoMedioResposta: (r.tempo_medio_resposta ?? "-") as string,
    carrosVendidos: (r.carros_vendidos ?? 0) as number,
    sellerScore: (r.seller_score ?? 0) as number,
    badges: r.badges as string[] | undefined,
    denunciasProcedentesCont: (r.denuncias_procedentes_cont ?? 0) as number,
  };
}

function dbToConversation(r: Record<string, unknown>): Conversation {
  return {
    id: r.id as string,
    anuncioId: (r.anuncio_id ?? "") as string,
    compradorId: (r.comprador_id ?? "") as string,
    vendedorId: (r.vendedor_id ?? "") as string,
    suspeita: (r.suspeita ?? false) as boolean,
  };
}

function dbToMessage(r: Record<string, unknown>): ChatMessage {
  return {
    id: r.id as string,
    conversaId: r.conversa_id as string,
    autorId: r.autor_id as string,
    texto: r.texto as string,
    timestamp: r.timestamp as string,
    status: r.status as ChatMessage["status"],
    ip_address: (r.ip_address ?? "") as string,
    ip_cidade: (r.ip_cidade ?? "") as string,
    ip_estado: (r.ip_estado ?? "") as string,
    padraoSuspeito: (r.padrao_suspeito ?? false) as boolean,
  };
}

function dbToReport(r: Record<string, unknown>): Report {
  return {
    id: r.id as string,
    listingId: (r.listing_id ?? "") as string,
    reason: (r.reason ?? "") as string,
    reporter: (r.reporter_id ?? "") as string,
    date: r.date as string,
    status: r.status as Report["status"],
    tipoAlvo: r.tipo_alvo as Report["tipoAlvo"],
    alvoId: r.alvo_id as string | undefined,
    descricao: r.descricao as string | undefined,
    evidencias: (r.evidencias ?? []) as Report["evidencias"],
    trilhaAuditoria: (r.trilha_auditoria ?? []) as AuditTrailEntry[],
  };
}

function dbToPayment(r: Record<string, unknown>): Payment {
  return {
    id: r.id as string,
    userId: (r.user_id ?? "") as string,
    plan: r.plan as string,
    amount: r.amount as number,
    date: r.date as string,
    status: r.status as Payment["status"],
  };
}

function dbToReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string,
    vendedorId: (r.vendedor_id ?? "") as string,
    compradorId: (r.comprador_id ?? "") as string,
    reviewerNome: (r.reviewer_nome ?? "") as string,
    data: r.data as string,
    criterios: (r.criterios ?? {}) as Review["criterios"],
    comentario: (r.comentario ?? "") as string,
    respostaVendedor: r.resposta_vendedor as string | null,
  };
}

function dbToFavorite(r: Record<string, unknown>): Favorite {
  return {
    id: r.id as string,
    usuarioId: r.usuario_id as string,
    anuncioId: r.anuncio_id as string,
    salvoEm: r.salvo_em as string,
  };
}

function dbToBlogPost(r: Record<string, unknown>): BlogPost {
  return {
    id: r.id as string,
    slug: r.slug as string,
    titulo: r.titulo as string,
    categoria: (r.categoria ?? "") as string,
    excerpt: (r.excerpt ?? "") as string,
    conteudo: (r.conteudo ?? "") as string,
    imagemCapa: (r.imagem_capa ?? "") as string,
    tempoLeitura: (r.tempo_leitura ?? "") as string,
    dataPublicacao: r.data_publicacao as string,
    status: r.status as BlogPost["status"],
    anunciosRelacionados: (r.anuncios_relacionados ?? []) as string[],
  };
}

function dbToFlagged(r: Record<string, unknown>): FlaggedListing {
  return {
    id: r.id as string,
    anuncioId: (r.anuncio_id ?? "") as string,
    motivo: (r.motivo ?? "") as string,
    data: r.data as string,
    absolvido: (r.absolvido ?? false) as boolean,
  };
}

function dbToPending(r: Record<string, unknown>): PendingRegistration {
  return {
    id: r.id as string,
    nome: r.nome as string,
    email: r.email as string,
    data: r.data as string,
  };
}

function dbToBlocked(r: Record<string, unknown>): BlockedAttempt {
  return {
    id: r.id as string,
    dado: r.dado as string,
    motivo: (r.motivo ?? "") as string,
    timestamp: r.timestamp as string,
  };
}

function dbToEvent(r: Record<string, unknown>): ClassicEvent {
  return {
    id: r.id as string,
    titulo: r.titulo as string,
    tipo: r.tipo as ClassicEvent["tipo"],
    descricao: (r.descricao ?? "") as string,
    dataInicio: r.data_inicio as string,
    dataFim: r.data_fim as string | undefined,
    cidade: r.cidade as string,
    estado: r.estado as string,
    endereco: (r.endereco ?? "") as string,
    organizadorId: (r.organizador_id ?? "") as string,
    organizadorNome: (r.organizador_nome ?? "") as string,
    capa: (r.capa ?? "") as string,
    ingressoUrl: r.ingresso_url as string | undefined,
    precoEntrada: r.preco_entrada as number | null | undefined,
    publicoEsperado: r.publico_esperado as number | undefined,
    contato: r.contato as string | undefined,
    horario: r.horario as string | undefined,
    destaques: r.destaques as string[] | undefined,
    programacao: (r.programacao ?? []) as ClassicEvent["programacao"],
    atracoes: r.atracoes as string[] | undefined,
    patrocinadores: r.patrocinadores as string[] | undefined,
    instagram: r.instagram as string | undefined,
    site: r.site as string | undefined,
    regras: r.regras as string | undefined,
    observacoes: r.observacoes as string | undefined,
    status: r.status as ClassicEvent["status"],
    createdAt: r.created_at as string,
    statusModeracao: r.status_moderacao as StatusModeracao | undefined,
    trilhaAuditoria: (r.trilha_auditoria ?? []) as AuditTrailEntry[],
    motivoReprovacao: r.motivo_reprovacao as string | undefined,
  };
}

function dbToService(r: Record<string, unknown>): ServiceListing {
  return {
    id: r.id as string,
    kind: r.kind as ServiceListing["kind"],
    titulo: r.titulo as string,
    descricao: (r.descricao ?? "") as string,
    especialidades: (r.especialidades ?? []) as string[],
    preco: r.preco as number | null | undefined,
    estoque: r.estoque as number | undefined,
    fotos: (r.fotos ?? []) as string[],
    cidade: r.cidade as string,
    estado: r.estado as string,
    endereco: r.endereco as string | undefined,
    anuncianteId: (r.anunciante_id ?? "") as string,
    anuncianteNome: (r.anunciante_nome ?? "") as string,
    telefone: r.telefone as string | undefined,
    whatsapp: r.whatsapp as string | undefined,
    site: r.site as string | undefined,
    status: r.status as ServiceListing["status"],
    createdAt: r.created_at as string,
    rastreabilidade: (r.rastreabilidade ?? {}) as ServiceListing["rastreabilidade"],
    scoreConfianca: (r.score_confianca ?? 0) as number,
    statusModeracao: r.status_moderacao as StatusModeracao | undefined,
    trilhaAuditoria: (r.trilha_auditoria ?? []) as AuditTrailEntry[],
    motivoReprovacao: r.motivo_reprovacao as string | undefined,
  };
}

// ─── Listings ───────────────────────────────────────────────────────────────

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToListing);
}

export async function insertListing(l: Listing): Promise<void> {
  const { error } = await supabase.from("listings").insert({
    id: l.id,
    title: l.title,
    brand: l.brand,
    model: l.model,
    year: l.year,
    category: l.category,
    engine: l.engine,
    color: l.color,
    km: l.km,
    chassi: l.chassi,
    documento: l.documento,
    price: l.price,
    description: l.description,
    photos: l.photos,
    city: l.city,
    state: l.state,
    seller_id: l.sellerId || null,
    status: l.status,
    created_at: l.createdAt,
    precificacao: l.precificacao,
    distancia: l.distancia,
    score_confianca: l.scoreConfianca,
    alerta_preco_suspeito: l.alertaPrecoSuspeito,
    foto_duplicada_flag: l.fotoDuplicadaFlag,
    verificacao_localizacao: l.verificacaoLocalizacao,
    situacao_documental: l.situacaoDocumental,
    destaque_premium: l.destaquePremium,
    destaque_ate: l.destaqueAte,
  });
  if (error) throw error;
}

export async function updateListing(id: string, patch: Partial<Listing>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.brand !== undefined) dbPatch.brand = patch.brand;
  if (patch.model !== undefined) dbPatch.model = patch.model;
  if (patch.year !== undefined) dbPatch.year = patch.year;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.engine !== undefined) dbPatch.engine = patch.engine;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  if (patch.km !== undefined) dbPatch.km = patch.km;
  if (patch.chassi !== undefined) dbPatch.chassi = patch.chassi;
  if (patch.documento !== undefined) dbPatch.documento = patch.documento;
  if (patch.price !== undefined) dbPatch.price = patch.price;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.photos !== undefined) dbPatch.photos = patch.photos;
  if (patch.city !== undefined) dbPatch.city = patch.city;
  if (patch.state !== undefined) dbPatch.state = patch.state;
  if (patch.sellerId !== undefined) dbPatch.seller_id = patch.sellerId;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.precificacao !== undefined) dbPatch.precificacao = patch.precificacao;
  if (patch.distancia !== undefined) dbPatch.distancia = patch.distancia;
  if (patch.scoreConfianca !== undefined) dbPatch.score_confianca = patch.scoreConfianca;
  if (patch.alertaPrecoSuspeito !== undefined) dbPatch.alerta_preco_suspeito = patch.alertaPrecoSuspeito;
  if (patch.fotoDuplicadaFlag !== undefined) dbPatch.foto_duplicada_flag = patch.fotoDuplicadaFlag;
  if (patch.verificacaoLocalizacao !== undefined) dbPatch.verificacao_localizacao = patch.verificacaoLocalizacao;
  if (patch.situacaoDocumental !== undefined) dbPatch.situacao_documental = patch.situacaoDocumental;
  if (patch.destaquePremium !== undefined) dbPatch.destaque_premium = patch.destaquePremium;
  if (patch.destaqueAte !== undefined) dbPatch.destaque_ate = patch.destaqueAte;
  const { error } = await supabase.from("listings").update(dbPatch).eq("id", id);
  if (error) throw error;
}

// ─── Users / Profiles ───────────────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToUser);
}

export async function upsertProfile(u: User): Promise<void> {
  const { error } = await supabase.from("profiles").upsert({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: u.city,
    state: u.state,
    plan: u.plan,
    status: u.status,
    member_since: u.memberSince,
    response_rate: u.responseRate,
    avatar: u.avatar,
    role: u.role,
    approved: u.approved,
    verificacoes: u.verificacoes,
    fingerprints: u.fingerprints,
    ips_recentes: u.ipsRecentes,
    taxa_resposta: u.taxaResposta,
    tempo_medio_resposta: u.tempoMedioResposta,
    carros_vendidos: u.carrosVendidos,
    seller_score: u.sellerScore,
    badges: u.badges,
    denuncias_procedentes_cont: u.denunciasProcedentesCont,
  });
  if (error) throw error;
}

export async function updateProfile(id: string, patch: Partial<User>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.phone !== undefined) dbPatch.phone = patch.phone;
  if (patch.city !== undefined) dbPatch.city = patch.city;
  if (patch.state !== undefined) dbPatch.state = patch.state;
  if (patch.plan !== undefined) dbPatch.plan = patch.plan;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.memberSince !== undefined) dbPatch.member_since = patch.memberSince;
  if (patch.responseRate !== undefined) dbPatch.response_rate = patch.responseRate;
  if (patch.avatar !== undefined) dbPatch.avatar = patch.avatar;
  if (patch.role !== undefined) dbPatch.role = patch.role;
  if (patch.approved !== undefined) dbPatch.approved = patch.approved;
  if (patch.verificacoes !== undefined) dbPatch.verificacoes = patch.verificacoes;
  if (patch.fingerprints !== undefined) dbPatch.fingerprints = patch.fingerprints;
  if (patch.ipsRecentes !== undefined) dbPatch.ips_recentes = patch.ipsRecentes;
  if (patch.taxaResposta !== undefined) dbPatch.taxa_resposta = patch.taxaResposta;
  if (patch.tempoMedioResposta !== undefined) dbPatch.tempo_medio_resposta = patch.tempoMedioResposta;
  if (patch.carrosVendidos !== undefined) dbPatch.carros_vendidos = patch.carrosVendidos;
  if (patch.sellerScore !== undefined) dbPatch.seller_score = patch.sellerScore;
  if (patch.badges !== undefined) dbPatch.badges = patch.badges;
  if (patch.denunciasProcedentesCont !== undefined) dbPatch.denuncias_procedentes_cont = patch.denunciasProcedentesCont;
  dbPatch.updated_at = new Date().toISOString();
  const { error } = await supabase.from("profiles").update(dbPatch).eq("id", id);
  if (error) throw error;
}

// ─── Conversations ───────────────────────────────────────────────────────────

export async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase.from("conversations").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToConversation);
}

export async function insertConversation(c: Conversation): Promise<void> {
  const { error } = await supabase.from("conversations").insert({
    id: c.id,
    anuncio_id: c.anuncioId || null,
    comprador_id: c.compradorId || null,
    vendedor_id: c.vendedorId || null,
    suspeita: c.suspeita ?? false,
  });
  if (error) throw error;
}

// ─── Chat Messages ───────────────────────────────────────────────────────────

export async function fetchMessages(conversaId?: string): Promise<ChatMessage[]> {
  let q = supabase.from("chat_messages").select("*").order("timestamp", { ascending: true });
  if (conversaId) q = q.eq("conversa_id", conversaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(dbToMessage);
}

export async function insertMessage(m: ChatMessage): Promise<void> {
  const { error } = await supabase.from("chat_messages").insert({
    id: m.id,
    conversa_id: m.conversaId,
    autor_id: m.autorId || null,
    texto: m.texto,
    timestamp: m.timestamp,
    status: m.status,
    ip_address: m.ip_address,
    ip_cidade: m.ip_cidade,
    ip_estado: m.ip_estado,
    padrao_suspeito: m.padraoSuspeito,
  });
  if (error) throw error;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase.from("reports").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToReport);
}

export async function insertReport(r: Report): Promise<void> {
  const { error } = await supabase.from("reports").insert({
    id: r.id,
    listing_id: r.listingId || null,
    reason: r.reason,
    reporter_id: r.reporter || null,
    date: r.date,
    status: r.status,
    tipo_alvo: r.tipoAlvo,
    alvo_id: r.alvoId,
    descricao: r.descricao,
    evidencias: r.evidencias ?? [],
    trilha_auditoria: r.trilhaAuditoria ?? [],
  });
  if (error) throw error;
}

export async function updateReport(id: string, patch: Partial<Pick<Report, "status" | "trilhaAuditoria">>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.trilhaAuditoria !== undefined) dbPatch.trilha_auditoria = patch.trilhaAuditoria;
  const { error } = await supabase.from("reports").update(dbPatch).eq("id", id);
  if (error) throw error;
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) throw error;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase.from("payments").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToPayment);
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase.from("reviews").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToReview);
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function fetchFavorites(userId?: string): Promise<Favorite[]> {
  let q = supabase.from("favorites").select("*");
  if (userId) q = q.eq("usuario_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(dbToFavorite);
}

export async function insertFavorite(userId: string, listingId: string): Promise<string> {
  const { data, error } = await supabase
    .from("favorites")
    .insert({ usuario_id: userId, anuncio_id: listingId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteFavorite(userId: string, listingId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("usuario_id", userId)
    .eq("anuncio_id", listingId);
  if (error) throw error;
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase.from("blog_posts").select("*").order("data_publicacao", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToBlogPost);
}

export async function insertBlogPost(p: BlogPost): Promise<void> {
  const { error } = await supabase.from("blog_posts").insert({
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    categoria: p.categoria,
    excerpt: p.excerpt,
    conteudo: p.conteudo,
    imagem_capa: p.imagemCapa,
    tempo_leitura: p.tempoLeitura,
    data_publicacao: p.dataPublicacao,
    status: p.status,
    anuncios_relacionados: p.anunciosRelacionados,
  });
  if (error) throw error;
}

export async function updateBlogPost(id: string, patch: Partial<BlogPost>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.titulo !== undefined) dbPatch.titulo = patch.titulo;
  if (patch.slug !== undefined) dbPatch.slug = patch.slug;
  if (patch.categoria !== undefined) dbPatch.categoria = patch.categoria;
  if (patch.excerpt !== undefined) dbPatch.excerpt = patch.excerpt;
  if (patch.conteudo !== undefined) dbPatch.conteudo = patch.conteudo;
  if (patch.imagemCapa !== undefined) dbPatch.imagem_capa = patch.imagemCapa;
  if (patch.tempoLeitura !== undefined) dbPatch.tempo_leitura = patch.tempoLeitura;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.anunciosRelacionados !== undefined) dbPatch.anuncios_relacionados = patch.anunciosRelacionados;
  const { error } = await supabase.from("blog_posts").update(dbPatch).eq("id", id);
  if (error) throw error;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Flagged Listings ────────────────────────────────────────────────────────

export async function fetchFlaggedListings(): Promise<FlaggedListing[]> {
  const { data, error } = await supabase.from("flagged_listings").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToFlagged);
}

export async function insertFlaggedListing(f: FlaggedListing): Promise<void> {
  const { error } = await supabase.from("flagged_listings").insert({
    id: f.id,
    anuncio_id: f.anuncioId || null,
    motivo: f.motivo,
    data: f.data,
    absolvido: f.absolvido,
  });
  if (error) throw error;
}

export async function updateFlaggedListing(id: string, absolvido: boolean): Promise<void> {
  const { error } = await supabase.from("flagged_listings").update({ absolvido }).eq("id", id);
  if (error) throw error;
}

// ─── Pending Registrations ───────────────────────────────────────────────────

export async function fetchPendingRegistrations(): Promise<PendingRegistration[]> {
  const { data, error } = await supabase.from("pending_registrations").select("*").order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToPending);
}

export async function deletePendingRegistration(id: string): Promise<void> {
  const { error } = await supabase.from("pending_registrations").delete().eq("id", id);
  if (error) throw error;
}

// ─── Blocked Attempts ────────────────────────────────────────────────────────

export async function fetchBlockedAttempts(): Promise<BlockedAttempt[]> {
  const { data, error } = await supabase.from("blocked_attempts").select("*").order("timestamp", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToBlocked);
}

// ─── Classic Events ──────────────────────────────────────────────────────────

export async function fetchEvents(): Promise<ClassicEvent[]> {
  const { data, error } = await supabase.from("classic_events").select("*").order("data_inicio", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(dbToEvent);
}

export async function insertEvent(e: ClassicEvent): Promise<void> {
  const { error } = await supabase.from("classic_events").insert({
    id: e.id,
    titulo: e.titulo,
    tipo: e.tipo,
    descricao: e.descricao,
    data_inicio: e.dataInicio,
    data_fim: e.dataFim,
    cidade: e.cidade,
    estado: e.estado,
    endereco: e.endereco,
    organizador_id: e.organizadorId || null,
    organizador_nome: e.organizadorNome,
    capa: e.capa,
    ingresso_url: e.ingressoUrl,
    preco_entrada: e.precoEntrada,
    publico_esperado: e.publicoEsperado,
    contato: e.contato,
    horario: e.horario,
    destaques: e.destaques,
    programacao: e.programacao ?? [],
    atracoes: e.atracoes,
    patrocinadores: e.patrocinadores,
    instagram: e.instagram,
    site: e.site,
    regras: e.regras,
    observacoes: e.observacoes,
    status: e.status,
    created_at: e.createdAt,
    status_moderacao: e.statusModeracao ?? "pendente",
    trilha_auditoria: e.trilhaAuditoria ?? [],
    motivo_reprovacao: e.motivoReprovacao,
  });
  if (error) throw error;
}

export async function updateEvent(id: string, patch: Partial<ClassicEvent>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.statusModeracao !== undefined) dbPatch.status_moderacao = patch.statusModeracao;
  if (patch.motivoReprovacao !== undefined) dbPatch.motivo_reprovacao = patch.motivoReprovacao;
  if (patch.trilhaAuditoria !== undefined) dbPatch.trilha_auditoria = patch.trilhaAuditoria;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  const { error } = await supabase.from("classic_events").update(dbPatch).eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("classic_events").delete().eq("id", id);
  if (error) throw error;
}

// ─── Service Listings ────────────────────────────────────────────────────────

export async function fetchServices(): Promise<ServiceListing[]> {
  const { data, error } = await supabase.from("service_listings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToService);
}

export async function insertService(s: ServiceListing): Promise<void> {
  const { error } = await supabase.from("service_listings").insert({
    id: s.id,
    kind: s.kind,
    titulo: s.titulo,
    descricao: s.descricao,
    especialidades: s.especialidades,
    preco: s.preco,
    estoque: s.estoque,
    fotos: s.fotos,
    cidade: s.cidade,
    estado: s.estado,
    endereco: s.endereco,
    anunciante_id: s.anuncianteId || null,
    anunciante_nome: s.anuncianteNome,
    telefone: s.telefone,
    whatsapp: s.whatsapp,
    site: s.site,
    status: s.status,
    created_at: s.createdAt,
    rastreabilidade: s.rastreabilidade,
    score_confianca: s.scoreConfianca,
    status_moderacao: s.statusModeracao ?? "pendente",
    trilha_auditoria: s.trilhaAuditoria ?? [],
    motivo_reprovacao: s.motivoReprovacao,
  });
  if (error) throw error;
}

export async function updateService(id: string, patch: Partial<ServiceListing>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.statusModeracao !== undefined) dbPatch.status_moderacao = patch.statusModeracao;
  if (patch.motivoReprovacao !== undefined) dbPatch.motivo_reprovacao = patch.motivoReprovacao;
  if (patch.trilhaAuditoria !== undefined) dbPatch.trilha_auditoria = patch.trilhaAuditoria;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  const { error } = await supabase.from("service_listings").update(dbPatch).eq("id", id);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("service_listings").delete().eq("id", id);
  if (error) throw error;
}

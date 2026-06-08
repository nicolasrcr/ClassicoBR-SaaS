import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category, Listing, User, Report, Payment, Conversation, ChatMessage,
  Review, Favorite, BlogPost, FlaggedListing, PendingRegistration, BlockedAttempt,
  ClassicEvent, ServiceListing, AuditTrailEntry, StatusModeracao,
} from "@/lib/types";
import * as db from "@/lib/db";

interface Filters {
  search: string;
  state: string;
  category: Category | null;
  sort: "recentes" | "preco-asc" | "preco-desc" | "proximos";
  brand: string;
  anoMin: string;
  anoMax: string;
  precoMin: string;
  precoMax: string;
  kmMax: string;
  raio: string;
  aceitaTroca: boolean;
  unicoDono: boolean;
}

interface AppState {
  listings: Listing[];
  users: User[];
  currentUserId: string | null;
  filters: Filters;
  compareIds: string[];
  reports: Report[];
  flaggedListings: FlaggedListing[];
  blogPosts: BlogPost[];
  payments: Payment[];
  pendingRegistrations: PendingRegistration[];
  conversations: Conversation[];
  messages: ChatMessage[];
  reviews: Review[];
  favorites: Favorite[];
  blockedAttempts: BlockedAttempt[];
  events: ClassicEvent[];
  services: ServiceListing[];
  dbLoaded: boolean;

  // Bootstrap
  loadFromDB: () => Promise<void>;

  // Filters
  setFilter: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
  toggleCategory: (c: Category) => void;
  resetFilters: () => void;

  // Compare
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // Auth
  login: (asAdmin?: boolean) => void;
  loginAs: (userId: string) => void;
  logout: () => void;

  // Listings
  addListing: (l: Listing) => void;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  approveListing: (id: string) => void;
  pauseListing: (id: string) => void;
  removeListing: (id: string) => void;

  // Users
  updateUser: (id: string, patch: Partial<User>) => void;
  suspendUser: (id: string) => void;
  banUser: (id: string) => void;
  reactivateUser: (id: string) => void;
  approveRegistration: (id: string) => void;
  rejectRegistration: (id: string) => void;

  // Reports
  addReport: (r: Omit<Report, "id">) => void;
  resolveReport: (id: string) => void;
  setReportAnalise: (id: string) => void;
  dismissReport: (id: string) => void;

  // FlaggedListings
  absolveListing: (id: string) => void;
  addFlaggedListing: (f: Omit<FlaggedListing, "id">) => void;

  // BlogPosts
  addBlogPost: (p: Omit<BlogPost, "id">) => void;
  updateBlogPost: (id: string, patch: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  togglePublishPost: (id: string) => void;

  // Messages/Chat
  sendMessage: (conversaId: string, autorId: string, texto: string) => void;

  // Favorites
  addFavorite: (userId: string, listingId: string) => void;
  removeFavorite: (userId: string, listingId: string) => void;

  // Events / Services
  addEvent: (e: ClassicEvent) => void;
  removeEvent: (id: string) => void;
  addService: (s: ServiceListing) => void;
  removeService: (id: string) => void;

  // Moderação
  setEventModeration: (id: string, status: StatusModeracao, motivo: string | undefined, autorId: string, autorNome?: string) => void;
  setServiceModeration: (id: string, status: StatusModeracao, motivo: string | undefined, autorId: string, autorNome?: string) => void;

  // Denúncias estendidas
  appendReportAudit: (reportId: string, entry: AuditTrailEntry) => void;
}

const defaultFilters: Filters = {
  search: "", state: "all", category: null, sort: "recentes",
  brand: "all", anoMin: "", anoMax: "", precoMin: "", precoMax: "",
  kmMax: "", raio: "all", aceitaTroca: false, unicoDono: false,
};

const BR_IPS = [
  { ip: "177.32.15.201", cidade: "São Paulo",     estado: "SP" },
  { ip: "187.50.22.33",  cidade: "Rio de Janeiro", estado: "RJ" },
  { ip: "201.17.45.88",  cidade: "Belo Horizonte", estado: "MG" },
  { ip: "189.40.22.100", cidade: "Curitiba",       estado: "PR" },
  { ip: "177.98.45.10",  cidade: "Goiânia",        estado: "GO" },
];

function suspectPattern(texto: string): boolean {
  const lower = texto.toLowerCase();
  if (/\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/.test(texto)) return true;
  if (["pix", "depósito", "deposito", "reserva", "transferência", "transferencia"].some((w) => lower.includes(w))) return true;
  if (/https?:\/\//.test(texto)) return true;
  return false;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      listings: [],
      users: [],
      currentUserId: null,
      filters: defaultFilters,
      compareIds: [],
      reports: [],
      flaggedListings: [],
      blogPosts: [],
      payments: [],
      pendingRegistrations: [],
      conversations: [],
      messages: [],
      reviews: [],
      favorites: [],
      blockedAttempts: [],
      events: [],
      services: [],
      dbLoaded: false,

      // Bootstrap: carrega dados essenciais do Supabase.
      // chat_messages são carregados sob demanda por conversa (lazy) para não
      // sobrecarregar o carregamento inicial com dados potencialmente grandes.
      loadFromDB: async () => {
        if (get().dbLoaded) return;
        const [
          listings, users, conversations, reports,
          pendingRegistrations, payments, blogPosts, reviews,
          favorites, flaggedListings, blockedAttempts, events, services,
        ] = await Promise.all([
          db.fetchListings(),
          db.fetchUsers(),
          db.fetchConversations(),
          db.fetchReports(),
          db.fetchPendingRegistrations(),
          db.fetchPayments(),
          db.fetchBlogPosts(),
          db.fetchReviews(),
          db.fetchFavorites(),
          db.fetchFlaggedListings(),
          db.fetchBlockedAttempts(),
          db.fetchEvents(),
          db.fetchServices(),
        ]);
        set({
          listings, users, conversations, reports,
          pendingRegistrations, payments, blogPosts, reviews,
          favorites, flaggedListings, blockedAttempts, events, services,
          dbLoaded: true,
        });
      },

      // Filters
      setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
      toggleCategory: (c) =>
        set((s) => ({ filters: { ...s.filters, category: s.filters.category === c ? null : c } })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Compare
      toggleCompare: (id) =>
        set((s) => {
          if (s.compareIds.includes(id)) return { compareIds: s.compareIds.filter((x) => x !== id) };
          if (s.compareIds.length >= 3) return s;
          return { compareIds: [...s.compareIds, id] };
        }),
      clearCompare: () => set({ compareIds: [] }),

      // Auth
      login: (asAdmin) => {
        const users = get().users;
        const adminUser = users.find((u) => u.role === "admin");
        const regularUser = users.find((u) => u.role === "user");
        set({ currentUserId: asAdmin ? (adminUser?.id ?? null) : (regularUser?.id ?? null) });
      },
      loginAs: (userId) => set({ currentUserId: userId }),
      logout: () => set({ currentUserId: null }),

      // Listings
      addListing: (l) => {
        set((s) => ({ listings: [l, ...s.listings] }));
        db.insertListing(l).catch(console.error);
      },
      updateListing: (id, patch) => {
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
        db.updateListing(id, patch).catch(console.error);
      },
      approveListing: (id) => {
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, status: "ativo" } : l)) }));
        db.updateListing(id, { status: "ativo" }).catch(console.error);
      },
      pauseListing: (id) => {
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, status: l.status === "ativo" ? "pausado" : "ativo" } : l,
          ),
        }));
        const current = get().listings.find((l) => l.id === id);
        if (current) db.updateListing(id, { status: current.status }).catch(console.error);
      },
      removeListing: (id) => {
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, status: "removido" } : l)) }));
        db.updateListing(id, { status: "removido" }).catch(console.error);
      },

      // Users
      updateUser: (id, patch) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
        db.updateProfile(id, patch).catch(console.error);
      },
      suspendUser: (id) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: "suspenso" } : u)) }));
        db.updateProfile(id, { status: "suspenso" }).catch(console.error);
      },
      banUser: (id) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: "banido" } : u)) }));
        db.updateProfile(id, { status: "banido" }).catch(console.error);
      },
      reactivateUser: (id) => {
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: "ativo" } : u)) }));
        db.updateProfile(id, { status: "ativo" }).catch(console.error);
      },
      approveRegistration: (id) => {
        const reg = get().pendingRegistrations.find((p) => p.id === id);
        if (!reg) return;
        const newUser: User = {
          id: "u_" + Date.now(),
          name: reg.nome,
          email: reg.email,
          phone: "",
          city: "",
          state: "",
          plan: "gratuito",
          status: "ativo",
          memberSince: new Date().toISOString().slice(0, 10),
          responseRate: 0,
          role: "user",
          approved: true,
          verificacoes: { email: false, telefone: false, cpf: false, kyc: false },
          fingerprints: [],
          ipsRecentes: [],
          taxaResposta: 0,
          tempoMedioResposta: "-",
          carrosVendidos: 0,
          sellerScore: 0,
        };
        set((s) => ({
          pendingRegistrations: s.pendingRegistrations.filter((p) => p.id !== id),
          users: [...s.users, newUser],
        }));
        db.upsertProfile(newUser).catch(console.error);
        db.deletePendingRegistration(id).catch(console.error);
      },
      rejectRegistration: (id) => {
        set((s) => ({ pendingRegistrations: s.pendingRegistrations.filter((p) => p.id !== id) }));
        db.deletePendingRegistration(id).catch(console.error);
      },

      // Reports
      addReport: (r) => {
        const newReport: Report = { ...r, id: "rep_" + Date.now() };
        set((s) => ({ reports: [...s.reports, newReport] }));
        db.insertReport(newReport).catch(console.error);
      },
      resolveReport: (id) => {
        set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: "resolvida" } : r)) }));
        db.updateReport(id, { status: "resolvida" }).catch(console.error);
      },
      setReportAnalise: (id) => {
        set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: "analise" } : r)) }));
        db.updateReport(id, { status: "analise" }).catch(console.error);
      },
      dismissReport: (id) => {
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) }));
        db.deleteReport(id).catch(console.error);
      },

      // FlaggedListings
      absolveListing: (id) => {
        set((s) => ({
          flaggedListings: s.flaggedListings.map((f) => (f.id === id ? { ...f, absolvido: true } : f)),
        }));
        db.updateFlaggedListing(id, true).catch(console.error);
      },
      addFlaggedListing: (f) => {
        const newFlag: FlaggedListing = { ...f, id: "flag_" + Date.now() };
        set((s) => ({ flaggedListings: [...s.flaggedListings, newFlag] }));
        db.insertFlaggedListing(newFlag).catch(console.error);
      },

      // BlogPosts
      addBlogPost: (p) => {
        const newPost: BlogPost = { ...p, id: "art_" + Date.now() };
        set((s) => ({ blogPosts: [...s.blogPosts, newPost] }));
        db.insertBlogPost(newPost).catch(console.error);
      },
      updateBlogPost: (id, patch) => {
        set((s) => ({ blogPosts: s.blogPosts.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
        db.updateBlogPost(id, patch).catch(console.error);
      },
      deleteBlogPost: (id) => {
        set((s) => ({ blogPosts: s.blogPosts.filter((b) => b.id !== id) }));
        db.deleteBlogPost(id).catch(console.error);
      },
      togglePublishPost: (id) => {
        const current = get().blogPosts.find((b) => b.id === id);
        if (!current) return;
        const newStatus = current.status === "Publicado" ? "Rascunho" : "Publicado";
        set((s) => ({
          blogPosts: s.blogPosts.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
        }));
        db.updateBlogPost(id, { status: newStatus }).catch(console.error);
      },

      // Messages/Chat
      sendMessage: (conversaId, autorId, texto) => {
        const ipEntry = BR_IPS[Math.floor(Math.random() * BR_IPS.length)];
        const msg: ChatMessage = {
          id: "m_" + Date.now(),
          conversaId,
          autorId,
          texto,
          timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          status: "sent",
          ip_address: ipEntry.ip,
          ip_cidade: ipEntry.cidade,
          ip_estado: ipEntry.estado,
          padraoSuspeito: suspectPattern(texto),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
        db.insertMessage(msg).catch(console.error);
      },

      // Favorites
      addFavorite: (userId, listingId) => {
        const already = get().favorites.find((f) => f.usuarioId === userId && f.anuncioId === listingId);
        if (already) return;
        const tempId = "fav_" + Date.now();
        set((s) => ({
          favorites: [
            ...s.favorites,
            { id: tempId, usuarioId: userId, anuncioId: listingId, salvoEm: new Date().toISOString().slice(0, 10) },
          ],
        }));
        db.insertFavorite(userId, listingId)
          .then((realId) => {
            set((s) => ({
              favorites: s.favorites.map((f) => (f.id === tempId ? { ...f, id: realId } : f)),
            }));
          })
          .catch((err) => {
            console.error(err);
            set((s) => ({ favorites: s.favorites.filter((f) => f.id !== tempId) }));
          });
      },
      removeFavorite: (userId, listingId) => {
        set((s) => ({
          favorites: s.favorites.filter((f) => !(f.usuarioId === userId && f.anuncioId === listingId)),
        }));
        db.deleteFavorite(userId, listingId).catch(console.error);
      },

      // Events / Services
      addEvent: (e) => {
        set((s) => ({ events: [e, ...s.events] }));
        db.insertEvent(e).catch(console.error);
      },
      removeEvent: (id) => {
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
        db.deleteEvent(id).catch(console.error);
      },
      addService: (sv) => {
        set((s) => ({ services: [sv, ...s.services] }));
        db.insertService(sv).catch(console.error);
      },
      removeService: (id) => {
        set((s) => ({ services: s.services.filter((sv) => sv.id !== id) }));
        db.deleteService(id).catch(console.error);
      },

      setEventModeration: (id, status, motivo, autorId, autorNome) => {
        set((s) => ({
          events: s.events.map((e) =>
            e.id !== id ? e : {
              ...e,
              statusModeracao: status,
              motivoReprovacao: status === "reprovado" ? motivo : e.motivoReprovacao,
              trilhaAuditoria: [
                ...(e.trilhaAuditoria ?? []),
                { acao: `moderacao:${status}`, autorId, autorNome, em: new Date().toISOString(), meta: motivo ? { motivo } : undefined },
              ],
            },
          ),
        }));
        const updated = get().events.find((e) => e.id === id);
        if (updated) db.updateEvent(id, { statusModeracao: updated.statusModeracao, motivoReprovacao: updated.motivoReprovacao, trilhaAuditoria: updated.trilhaAuditoria }).catch(console.error);
      },
      setServiceModeration: (id, status, motivo, autorId, autorNome) => {
        set((s) => ({
          services: s.services.map((sv) =>
            sv.id !== id ? sv : {
              ...sv,
              statusModeracao: status,
              motivoReprovacao: status === "reprovado" ? motivo : sv.motivoReprovacao,
              trilhaAuditoria: [
                ...(sv.trilhaAuditoria ?? []),
                { acao: `moderacao:${status}`, autorId, autorNome, em: new Date().toISOString(), meta: motivo ? { motivo } : undefined },
              ],
            },
          ),
        }));
        const updated = get().services.find((sv) => sv.id === id);
        if (updated) db.updateService(id, { statusModeracao: updated.statusModeracao, motivoReprovacao: updated.motivoReprovacao, trilhaAuditoria: updated.trilhaAuditoria }).catch(console.error);
      },

      appendReportAudit: (reportId, entry) => {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id !== reportId ? r : { ...r, trilhaAuditoria: [...(r.trilhaAuditoria ?? []), entry] },
          ),
        }));
        const updated = get().reports.find((r) => r.id === reportId);
        if (updated) db.updateReport(reportId, { trilhaAuditoria: updated.trilhaAuditoria }).catch(console.error);
      },
    }),
    {
      name: "classicosbr-store-v3",
      // Persiste apenas estado de UI — dados do banco são re-buscados via loadFromDB()
      // evitando estouro do limite de 5MB do localStorage com coleções grandes.
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        filters: state.filters,
        compareIds: state.compareIds,
      }),
    },
  ),
);

export const useCurrentUser = () => {
  const { currentUserId, users } = useAppStore();
  return users.find((u) => u.id === currentUserId) ?? null;
};

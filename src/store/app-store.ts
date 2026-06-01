import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category, Listing, User, Report, Payment, Conversation, ChatMessage,
  Review, Favorite, BlogPost, FlaggedListing, PendingRegistration, BlockedAttempt,
  ClassicEvent, ServiceListing, AuditTrailEntry, StatusModeracao,
} from "@/lib/types";
import {
  mockUsers, mockListings, mockConversations, mockMessages, mockReports,
  mockPendingRegistrations, mockPayments, mockBlogPosts, mockReviews,
  mockFavorites, mockFlaggedListings, mockBlockedAttempts,
  mockEvents, mockServices,
} from "@/lib/mock-data";


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
  { ip: "177.32.15.201", cidade: "São Paulo",    estado: "SP" },
  { ip: "187.50.22.33",  cidade: "Rio de Janeiro", estado: "RJ" },
  { ip: "201.17.45.88",  cidade: "Belo Horizonte", estado: "MG" },
  { ip: "189.40.22.100", cidade: "Curitiba",      estado: "PR" },
  { ip: "177.98.45.10",  cidade: "Goiânia",       estado: "GO" },
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
      listings: mockListings,
      users: mockUsers,
      currentUserId: null,
      filters: defaultFilters,
      compareIds: [],
      reports: mockReports,
      flaggedListings: mockFlaggedListings,
      blogPosts: mockBlogPosts,
      payments: mockPayments,
      pendingRegistrations: mockPendingRegistrations,
      conversations: mockConversations,
      messages: mockMessages,
      reviews: mockReviews,
      favorites: mockFavorites,
      blockedAttempts: mockBlockedAttempts,
      events: mockEvents,
      services: mockServices,

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

      // Auth — login(asAdmin=true) → admin "u9", login() → user "u1"
      login: (asAdmin) => set({ currentUserId: asAdmin ? "u9" : "u1" }),
      loginAs: (userId) => set({ currentUserId: userId }),
      logout: () => set({ currentUserId: null }),

      // Listings
      addListing: (l) => set((s) => ({ listings: [l, ...s.listings] })),
      updateListing: (id, patch) =>
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      approveListing: (id) =>
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, status: "ativo" } : l)) })),
      pauseListing: (id) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === id ? { ...l, status: l.status === "ativo" ? "pausado" : "ativo" } : l,
          ),
        })),
      removeListing: (id) =>
        set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, status: "removido" } : l)) })),

      // Users
      updateUser: (id, patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      suspendUser: (id) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: "suspenso" } : u)) })),
      banUser: (id) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: "banido" } : u)) })),
      reactivateUser: (id) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status: "ativo" } : u)) })),
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
      },
      rejectRegistration: (id) =>
        set((s) => ({ pendingRegistrations: s.pendingRegistrations.filter((p) => p.id !== id) })),

      // Reports
      addReport: (r) =>
        set((s) => ({
          reports: [...s.reports, { ...r, id: "rep_" + Date.now() }],
        })),
      resolveReport: (id) =>
        set((s) => ({
          reports: s.reports.map((r) => (r.id === id ? { ...r, status: "resolvida" } : r)),
        })),
      setReportAnalise: (id) =>
        set((s) => ({
          reports: s.reports.map((r) => (r.id === id ? { ...r, status: "analise" } : r)),
        })),
      dismissReport: (id) =>
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),

      // FlaggedListings
      absolveListing: (id) =>
        set((s) => ({
          flaggedListings: s.flaggedListings.map((f) => (f.id === id ? { ...f, absolvido: true } : f)),
        })),
      addFlaggedListing: (f) =>
        set((s) => ({
          flaggedListings: [...s.flaggedListings, { ...f, id: "flag_" + Date.now() }],
        })),

      // BlogPosts
      addBlogPost: (p) =>
        set((s) => ({
          blogPosts: [...s.blogPosts, { ...p, id: "art_" + Date.now() }],
        })),
      updateBlogPost: (id, patch) =>
        set((s) => ({
          blogPosts: s.blogPosts.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBlogPost: (id) =>
        set((s) => ({ blogPosts: s.blogPosts.filter((b) => b.id !== id) })),
      togglePublishPost: (id) =>
        set((s) => ({
          blogPosts: s.blogPosts.map((b) =>
            b.id === id ? { ...b, status: b.status === "Publicado" ? "Rascunho" : "Publicado" } : b,
          ),
        })),

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
      },

      // Favorites
      addFavorite: (userId, listingId) => {
        const already = get().favorites.find((f) => f.usuarioId === userId && f.anuncioId === listingId);
        if (already) return;
        set((s) => ({
          favorites: [
            ...s.favorites,
            { id: "fav_" + Date.now(), usuarioId: userId, anuncioId: listingId, salvoEm: new Date().toISOString().slice(0, 10) },
          ],
        }));
      },
      removeFavorite: (userId, listingId) =>
        set((s) => ({
          favorites: s.favorites.filter((f) => !(f.usuarioId === userId && f.anuncioId === listingId)),
        })),

      // Events / Services
      addEvent: (e) => set((s) => ({ events: [e, ...s.events] })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      addService: (sv) => set((s) => ({ services: [sv, ...s.services] })),
      removeService: (id) => set((s) => ({ services: s.services.filter((sv) => sv.id !== id) })),

      setEventModeration: (id, status, motivo, autorId, autorNome) =>
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
        })),
      setServiceModeration: (id, status, motivo, autorId, autorNome) =>
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
        })),

      appendReportAudit: (reportId, entry) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id !== reportId ? r : { ...r, trilhaAuditoria: [...(r.trilhaAuditoria ?? []), entry] },
          ),
        })),
    }),
    { name: "classicosbr-store-v2" },
  ),
);

export const useCurrentUser = () => {
  const { currentUserId, users } = useAppStore();
  return users.find((u) => u.id === currentUserId) ?? null;
};

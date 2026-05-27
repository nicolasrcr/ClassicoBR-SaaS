import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, Conversation } from "@/lib/types";
import { mockConversations, mockMessages } from "@/lib/mock-data";

interface ChatState {
  conversations: Conversation[];
  messages: ChatMessage[];
  unreadCount: (currentUserId: string) => number;
  sendMessage: (conversaId: string, autorId: string, texto: string) => void;
  markRead: (conversaId: string, userId: string) => void;
}

const BR_IPS = [
  { ip: "177.32.15.201", cidade: "São Paulo",      estado: "SP" },
  { ip: "187.50.22.33",  cidade: "Rio de Janeiro", estado: "RJ" },
  { ip: "201.17.45.88",  cidade: "Belo Horizonte", estado: "MG" },
  { ip: "189.40.22.100", cidade: "Curitiba",       estado: "PR" },
  { ip: "177.98.45.10",  cidade: "Goiânia",        estado: "GO" },
];

function detectSuspect(texto: string): boolean {
  const lower = texto.toLowerCase();
  if (/\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/.test(texto)) return true;
  if (["pix", "depósito", "deposito", "reserva", "transferência", "transferencia"].some((w) => lower.includes(w))) return true;
  if (/https?:\/\//.test(texto)) return true;
  return false;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: mockConversations,
      messages: mockMessages,

      unreadCount: (currentUserId: string) => {
        const msgs = get().messages;
        const convs = get().conversations;
        // Count conversations where currentUser is involved and has unread messages from other party
        const userConvIds = convs
          .filter((c) => c.compradorId === currentUserId || c.vendedorId === currentUserId)
          .map((c) => c.id);
        return userConvIds.filter((convId) =>
          msgs.some((m) => m.conversaId === convId && m.autorId !== currentUserId && m.status !== "read"),
        ).length;
      },

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
          padraoSuspeito: detectSuspect(texto),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },

      markRead: (conversaId, userId) => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.conversaId === conversaId && m.autorId !== userId
              ? { ...m, status: "read" as const }
              : m,
          ),
        }));
      },
    }),
    { name: "classicosbr-chat" },
  ),
);

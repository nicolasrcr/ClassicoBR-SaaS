import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, MessageCircle, Send, AlertTriangle, Search,
  Car, DollarSign, X, Shield,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useChatStore } from "@/store/chat-store";
import { moderarTexto } from "@/lib/moderation";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

export const Route = createFileRoute("/chat")({ component: Chat });

// Inline moderation hook for typing detection
function useTypingModeration(text: string) {
  const lower = text.toLowerCase();
  const hasPhone = /\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/.test(text);
  const hasPayment = /(pix|depósito antecipado|deposito antecipado|reserva|transferência adiantada|transferencia adiantada)/i.test(lower);
  return { hasPhone, hasPayment };
}

// Group messages by date
function groupByDate(messages: ChatMessage[]) {
  const groups: Record<string, ChatMessage[]> = {};
  for (const m of messages) {
    const date = m.timestamp.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(m);
  }
  return groups;
}

function formatGroupDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoje";
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

function ReadReceipt({ status }: { status: "sent" | "delivered" | "read" }) {
  if (status === "sent") return <span className="text-white/60">✓</span>;
  if (status === "delivered") return <span className="text-white/60">✓✓</span>;
  return <span className="text-blue-300">✓✓</span>;
}

function OfferModal({ onSend, onClose }: { onSend: (v: string) => void; onClose: () => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm mx-4 rounded-xl bg-white border border-[color:var(--color-border-cream)] shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg">Fazer oferta</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Informe o valor que deseja oferecer pelo veículo:
        </p>
        <Input aria-label="Ex: 35000"
          type="number"
          placeholder="Ex: 35000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mb-4"
          autoFocus
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button
            size="sm"
            className="flex-1 bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta)]/90"
            onClick={() => {
              if (value.trim()) {
                const formatted = Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
                onSend(`Oferta formal: ${formatted} à vista. Podemos conversar?`);
                onClose();
              }
            }}
          >
            Enviar oferta
          </Button>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  const user = useCurrentUser();
  const { users, listings } = useAppStore();
  const { conversations, messages, sendMessage, markRead } = useChatStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myConvs = conversations.filter(
    (c) => user && (c.compradorId === user.id || c.vendedorId === user.id),
  );

  const filteredConvs = myConvs.filter((c) => {
    if (!search.trim()) return true;
    const listing = listings.find((l) => l.id === c.anuncioId);
    const otherId = c.compradorId === user?.id ? c.vendedorId : c.compradorId;
    const other = users.find((u) => u.id === otherId);
    return (
      listing?.title.toLowerCase().includes(search.toLowerCase()) ||
      other?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const active = myConvs.find((c) => c.id === activeId) ?? (myConvs[0] ?? null);
  const convMsgs = messages
    .filter((m) => m.conversaId === active?.id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const { hasPhone, hasPayment } = useTypingModeration(text);
  const grouped = groupByDate(convMsgs);

  useEffect(() => {
    if (active && user) markRead(active.id, user.id);
  }, [active?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMsgs.length]);

  const send = (override?: string) => {
    const raw = override ?? text;
    if (!raw.trim() || !active || !user) return;
    const mod = moderarTexto(raw);
    setFlags(mod.flags);
    sendMessage(active.id, user.id, mod.texto);
    if (!override) setText("");
  };

  // Unread count per conversation
  const unreadForConv = (convId: string) =>
    messages.filter((m) => m.conversaId === convId && m.autorId !== user?.id && m.status !== "read").length;

  if (!user) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <MessageCircle className="h-14 w-14 mx-auto mb-6 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl mb-3">Faça login para acessar o chat</h2>
          <p className="text-muted-foreground text-sm mb-8">
            O chat está disponível para usuários cadastrados.
          </p>
          <Button asChild className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta)]/90">
            <Link to="/login">Entrar na conta</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />

      {/* Security banner — always visible */}
      <div className="z-30 bg-green-50 border-b border-green-200 px-4 py-2 text-xs text-green-800 flex items-center justify-center gap-2 shrink-0">
        <Shield className="h-3.5 w-3.5 shrink-0 text-green-600" />
        <span>
          <strong>ClassicosBR nunca solicita pagamento antecipado.</strong>{" "}
          Não transfira valores antes de ver o veículo pessoalmente.{" "}
          <Link to="/compra-segura" className="underline underline-offset-2 hover:text-green-900 font-medium">
            → Guia de compra segura
          </Link>
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — conversation list */}
        <aside className={cn(
          "w-72 shrink-0 border-r border-border bg-card flex flex-col",
          active && "hidden md:flex",
        )}>
          {/* Header */}
          <div className="border-b border-border px-4 py-3 shrink-0">
            <h2 className="font-serif text-base mb-2.5">Mensagens</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input aria-label="Buscar conversa"
                placeholder="Buscar conversa…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda."}
                </p>
                {!search && (
                  <Link to="/anuncios" className="mt-2 inline-block text-xs text-[color:var(--color-terracotta)] hover:underline">
                    Encontre um clássico!
                  </Link>
                )}
              </div>
            ) : (
              filteredConvs.map((c) => {
                const otherId = c.compradorId === user.id ? c.vendedorId : c.compradorId;
                const other = users.find((u) => u.id === otherId);
                const listing = listings.find((l) => l.id === c.anuncioId);
                const lastMsg = [...messages]
                  .filter((m) => m.conversaId === c.id)
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
                const unread = unreadForConv(c.id);
                const isActive = (activeId ?? myConvs[0]?.id) === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3.5 text-left border-b border-border transition-colors hover:bg-secondary",
                      isActive && "bg-[color:var(--color-terracotta)]/8 border-l-2 border-l-[color:var(--color-terracotta)]",
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={cn("text-xs font-semibold", isActive ? "bg-[color:var(--color-terracotta)]/15 text-[color:var(--color-terracotta)]" : "bg-secondary")}>
                        {other?.name[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium truncate leading-tight">{listing?.title ?? "Anúncio"}</p>
                        {lastMsg && (
                          <span className="text-xs text-muted-foreground shrink-0">{lastMsg.timestamp.slice(11, 16)}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{other?.name ?? "Usuário"}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                        {lastMsg?.texto ?? "—"}
                        {unread > 0 && (
                          <span className="ml-auto shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-xs font-bold text-white">
                            {unread}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat panel */}
        {active ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-card shrink-0">
              <button onClick={() => setActiveId(null)} className="md:hidden shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </button>
              {(() => {
                const listing = listings.find((l) => l.id === active.anuncioId);
                const otherId = active.compradorId === user.id ? active.vendedorId : active.compradorId;
                const other = users.find((u) => u.id === otherId);
                return (
                  <>
                    {/* Car thumbnail */}
                    {listing?.photos[0] && (
                      <div className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate leading-tight">{listing?.title ?? "Anúncio"}</p>
                      <p className="text-xs text-muted-foreground truncate">{other?.name ?? "Usuário"}</p>
                    </div>
                    <Link
                      to="/anuncios/$id"
                      params={{ id: active.anuncioId }}
                      className="shrink-0 flex items-center gap-1 text-xs text-[color:var(--color-terracotta)] hover:underline"
                    >
                      <Car className="h-3.5 w-3.5" />
                      Ver anúncio
                    </Link>
                  </>
                );
              })()}
            </div>

            {/* Moderation banners */}
            {flags.includes("pagamento_suspeito") && (
              <div className="shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Nunca pague antes de ver o veículo pessoalmente. Use sempre o chat da plataforma.</span>
                <button onClick={() => setFlags([])} className="ml-auto text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
              </div>
            )}
            {flags.includes("link_externo") && (
              <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Um link foi removido por segurança. Prefira compartilhar informações pelo chat.</span>
                <button onClick={() => setFlags([])} className="ml-auto text-amber-400 hover:text-amber-600"><X className="h-3 w-3" /></button>
              </div>
            )}
            {hasPhone && (
              <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Detectamos um número de telefone. Prefira negociar pelo chat para manter o histórico.</span>
              </div>
            )}
            {hasPayment && (
              <div className="shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Nunca pague antes de ver o veículo. ClassicosBR não solicita pagamentos antecipados.</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[color:var(--color-surface-cream)]">
              {Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium px-2">{formatGroupDate(date)}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {/* Messages in this date group */}
                  <div className="space-y-2">
                    {msgs.map((m) => {
                      const mine = m.autorId === user.id;
                      const mod = moderarTexto(m.texto);
                      return (
                        <div
                          key={m.id}
                          className={cn("flex flex-col max-w-[75%]", mine ? "items-end ml-auto" : "items-start")}
                        >
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5 text-sm",
                              mine
                                ? "bg-[color:var(--color-terracotta)] text-white rounded-br-sm"
                                : "bg-white border border-[color:var(--color-border-cream)] text-foreground rounded-bl-sm shadow-sm",
                            )}
                          >
                            {mod.texto}
                          </div>
                          {mod.flags.includes("telefone_externo") && (
                            <p className="text-xs text-amber-600 mt-0.5 px-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Prefira negociar pelo chat para manter o histórico seguro
                            </p>
                          )}
                          {m.padraoSuspeito && !mod.flags.includes("telefone_externo") && (
                            <p className="text-xs text-amber-600 mt-0.5 px-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Mensagem sinalizada como potencialmente suspeita
                            </p>
                          )}
                          <span className="text-xs text-muted-foreground mt-0.5 px-1 flex items-center gap-1">
                            {m.timestamp.slice(11, 16)}
                            {mine && <ReadReceipt status={m.status} />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {convMsgs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Nenhuma mensagem ainda. Inicie a conversa!
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border bg-card px-4 py-3 shrink-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs gap-1.5"
                  onClick={() => setShowOfferModal(true)}
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  Fazer oferta
                </Button>
                <Input aria-label="Digite uma mensagem"
                  placeholder="Digite uma mensagem…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => send()}
                  disabled={!text.trim()}
                  className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta)]/90 shrink-0"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state — no conversation selected or no conversations */
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center px-6">
              <MessageCircle className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
              {myConvs.length === 0 ? (
                <>
                  <h3 className="font-serif text-xl mb-2">Nenhuma conversa ainda</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Encontre um clássico e inicie uma negociação.
                  </p>
                  <Link
                    to="/anuncios"
                    className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-terracotta)] px-5 py-2 text-sm font-medium text-white hover:bg-[color:var(--color-terracotta)]/90 transition-colors"
                  >
                    Encontre um clássico!
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Selecione uma conversa</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Offer modal */}
      {showOfferModal && (
        <OfferModal
          onSend={(msg) => send(msg)}
          onClose={() => setShowOfferModal(false)}
        />
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { useChatStore } from "@/store/chat-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/chat")({ component: AdminChat });

function AdminChat() {
  const { users, listings } = useAppStore();
  const { conversations, messages } = useChatStore();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const buyer = users.find((u) => u.id === c.compradorId)?.name ?? "";
    const seller = users.find((u) => u.id === c.vendedorId)?.name ?? "";
    const listing = listings.find((l) => l.id === c.anuncioId)?.title ?? "";
    return [buyer, seller, listing].some((s) => s.toLowerCase().includes(search.toLowerCase()));
  });

  const active = conversations.find((c) => c.id === activeId);
  const activeMessages = messages.filter((m) => m.conversaId === activeId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return (
    <div className="flex h-full" style={{ minHeight: "calc(100vh - 0px)" }}>
      {/* Sidebar */}
      <div className="w-80 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="border-b border-border p-4">
          <h1 className="font-serif text-xl mb-3">Chat & Suporte</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const buyer = users.find((u) => u.id === c.compradorId);
            const seller = users.find((u) => u.id === c.vendedorId);
            const listing = listings.find((l) => l.id === c.anuncioId);
            const msgs = messages.filter((m) => m.conversaId === c.id);
            const lastMsg = [...msgs].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
            const suspicious = msgs.some((m) => m.padraoSuspeito);
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={cn("w-full text-left p-4 border-b border-border hover:bg-secondary transition-colors",
                  activeId === c.id && "bg-secondary")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{listing?.title ?? "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{buyer?.name} ↔ {seller?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{lastMsg?.texto ?? "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">{msgs.length} msgs</span>
                    {suspicious && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      {active ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-border p-4">
            <p className="font-serif text-sm">{listings.find((l) => l.id === active.anuncioId)?.title}</p>
            <p className="text-xs text-muted-foreground">
              {users.find((u) => u.id === active.compradorId)?.name} ↔ {users.find((u) => u.id === active.vendedorId)?.name}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeMessages.map((m) => {
              const author = users.find((u) => u.id === m.autorId);
              return (
                <div key={m.id} className={cn("rounded-[8px] p-3 text-sm", m.padraoSuspeito ? "bg-amber-50 border border-amber-200" : "bg-card border border-border")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-xs">{author?.name ?? "?"}</span>
                      {m.padraoSuspeito && <Badge className="ml-2 text-[9px] bg-amber-100 text-amber-800">⚠️ Suspeito</Badge>}
                      <p className="mt-1">{m.texto}</p>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground shrink-0">
                      <p>{m.timestamp}</p>
                      <p>{m.ip_cidade}/{m.ip_estado}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Selecione uma conversa para visualizar
        </div>
      )}
    </div>
  );
}

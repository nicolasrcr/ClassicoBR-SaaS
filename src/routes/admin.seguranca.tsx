import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/store/app-store";
import { mockFlaggedListings, mockMessages } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/seguranca")({ component: AdminSeguranca });

function AdminSeguranca() {
  const { listings, users, updateListing, updateUser } = useAppStore();
  const [flagged, setFlagged] = useState(mockFlaggedListings.map((f) => ({ ...f })));
  const [banId, setBanId] = useState<string | null>(null);
  const [banMotivo, setBanMotivo] = useState("");

  const suspMsgs = mockMessages.filter((m) => m.padraoSuspeito);
  const multiFingerprint = users.filter((u) => u.fingerprints.length > 2);
  const blockedMock = [
    { ip: "200.10.1.1", cpf: "000.000.000-00", telefone: "(41) 9999-0004", data: "2026-05-22 10:00", motivo: "Conta banida (u7)" },
    { ip: "189.50.2.2", cpf: "111.111.111-11", telefone: "(71) 9999-0007", data: "2026-05-20 14:30", motivo: "IP banido" },
  ];

  const absolver = (id: string) => {
    setFlagged((prev) => prev.map((f) => f.id === id ? { ...f, absolvido: true } : f));
    toast.success("Anúncio absolvido");
  };

  const exportCSV = () => {
    const rows = [["IP", "CPF", "Telefone", "Data", "Motivo"], ...blockedMock.map((b) => [b.ip, b.cpf, b.telefone, b.data, b.motivo])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "bloqueios.csv";
    a.click();
    toast.success("CSV exportado!");
  };

  const activeFlags = flagged.filter((f) => !f.absolvido);

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-[color:var(--color-terracotta)]" />
        <h1 className="font-serif text-2xl">Segurança</h1>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Anúncios flagados", value: activeFlags.length, color: "text-red-500" },
          { label: "Bloqueios esta semana", value: blockedMock.length, color: "text-amber-500" },
          { label: "Mensagens suspeitas", value: suspMsgs.length, color: "text-amber-500" },
          { label: "Fingerprints duplicados", value: multiFingerprint.length, color: "text-orange-500" },
        ].map((c) => (
          <div key={c.label} className="rounded-[10px] border border-border bg-card p-4">
            <p className={`font-serif text-3xl ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Section 1 — Anúncios flagados */}
      <section>
        <h2 className="font-serif text-xl mb-4">Anúncios flagados automaticamente</h2>
        {activeFlags.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum anúncio com flag ativa.</p>
        ) : (
          <div className="space-y-3">
            {activeFlags.map((f) => {
              const listing = listings.find((l) => l.id === f.anuncioId);
              return (
                <div key={f.id} className="flex items-center gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{listing?.title ?? f.anuncioId}</p>
                    <p className="text-xs text-muted-foreground">{f.motivo} · {formatDate(f.data)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => absolver(f.id)}>Absolver</Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2 — Tentativas bloqueadas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Tentativas bloqueadas</h2>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        </div>
        <div className="space-y-2">
          {blockedMock.map((b, i) => (
            <div key={i} className="flex items-start gap-3 rounded-[8px] border border-border bg-card p-3 text-sm">
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-xs text-muted-foreground">IP: <strong>{b.ip}</strong></span>
                <span className="text-xs text-muted-foreground">CPF: {b.cpf}</span>
                <span className="text-xs text-muted-foreground">Tel: {b.telefone}</span>
                <span className="text-xs text-muted-foreground">{b.data}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">{b.motivo}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Mensagens suspeitas */}
      <section>
        <h2 className="font-serif text-xl mb-4">Mensagens suspeitas</h2>
        {suspMsgs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma mensagem suspeita detectada.</p>
        ) : (
          <div className="space-y-2">
            {suspMsgs.map((m) => {
              const author = useAppStore.getState().users.find((u) => u.id === m.autorId);
              return (
                <div key={m.id} className="rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium">{author?.name ?? "?"}</span>
                      <p className="text-muted-foreground mt-0.5 text-xs truncate max-w-xs">{m.texto}</p>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground shrink-0">
                      <p>{m.timestamp}</p>
                      <Button size="sm" variant="outline" className="mt-1 text-[10px] h-6" onClick={() => { setBanId(m.autorId); }}>Banir</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 4 — Fingerprints duplicados */}
      <section>
        <h2 className="font-serif text-xl mb-4">Fingerprints duplicados</h2>
        {multiFingerprint.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum fingerprint duplicado detectado.</p>
        ) : (
          <div className="space-y-2">
            {multiFingerprint.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-[8px] border border-border bg-card p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.fingerprints.length} fingerprints: {u.fingerprints.join(", ")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Marcado como falso positivo")}>Falso positivo</Button>
                  <Button size="sm" variant="destructive" className="text-xs" onClick={() => setBanId(u.id)}>Banir</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ban dialog */}
      <AlertDialog open={!!banId} onOpenChange={() => { setBanId(null); setBanMotivo(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Banir usuário?</AlertDialogTitle>
            <AlertDialogDescription>Informe o motivo do banimento.</AlertDialogDescription>
          </AlertDialogHeader>
          <input className="w-full rounded border border-border p-2 text-sm" placeholder="Motivo" value={banMotivo} onChange={(e) => setBanMotivo(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => {
              if (banId) { updateUser(banId, { status: "banido" }); toast.success("Usuário banido"); setBanId(null); setBanMotivo(""); }
            }}>Banir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

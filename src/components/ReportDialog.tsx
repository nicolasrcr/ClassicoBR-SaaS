import { useState } from "react";
import { Flag, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeImageFile } from "@/lib/traceability";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import type { ReportEvidence } from "@/lib/types";
import { toast } from "sonner";

const MOTIVOS = [
  "Imagem reutilizada de outro anúncio",
  "Informações falsas / golpe",
  "Anúncio duplicado",
  "Localização divergente",
  "Conteúdo impróprio",
  "Outro",
];

export function ReportDialog({
  tipoAlvo,
  alvoId,
  trigger,
}: {
  tipoAlvo: "evento" | "servico" | "anuncio";
  alvoId: string;
  trigger?: React.ReactNode;
}) {
  const user = useCurrentUser();
  const addReport = useAppStore((s) => s.addReport);
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [descricao, setDescricao] = useState("");
  const [evidUrl, setEvidUrl] = useState("");
  const [evidencias, setEvidencias] = useState<ReportEvidence[]>([]);

  const reset = () => {
    setMotivo(MOTIVOS[0]); setDescricao(""); setEvidUrl(""); setEvidencias([]);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    try {
      const arr = await Promise.all(Array.from(files).slice(0, 4).map(analyzeImageFile));
      setEvidencias((cur) => [
        ...cur,
        ...arr.map<ReportEvidence>((a) => ({ tipo: "imagem", valor: a.nome, hash: a.hashSha256 })),
      ]);
      toast.success(`${arr.length} evidência(s) anexada(s)`);
    } catch {
      toast.error("Falha ao analisar evidências");
    }
  };

  const submit = () => {
    if (!user) { toast.error("Faça login para denunciar"); return; }
    if (descricao.trim().length < 30) {
      toast.error("Descreva o problema com pelo menos 30 caracteres"); return;
    }
    const allEvid: ReportEvidence[] = [...evidencias];
    if (evidUrl.trim()) allEvid.push({ tipo: "url", valor: evidUrl.trim() });

    addReport({
      listingId: alvoId,
      reason: motivo,
      reporter: user.id,
      date: new Date().toISOString().slice(0, 10),
      status: "aberta",
      tipoAlvo,
      alvoId,
      descricao,
      evidencias: allEvid,
      trilhaAuditoria: [
        { acao: "denuncia_criada", autorId: user.id, autorNome: user.name, em: new Date().toISOString(), meta: { motivo } },
      ],
    });
    toast.success("Denúncia enviada — nossa equipe revisará em breve.");
    setOpen(false); reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Flag className="h-3.5 w-3.5" /> Denunciar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Denunciar conteúdo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOTIVOS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição (mín. 30 caracteres)</Label>
            <Textarea rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que aconteceu? Onde você viu a mesma imagem? Detalhes ajudam a equipe a agir mais rápido." />
            <p className="mt-1 text-[11px] text-muted-foreground">{descricao.length} / 30</p>
          </div>
          <div>
            <Label>Link de evidência (opcional)</Label>
            <Input value={evidUrl} onChange={(e) => setEvidUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label className="mb-1.5 block">Imagens de evidência (hash SHA-256 registrado)</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-3 py-4 text-xs text-muted-foreground hover:border-[color:var(--color-terracotta)] hover:text-foreground">
              <Upload className="h-3.5 w-3.5" /> Anexar até 4 imagens
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
            {evidencias.length > 0 && (
              <ul className="mt-2 space-y-1 text-[11px]">
                {evidencias.map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded bg-muted px-2 py-1">
                    <span className="truncate">{e.valor}</span>
                    {e.hash && <span className="font-mono text-muted-foreground">{e.hash.slice(0, 12)}…</span>}
                    <button onClick={() => setEvidencias((cur) => cur.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} className="btn-terra text-white">Enviar denúncia</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AuditTrailCard({ entries }: { entries?: Array<{ acao: string; autorId: string; autorNome?: string; em: string; meta?: Record<string, unknown> }> }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Trilha de auditoria</p>
      <ol className="space-y-2 text-xs">
        {entries.map((e, i) => (
          <li key={i} className="flex items-start gap-2 border-l-2 border-[color:var(--color-terracotta)] pl-2">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-foreground">{e.acao}</p>
              <p className="text-muted-foreground">
                {new Date(e.em).toLocaleString("pt-BR")} · {e.autorNome ?? e.autorId}
              </p>
              {e.meta && Object.keys(e.meta).length > 0 && (
                <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                  {Object.entries(e.meta).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
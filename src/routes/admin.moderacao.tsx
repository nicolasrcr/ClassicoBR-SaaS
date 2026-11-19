import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, Check, X as XIcon, Camera, Calendar, Wrench } from "lucide-react";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TraceabilityPanel } from "@/components/TraceabilityPanel";
import { STATUS_MODERACAO_LABELS, type StatusModeracao } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/moderacao")({ component: AdminModeracao });

function StatusBadge({ status }: { status: StatusModeracao }) {
  const cls: Record<StatusModeracao, string> = {
    pendente: "bg-amber-500/15 text-amber-700",
    aprovado: "bg-emerald-500/15 text-emerald-700",
    reprovado: "bg-red-500/15 text-red-700",
    "novas-fotos": "bg-blue-500/15 text-blue-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls[status]}`}>
      {STATUS_MODERACAO_LABELS[status]}
    </span>
  );
}

function AdminModeracao() {
  const events = useAppStore((s) => s.events);
  const services = useAppStore((s) => s.services);
  const setEventMod = useAppStore((s) => s.setEventModeration);
  const setServiceMod = useAppStore((s) => s.setServiceModeration);
  const user = useCurrentUser();

  const evQueue = useMemo(
    () => [...events].sort((a, b) => (a.rastreabilidade?.scoreOrigem ?? 100) - (b.rastreabilidade?.scoreOrigem ?? 100)),
    [events],
  );
  const svQueue = useMemo(
    () => [...services].sort((a, b) => (a.rastreabilidade?.scoreOrigem ?? 100) - (b.rastreabilidade?.scoreOrigem ?? 100)),
    [services],
  );

  const [motivo, setMotivo] = useState<Record<string, string>>({});

  const act = (
    kind: "evento" | "servico",
    id: string,
    status: StatusModeracao,
  ) => {
    if (!user) return;
    const m = motivo[id]?.trim();
    if (status === "reprovado" && (!m || m.length < 10)) {
      toast.error("Informe o motivo da reprovação (mín. 10 caracteres)"); return;
    }
    if (kind === "evento") setEventMod(id, status, m, user.id, user.name);
    else setServiceMod(id, status, m, user.id, user.name);
    toast.success(`Marcado como ${STATUS_MODERACAO_LABELS[status]}`);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <h1 className="font-serif text-3xl mb-1">Fila de moderação</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ordenado por menor score de origem. Aprove, reprove ou solicite novas fotos.
      </p>

      <Tabs defaultValue="eventos">
        <TabsList>
          <TabsTrigger value="eventos"><Calendar className="mr-1 h-3.5 w-3.5" /> Eventos ({evQueue.length})</TabsTrigger>
          <TabsTrigger value="servicos"><Wrench className="mr-1 h-3.5 w-3.5" /> Serviços ({svQueue.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="mt-4 space-y-4">
          {evQueue.map((ev) => (
            <div key={ev.id} className="rounded-xl border border-border bg-white p-4 grid grid-cols-1 lg:grid-cols-[180px,1fr,300px] gap-4">
              <img src={ev.capa} alt="" className="h-32 w-full object-cover rounded-lg" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg">{ev.titulo}</h3>
                  <StatusBadge status={ev.statusModeracao ?? "pendente"} />
                </div>
                <p className="text-xs text-muted-foreground">{ev.cidade}/{ev.estado} · {ev.organizadorNome}</p>
                <p className="text-sm mt-2 line-clamp-2">{ev.descricao}</p>
                <Textarea aria-label="Motivo (necessário para reprovação)"
                  value={motivo[ev.id] ?? ""}
                  onChange={(e) => setMotivo((cur) => ({ ...cur, [ev.id]: e.target.value }))}
                  placeholder="Motivo (necessário para reprovação)"
                  rows={2}
                  className="mt-3"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => act("evento", ev.id, "aprovado")} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="h-3.5 w-3.5" /> Aprovar</Button>
                  <Button size="sm" onClick={() => act("evento", ev.id, "reprovado")} variant="destructive"><XIcon className="h-3.5 w-3.5" /> Reprovar</Button>
                  <Button size="sm" onClick={() => act("evento", ev.id, "novas-fotos")} variant="outline"><Camera className="h-3.5 w-3.5" /> Solicitar fotos</Button>
                </div>
              </div>
              {ev.rastreabilidade ? <TraceabilityPanel trace={ev.rastreabilidade} compact /> : (
                <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Sem rastreabilidade
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="servicos" className="mt-4 space-y-4">
          {svQueue.map((sv) => (
            <div key={sv.id} className="rounded-xl border border-border bg-white p-4 grid grid-cols-1 lg:grid-cols-[180px,1fr,300px] gap-4">
              <img src={sv.fotos[0]} alt="" className="h-32 w-full object-cover rounded-lg" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg">{sv.titulo}</h3>
                  <StatusBadge status={sv.statusModeracao ?? "pendente"} />
                  {sv.rastreabilidade.scoreOrigem >= 80 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><ShieldCheck className="h-3 w-3" /> alta</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{sv.cidade}/{sv.estado} · {sv.anuncianteNome}</p>
                <p className="text-sm mt-2 line-clamp-2">{sv.descricao}</p>
                <Textarea aria-label="Motivo (necessário para reprovação)"
                  value={motivo[sv.id] ?? ""}
                  onChange={(e) => setMotivo((cur) => ({ ...cur, [sv.id]: e.target.value }))}
                  placeholder="Motivo (necessário para reprovação)"
                  rows={2}
                  className="mt-3"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => act("servico", sv.id, "aprovado")} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="h-3.5 w-3.5" /> Aprovar</Button>
                  <Button size="sm" onClick={() => act("servico", sv.id, "reprovado")} variant="destructive"><XIcon className="h-3.5 w-3.5" /> Reprovar</Button>
                  <Button size="sm" onClick={() => act("servico", sv.id, "novas-fotos")} variant="outline"><Camera className="h-3.5 w-3.5" /> Solicitar fotos</Button>
                </div>
              </div>
              <TraceabilityPanel trace={sv.rastreabilidade} compact />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
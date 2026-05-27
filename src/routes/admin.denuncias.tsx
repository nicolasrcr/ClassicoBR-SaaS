import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Trash2, Check, History } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { mockReports } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { Report } from "@/lib/types";

export const Route = createFileRoute("/admin/denuncias")({ component: Reports });

function Reports() {
  const { listings, users, removeListing } = useAppStore();
  const [reports, setReports] = useState<Report[]>(mockReports);

  const update = (id: string, patch: Partial<Report>) => {
    setReports((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6">
        <h1 className="font-serif text-3xl">Denúncias</h1>
        <p className="mt-1 text-sm text-muted-foreground">{reports.length} denúncias no total</p>
      </header>

      <div className="rounded-[10px] border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anúncio</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Denunciante</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => {
              const l = listings.find((x) => x.id === r.listingId);
              const reporter = users.find((u) => u.id === r.reporter);
              const tone = r.status === "aberta" ? "red" : r.status === "analise" ? "amber" : "green";
              return (
                <TableRow key={r.id} className="hover:bg-secondary/60">
                  <TableCell>
                    {l ? <Link to="/car/$id" params={{ id: l.id }} className="font-medium underline-offset-2 hover:underline">{l.title}</Link> : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{r.reason}</TableCell>
                  <TableCell className="text-sm">{reporter?.name ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(r.date)}</TableCell>
                  <TableCell><StatusBadge tone={tone}>{r.status}</StatusBadge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => { update(r.id, { status: "analise" }); toast.success("Em análise"); }}>
                        <Eye className="h-3 w-3" /> Em análise
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => {
                        if (l) removeListing(l.id);
                        update(r.id, { status: "resolvida" });
                        toast.success("Anúncio removido");
                      }}>
                        <Trash2 className="h-3 w-3" /> Remover
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { update(r.id, { status: "resolvida" }); toast.success("Absolvido"); }}>
                        <Check className="h-3 w-3" /> Absolver
                      </Button>
                      <Button size="icon" variant="ghost" title="Histórico do vendedor"><History className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

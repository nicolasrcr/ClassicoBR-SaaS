import { createFileRoute } from "@tanstack/react-router";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { mockPayments, mockPlans } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/pagamentos")({ component: Payments });

function Payments() {
  const users = useAppStore((s) => s.users);

  return (
    <div className="space-y-8 p-6 md:p-10">
      <section>
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl">Planos & Pagamentos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerencie planos e veja o histórico</p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4" /> Novo plano</Button>
        </header>

        <div className="rounded-[10px] border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Limite de anúncios</TableHead>
                <TableHead>Fotos / anúncio</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlans.map((p) => (
                <TableRow key={p.id} className="hover:bg-secondary/60">
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>R$ {p.price.toFixed(2)}</TableCell>
                  <TableCell>{p.limit}</TableCell>
                  <TableCell>{p.photos}</TableCell>
                  <TableCell>{p.featured ? "Sim" : "Não"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Histórico de pagamentos</h2>
          <Button variant="outline" onClick={() => toast.success("CSV exportado")}><Download className="h-4 w-4" /> Exportar CSV</Button>
        </header>

        <div className="rounded-[10px] border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayments.map((p) => {
                const u = users.find((x) => x.id === p.userId);
                const tone = p.status === "pago" ? "green" : p.status === "pendente" ? "amber" : "red";
                return (
                  <TableRow key={p.id} className="hover:bg-secondary/60">
                    <TableCell className="font-medium">{u?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{p.plan}</TableCell>
                    <TableCell>R$ {p.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(p.date)}</TableCell>
                    <TableCell><StatusBadge tone={tone}>{p.status}</StatusBadge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

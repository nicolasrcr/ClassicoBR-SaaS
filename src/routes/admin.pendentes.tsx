import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/pendentes")({ component: Pending });

function Pending() {
  const { users, approveUser, rejectUser } = useAppStore();
  const pending = users.filter((u) => !u.approved);
  const [manual, setManual] = useState(true);

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Cadastros pendentes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pending.length} usuários aguardando aprovação</p>
        </div>
        <label className="flex items-center gap-3 rounded-[10px] border border-border bg-card px-4 py-3 text-sm">
          <Switch checked={manual} onCheckedChange={setManual} />
          <span>Aprovação manual de cadastros</span>
        </label>
      </header>

      <div className="rounded-[10px] border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((u) => (
              <TableRow key={u.id} className="hover:bg-secondary/60">
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(u.memberSince)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => { approveUser(u.id); toast.success("Aprovado"); }}>
                      <Check className="h-3 w-3" /> Aprovar
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => { rejectUser(u.id); toast.success("Rejeitado"); }}>
                      <X className="h-3 w-3" /> Rejeitar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pending.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">Nenhum cadastro pendente</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

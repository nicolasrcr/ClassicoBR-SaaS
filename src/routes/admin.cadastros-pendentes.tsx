import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppStore } from "@/store/app-store";
import { useSettingsStore } from "@/store/settings-store";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/cadastros-pendentes")({ component: AdminCadastrosPendentes });

function AdminCadastrosPendentes() {
  const { pendingRegistrations, approveRegistration, rejectRegistration } = useAppStore();
  const settings = useSettingsStore();
  const manual = settings.aprovacaoManualCadastros;

  const approveAll = () => {
    pendingRegistrations.forEach((p) => approveRegistration(p.id));
    toast.success("Todos os cadastros foram aprovados");
  };

  const rejectAll = () => {
    pendingRegistrations.forEach((p) => rejectRegistration(p.id));
    toast.success("Todos os cadastros foram rejeitados");
  };

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Cadastros Pendentes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {manual
              ? `${pendingRegistrations.length} usuário${pendingRegistrations.length !== 1 ? "s" : ""} aguardando aprovação manual`
              : "Aprovação automática ativa — novos cadastros são aprovados imediatamente"}
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-border bg-card px-4 py-3 text-sm">
          <Switch
            checked={manual}
            onCheckedChange={() => settings.toggle("aprovacaoManualCadastros")}
          />
          <span className="font-medium">Aprovação manual de cadastros</span>
        </label>
      </header>

      {!manual ? (
        <div className="rounded-[10px] border border-border bg-card p-10 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="font-medium">Aprovação automática ativa.</p>
          <p className="mt-1 text-sm">
            Novos cadastros são aprovados automaticamente. Ative a aprovação manual para revisar cada cadastro.
          </p>
        </div>
      ) : (
        <>
          {pendingRegistrations.length > 0 && (
            <div className="mb-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={rejectAll}
              >
                <X className="mr-1 h-3 w-3" /> Rejeitar todos
              </Button>
              <Button
                size="sm"
                className="bg-[color:var(--color-cat-complete)] text-white hover:bg-[color:var(--color-cat-complete)]/90"
                onClick={approveAll}
              >
                <Check className="mr-1 h-3 w-3" /> Aprovar todos
              </Button>
            </div>
          )}

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
                {pendingRegistrations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-secondary/60">
                    <TableCell className="font-medium">{reg.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{reg.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(reg.data)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            rejectRegistration(reg.id);
                            toast.success(`Cadastro de ${reg.nome} rejeitado`);
                          }}
                        >
                          <X className="mr-1 h-3 w-3" /> Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[color:var(--color-cat-complete)] text-white hover:bg-[color:var(--color-cat-complete)]/90"
                          onClick={() => {
                            approveRegistration(reg.id);
                            toast.success(`Cadastro de ${reg.nome} aprovado`);
                          }}
                        >
                          <Check className="mr-1 h-3 w-3" /> Aprovar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {pendingRegistrations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-14 text-center">
                      <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Nenhum cadastro pendente no momento</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

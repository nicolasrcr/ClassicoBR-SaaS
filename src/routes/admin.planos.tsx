import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { mockPayments, mockPlans } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/planos")({ component: AdminPlanos });

interface PlanForm {
  name: string;
  price: string;
  limit: string;
  photos: string;
  featured: boolean;
}

const emptyForm: PlanForm = { name: "", price: "", limit: "", photos: "", featured: false };

function AdminPlanos() {
  const users = useAppStore((s) => s.users);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);

  const upd = <K extends keyof PlanForm>(k: K, v: PlanForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Nome do plano é obrigatório");
      return;
    }
    toast.success(`Plano "${form.name}" criado com sucesso`);
    setForm(emptyForm);
    setShowModal(false);
  };

  const exportCSV = () => {
    const header = "ID,Usuário,Plano,Valor,Data,Status";
    const rows = mockPayments.map((p) => {
      const u = users.find((x) => x.id === p.userId);
      return [p.id, u?.name ?? "—", p.plan, p.amount.toFixed(2), p.date, p.status].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pagamentos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  return (
    <div className="space-y-8 p-6 md:p-10">

      {/* ─── Planos ─── */}
      <section>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl">Planos &amp; Pagamentos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerencie planos e veja o histórico de pagamentos</p>
          </div>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => setShowModal(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Novo plano
          </Button>
        </header>

        <div className="rounded-[10px] border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Preço / mês</TableHead>
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
                  <TableCell>
                    {p.price === 0 ? (
                      <span className="text-muted-foreground">Grátis</span>
                    ) : (
                      `R$ ${p.price.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>{p.limit}</TableCell>
                  <TableCell>{p.photos}</TableCell>
                  <TableCell>
                    {p.featured ? (
                      <span className="inline-flex items-center gap-1 text-[color:var(--color-gold)]">
                        <Star className="h-3.5 w-3.5 fill-current" /> Sim
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toast.info("Edição de plano em breve")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => toast.success(`Plano "${p.name}" removido`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ─── Pagamentos ─── */}
      <section>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Histórico de pagamentos</h2>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-1 h-4 w-4" /> Exportar CSV
          </Button>
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
                const tone =
                  p.status === "pago" ? "green" : p.status === "pendente" ? "amber" : "red";
                return (
                  <TableRow key={p.id} className="hover:bg-secondary/60">
                    <TableCell className="font-medium">{u?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{p.plan}</TableCell>
                    <TableCell>R$ {p.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(p.date)}</TableCell>
                    <TableCell>
                      <StatusBadge tone={tone}>{p.status}</StatusBadge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ─── Modal Novo Plano ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-md rounded-[12px] bg-background p-6 shadow-xl">
            <button
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              onClick={() => { setShowModal(false); setForm(emptyForm); }}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-serif text-2xl">Novo plano</h2>
            <p className="mt-1 text-sm text-muted-foreground">Preencha os dados do novo plano de assinatura</p>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="plan-name">Nome do plano</Label>
                <Input
                  id="plan-name"
                  className="mt-1"
                  placeholder="Ex: Premium Semestral"
                  value={form.name}
                  onChange={(e) => upd("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="plan-price">Preço mensal (R$)</Label>
                <Input
                  id="plan-price"
                  className="mt-1"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 49.90"
                  value={form.price}
                  onChange={(e) => upd("price", e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="plan-limit">Limite de anúncios</Label>
                  <Input
                    id="plan-limit"
                    className="mt-1"
                    type="number"
                    min="1"
                    placeholder="Ex: 30"
                    value={form.limit}
                    onChange={(e) => upd("limit", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="plan-photos">Fotos / anúncio</Label>
                  <Input
                    id="plan-photos"
                    className="mt-1"
                    type="number"
                    min="1"
                    placeholder="Ex: 20"
                    value={form.photos}
                    onChange={(e) => upd("photos", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="plan-featured"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-[color:var(--color-terracotta)]"
                  checked={form.featured}
                  onChange={(e) => upd("featured", e.target.checked)}
                />
                <Label htmlFor="plan-featured" className="cursor-pointer font-normal">
                  Badge de destaque
                </Label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowModal(false); setForm(emptyForm); }}>
                Cancelar
              </Button>
              <Button
                className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]"
                onClick={handleSave}
              >
                Criar plano
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

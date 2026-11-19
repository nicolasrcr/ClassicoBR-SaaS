import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, Mail, Pencil, Play, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/format";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/admin/usuarios")({ component: AdminUsers });

function AdminUsers() {
  const { users, listings, updateUser } = useAppStore();
  const [search, setSearch] = useState("");
  const [stat, setStat] = useState("all");
  const [plan, setPlan] = useState("all");
  const [banUser, setBanUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [emailUser, setEmailUser] = useState<User | null>(null);

  const filtered = useMemo(() => users.filter((u) => {
    if (search && ![u.name, u.email].some((x) => x.toLowerCase().includes(search.toLowerCase()))) return false;
    if (stat !== "all" && u.status !== stat) return false;
    if (plan !== "all" && u.plan !== plan) return false;
    return true;
  }), [users, search, stat, plan]);

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6">
        <h1 className="font-serif text-3xl">Usuários</h1>
        <p className="mt-1 text-sm text-muted-foreground">{filtered.length} usuários</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[10px] border border-border bg-card p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Buscar nome ou e-mail" placeholder="Buscar nome ou e-mail…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stat} onValueChange={setStat}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="banido">Banido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos planos</SelectItem>
            <SelectItem value="gratuito">Gratuito</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-[10px] border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Anúncios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Membro desde</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const count = listings.filter((l) => l.sellerId === u.id && l.status === "ativo").length;
              const tone = u.status === "ativo" ? "green" : u.status === "suspenso" ? "amber" : "red";
              return (
                <TableRow key={u.id} className="hover:bg-secondary/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary text-xs">{u.name[0]}</AvatarFallback></Avatar>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.phone}</TableCell>
                  <TableCell className="text-sm">{u.city}/{u.state}</TableCell>
                  <TableCell><StatusBadge tone={u.plan === "premium" ? "blue" : "gray"}>{u.plan}</StatusBadge></TableCell>
                  <TableCell className="text-sm">{count}</TableCell>
                  <TableCell><StatusBadge tone={tone}>{u.status}</StatusBadge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(u.memberSince)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => {
                        const next = u.status === "suspenso" ? "ativo" : "suspenso";
                        updateUser(u.id, { status: next });
                        toast.success(next === "ativo" ? "Reativado" : "Suspenso");
                      }}><Play className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEmailUser(u)}><Mail className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setBanUser(u)}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!banUser} onOpenChange={(o) => !o && setBanUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Banir {banUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>O usuário não poderá mais acessar a plataforma.</AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label className="mb-1.5 block">Motivo</Label>
            <Textarea rows={3} value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Descreva o motivo do banimento…" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (banUser) { updateUser(banUser.id, { status: "banido" }); toast.success("Usuário banido"); setBanUser(null); setBanReason(""); }
            }}>Banir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!emailUser} onOpenChange={(o) => !o && setEmailUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar e-mail para {emailUser?.name}</DialogTitle>
            <DialogDescription>{emailUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1.5 block">Assunto</Label><Input /></div>
            <div><Label className="mb-1.5 block">Mensagem</Label><Textarea rows={5} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailUser(null)}>Cancelar</Button>
            <Button onClick={() => { toast.success("E-mail enviado"); setEmailUser(null); }}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

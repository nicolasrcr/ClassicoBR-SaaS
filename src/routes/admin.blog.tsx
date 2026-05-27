import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Newspaper, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockBlogPosts } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

export const Route = createFileRoute("/admin/blog")({ component: AdminBlog });

const CATS = ["História", "Guia", "Mercado", "Restauração", "Documentação", "Peças", "Manutenção"];

function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", categoria: "Guia", imagemCapa: "", conteudo: "", publishNow: false });

  const upd = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.titulo) { toast.error("Título obrigatório"); return; }
    const post: BlogPost = {
      id: "b" + Date.now(),
      slug: form.titulo.toLowerCase().replace(/\s+/g, "-").slice(0, 40),
      titulo: form.titulo, categoria: form.categoria,
      excerpt: form.conteudo.slice(0, 120) + "…",
      conteudo: form.conteudo,
      imagemCapa: form.imagemCapa || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200",
      tempoLeitura: "5 min",
      dataPublicacao: new Date().toISOString().slice(0, 10),
      status: form.publishNow ? "Publicado" : "Rascunho",
      anunciosRelacionados: [],
    };
    setPosts((prev) => [post, ...prev]);
    toast.success("Artigo salvo com sucesso!");
    setOpen(false);
    setForm({ titulo: "", categoria: "Guia", imagemCapa: "", conteudo: "", publishNow: false });
  };

  const toggleStatus = (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "Publicado" ? "Rascunho" : "Publicado" } : p));
    toast.success("Status atualizado!");
  };

  const del = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Artigo excluído");
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-[color:var(--color-terracotta)]" />
          <h1 className="font-serif text-2xl">Blog</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[color:var(--color-terracotta)] text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo artigo
        </Button>
      </div>

      <div className="rounded-[10px] border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-sm max-w-xs truncate">{p.titulo}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.categoria}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "Publicado" ? "default" : "secondary"} className="text-[10px]">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(p.dataPublicacao)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toggleStatus(p.id)}>
                      {p.status === "Publicado" ? "Despub." : "Publicar"}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* New post dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo artigo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="mb-1 block">Título</Label><Input value={form.titulo} onChange={(e) => upd("titulo", e.target.value)} /></div>
            <div>
              <Label className="mb-1 block">Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => upd("categoria", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="mb-1 block">URL da imagem de capa</Label><Input value={form.imagemCapa} onChange={(e) => upd("imagemCapa", e.target.value)} placeholder="https://…" /></div>
            <div><Label className="mb-1 block">Conteúdo</Label><Textarea rows={6} value={form.conteudo} onChange={(e) => upd("conteudo", e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={form.publishNow as boolean} onCheckedChange={(v) => upd("publishNow", v)} />
              Publicar imediatamente
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} className="bg-[color:var(--color-terracotta)] text-white">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && del(deleteId)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

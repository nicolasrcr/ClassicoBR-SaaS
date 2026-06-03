import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle, Car, Check, CheckCircle2, Eye, MapPin, MoreHorizontal, Pause, Pencil, Play, Search, ShieldAlert, Trash2, X, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryChip } from "@/components/CategoryChip";
import { useAppStore } from "@/store/app-store";
import { BR_STATES } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/format";
import { CATEGORY_LABELS, type Category, type ListingStatus, type Listing } from "@/lib/types";

export const Route = createFileRoute("/admin/anuncios")({ component: AdminListings });

const STATUS_TONE: Record<ListingStatus, "green" | "amber" | "red" | "gray"> = {
  ativo: "green", pendente: "amber", removido: "red", pausado: "gray",
};

// Listings l14 e l11 têm verificação 🔴 (fraude/IP suspeito)
const VERIFICATION_RED = new Set(["l14", "l11"]);
const VERIFICATION_AMBER = new Set(["l3", "l5", "l7"]);

function getVerificationIcon(listingId: string) {
  if (VERIFICATION_RED.has(listingId)) return { Icon: XCircle, tone: "text-red-600", label: "Alerta de fraude" };
  if (VERIFICATION_AMBER.has(listingId)) return { Icon: AlertTriangle, tone: "text-amber-600", label: "Verificação pendente" };
  return { Icon: CheckCircle2, tone: "text-[color:var(--color-cat-complete)]", label: "Verificado" };
}

function VerificationDrawer({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  if (!listing) return null;
  const { listings, users, updateListing } = useAppStore.getState();
  const seller = users.find((u) => u.id === listing.sellerId);
  const isRed = VERIFICATION_RED.has(listing.id);
  const isAmber = VERIFICATION_AMBER.has(listing.id);

  const lastIps = seller?.ipsRecentes?.slice(0, 5) ?? [];

  return (
    <Sheet open={!!listing} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-lg">{listing.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Badge */}
          <div className={`rounded-[8px] border p-3 text-sm ${isRed ? "border-red-300 bg-red-50" : isAmber ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"}`}>
            <p className="font-medium flex items-center gap-2">
              {isRed ? <><XCircle className="h-4 w-4 text-red-600" /> Alerta de fraude detectado</>
                : isAmber ? <><AlertTriangle className="h-4 w-4 text-amber-600" /> Verificação pendente</>
                : <><CheckCircle2 className="h-4 w-4 text-[color:var(--color-cat-complete)]" /> Verificação OK</>}
            </p>
            {isRed && <p className="mt-1 text-xs text-red-700">IP divergente + EXIF suspeito. Requer revisão imediata.</p>}
          </div>

          {/* Localização */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Localização</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Endereço declarado</span><span>{listing.city}, {listing.state}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GPS EXIF</span><span>{listing.verificacaoLocalizacao.fonteB ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IP mais recente</span><span>{listing.verificacaoLocalizacao.fonteC ?? "—"}</span></div>
            </div>
          </div>

          {/* IPs das últimas 5 mensagens */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">IPs das últimas 5 mensagens</h3>
            {lastIps.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados de IP disponíveis.</p>
            ) : (
              <div className="space-y-1">
                {lastIps.map((ip, i) => (
                  <div key={i} className="flex items-center justify-between rounded border border-border bg-secondary px-3 py-1.5 text-xs">
                    <span className="font-mono">{ip.ip}</span>
                    <span className="text-muted-foreground">{ip.cidade}/{ip.estado}</span>
                    <span className="text-muted-foreground">{ip.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Score */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Score de confiança</h3>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${listing.scoreConfianca >= 70 ? "bg-[color:var(--color-cat-complete)]" : listing.scoreConfianca >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${listing.scoreConfianca}%` }}
                />
              </div>
              <span className="text-sm font-medium">{listing.scoreConfianca}/100</span>
            </div>
            {listing.alertaPrecoSuspeito && (
              <p className="mt-2 text-xs text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Preço suspeitamente abaixo do mercado</p>
            )}
            {listing.fotoDuplicadaFlag && (
              <p className="mt-1 text-xs text-amber-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Foto duplicada detectada</p>
            )}
          </div>

          {/* Ação */}
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              useAppStore.getState().updateListing(listing.id, { status: "pendente" });
              toast.success("Marcado para revisão");
              onClose();
            }}
          >
            <ShieldAlert className="mr-2 h-4 w-4" /> Marcar para revisão
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AdminListings() {
  const { listings, users, updateListing, removeListing } = useAppStore();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [state, setState] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [verifyListing, setVerifyListing] = useState<Listing | null>(null);

  const filtered = useMemo(() => {
    const base = listings.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        const seller = users.find((u) => u.id === l.sellerId)?.name ?? "";
        if (![l.title, seller].some((x) => x.toLowerCase().includes(q))) return false;
      }
      if (cat !== "all" && l.category !== cat) return false;
      if (status !== "all" && l.status !== status) return false;
      if (state !== "all" && l.state !== state) return false;
      return true;
    });
    // l14 e l11 aparecem no topo
    const priority = base.filter((l) => VERIFICATION_RED.has(l.id));
    const rest = base.filter((l) => !VERIFICATION_RED.has(l.id));
    return [...priority, ...rest];
  }, [listings, users, search, cat, status, state]);

  const pageSize = 20;
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((l) => l.id)));
  };

  const bulk = (action: "approve" | "pause" | "remove") => {
    selected.forEach((id) => {
      if (action === "approve") updateListing(id, { status: "ativo" });
      if (action === "pause") updateListing(id, { status: "pausado" });
      if (action === "remove") removeListing(id);
    });
    toast.success(`${selected.size} anúncio(s) atualizados`);
    setSelected(new Set());
  };

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6">
        <h1 className="font-serif text-3xl">Anúncios</h1>
        <p className="mt-1 text-sm text-muted-foreground">{filtered.length} anúncios encontrados</p>
      </header>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[10px] border border-border bg-card p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar título ou vendedor…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Select value={cat} onValueChange={(v) => { setCat(v as Category | "all"); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="completo">Completo</SelectItem>
            <SelectItem value="fazer">Para fazer</SelectItem>
            <SelectItem value="pecas">Para peças</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v as ListingStatus | "all"); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="removido">Removido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={state} onValueChange={(v) => { setState(v); setPage(0); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo BR</SelectItem>
            {BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || cat !== "all" || status !== "all" || state !== "all") && (
          <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setCat("all"); setStatus("all"); setState("all"); setPage(0); }}>
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-[10px] border border-border bg-secondary p-3 text-sm">
          <span className="font-medium">{selected.size} selecionados</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => bulk("approve")}><Check className="h-3 w-3 mr-1" /> Aprovar selecionados</Button>
            <Button size="sm" variant="outline" onClick={() => bulk("pause")}><Pause className="h-3 w-3 mr-1" /> Pausar</Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => bulk("remove")}><Trash2 className="h-3 w-3 mr-1" /> Remover</Button>
          </div>
        </div>
      )}

      <div className="rounded-[10px] border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox checked={selected.size === paged.length && paged.length > 0} onCheckedChange={toggleAll} /></TableHead>
              <TableHead>Foto</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead>Verificação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((l) => {
              const seller = users.find((u) => u.id === l.sellerId);
              const verif = getVerificationIcon(l.id);
              return (
                <TableRow key={l.id} className={`hover:bg-secondary/60 ${VERIFICATION_RED.has(l.id) ? "bg-red-50/50" : ""}`}>
                  <TableCell><Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)} /></TableCell>
                  <TableCell>
                    <div className="flex h-10 w-14 items-center justify-center rounded border border-border bg-secondary">
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[160px] truncate">{l.title}</TableCell>
                  <TableCell><StatusBadge tone="blue">{CATEGORY_LABELS[l.category]}</StatusBadge></TableCell>
                  <TableCell className="text-sm">
                    <Link to="/perfil/$id" params={{ id: l.sellerId }} className="underline-offset-2 hover:underline">
                      {seller?.name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{formatPrice(l.price)}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{l.city}/{l.state}</TableCell>
                  <TableCell><StatusBadge tone={STATUS_TONE[l.status]}>{l.status}</StatusBadge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(l.createdAt)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => setVerifyListing(l)}
                      className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
                      title={verif.label}
                      aria-label={verif.label}
                    >
                      <verif.Icon className={`h-4 w-4 ${verif.tone}`} />
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to="/car/$id" params={{ id: l.id }}>
                        <Button size="icon" variant="ghost" title="Ver anúncio"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      {l.status === "pendente" && (
                        <Button size="icon" variant="ghost" title="Aprovar" onClick={() => { updateListing(l.id, { status: "ativo" }); toast.success("Aprovado"); }}>
                          <Check className="h-4 w-4 text-[color:var(--color-cat-complete)]" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" title={l.status === "pausado" ? "Reativar" : "Pausar"} onClick={() => {
                        updateListing(l.id, { status: l.status === "pausado" ? "ativo" : "pausado" });
                        toast.success(l.status === "pausado" ? "Reativado" : "Pausado");
                      }}>
                        {l.status === "pausado" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" title="Editar"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" title="Remover" onClick={() => setDeleteId(l.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Car className="h-8 w-8" />
                    <p className="text-sm font-medium">Nenhum anúncio encontrado</p>
                    <p className="text-xs">Tente ajustar os filtros</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Página {page + 1} de {totalPages} · {filtered.length} resultados</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
          <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Próxima</Button>
        </div>
      </div>

      {/* Modal remoção */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover anúncio?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteId) { removeListing(deleteId); toast.success("Anúncio removido"); setDeleteId(null); }
            }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Drawer verificação */}
      <VerificationDrawer listing={verifyListing} onClose={() => setVerifyListing(null)} />
    </div>
  );
}

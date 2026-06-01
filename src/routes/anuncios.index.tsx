import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronDown, ChevronUp, Grid2X2, List, MapPin, Search,
  SlidersHorizontal, Star, X, Heart, GitCompareArrows, Car,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryChip } from "@/components/CategoryChip";
import { ScoreBadge } from "@/components/ScoreBadge";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatKm, formatPrice } from "@/lib/format";
import { BR_STATES, BRANDS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/anuncios/")({ component: Anuncios });

const CORES = ["Branco", "Preto", "Prata", "Cinza", "Vermelho", "Azul", "Verde", "Amarelo", "Laranja", "Bege", "Marrom", "Roxo"];
const CARROCERIAS = ["Sedan", "Coupe", "Hatch", "Perua/Station", "Pickup", "Conversível", "Van/Kombi", "Buggy"];

function Anuncios() {
  const { listings, filters, setFilter, toggleCategory, resetFilters, compareIds, toggleCompare, clearCompare } = useAppStore();
  const user = useCurrentUser();
  const { toggle, isFavorited } = useFavoritesStore();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [showSidebar, setShowSidebar] = useState(true);
  const [localColor, setLocalColor] = useState("all");
  const [localCity, setLocalCity] = useState("");
  const [localCarroceria, setLocalCarroceria] = useState("all");

  const filtered = useMemo(() => {
    let l = listings.filter((x) => x.status === "ativo");
    if (filters.search) {
      const q = filters.search.toLowerCase();
      l = l.filter((x) => [x.title, x.brand, x.model, String(x.year), x.color].some((f) => f.toLowerCase().includes(q)));
    }
    if (filters.state !== "all") l = l.filter((x) => x.state === filters.state);
    if (filters.category) l = l.filter((x) => x.category === filters.category);
    if (filters.brand && filters.brand !== "all") l = l.filter((x) => x.brand === filters.brand);
    if (filters.anoMin) l = l.filter((x) => x.year >= Number(filters.anoMin));
    if (filters.anoMax) l = l.filter((x) => x.year <= Number(filters.anoMax));
    if (filters.precoMin) l = l.filter((x) => x.price != null && x.price >= Number(filters.precoMin));
    if (filters.precoMax) l = l.filter((x) => x.price != null && x.price <= Number(filters.precoMax));
    if (filters.kmMax) l = l.filter((x) => x.km <= Number(filters.kmMax));
    if (filters.aceitaTroca) l = l.filter((x) => x.situacaoDocumental.aceitaAjudarRegularizacao !== "nao");
    if (filters.unicoDono) l = l.filter((x) => x.situacaoDocumental.transferenciasAcumuladas === "nenhuma");
    if (localColor && localColor !== "all") l = l.filter((x) => x.color.toLowerCase().includes(localColor.toLowerCase()));
    if (localCity) l = l.filter((x) => x.city.toLowerCase().includes(localCity.toLowerCase()));

    if (filters.sort === "preco-asc") l = [...l].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (filters.sort === "preco-desc") l = [...l].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (filters.sort === "proximos") l = [...l].sort((a, b) => parseInt(a.distancia) - parseInt(b.distancia));
    l = [...l].sort((a, b) => Number(!!b.destaquePremium) - Number(!!a.destaquePremium));
    return l;
  }, [listings, filters, localColor, localCity]);

  const activeFiltersCount = [
    filters.brand !== "all" && filters.brand,
    filters.anoMin, filters.anoMax, filters.precoMin, filters.precoMax,
    filters.kmMax, filters.aceitaTroca, filters.unicoDono,
    localColor !== "all" && localColor, localCity, localCarroceria !== "all" && localCarroceria,
  ].filter(Boolean).length;

  function resetAll() {
    resetFilters();
    setLocalColor("all");
    setLocalCity("");
    setLocalCarroceria("all");
  }

  const FilterPanel = () => (
    <div className="space-y-5 text-sm">
      {/* Search */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Marca, modelo, ano…"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Condição */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Condição</Label>
        <div className="flex flex-col gap-1.5">
          {(["completo", "fazer", "pecas"] as const).map((c) => (
            <CategoryChip key={c} cat={c} active={filters.category === c} onClick={() => toggleCategory(c)} />
          ))}
        </div>
      </div>

      {/* Marca */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Marca</Label>
        <Select value={filters.brand || "all"} onValueChange={(v) => setFilter("brand", v)}>
          <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Modelo */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Modelo</Label>
        <Input
          placeholder="Ex: Opala, Fusca…"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          className="h-9 text-xs rounded-lg"
        />
      </div>

      {/* Ano */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Ano</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="De" className="h-9 text-xs rounded-lg" value={filters.anoMin} onChange={(e) => setFilter("anoMin", e.target.value)} />
          <Input type="number" placeholder="Até" className="h-9 text-xs rounded-lg" value={filters.anoMax} onChange={(e) => setFilter("anoMax", e.target.value)} />
        </div>
      </div>

      {/* Preço */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Preço (R$)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Mín" className="h-9 text-xs rounded-lg" value={filters.precoMin} onChange={(e) => setFilter("precoMin", e.target.value)} />
          <Input type="number" placeholder="Máx" className="h-9 text-xs rounded-lg" value={filters.precoMax} onChange={(e) => setFilter("precoMax", e.target.value)} />
        </div>
      </div>

      {/* KM */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">KM máximo</Label>
        <Input type="number" placeholder="Ex: 150000" className="h-9 text-xs rounded-lg" value={filters.kmMax} onChange={(e) => setFilter("kmMax", e.target.value)} />
      </div>

      {/* Cor */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Cor</Label>
        <Select value={localColor} onValueChange={setLocalColor}>
          <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CORES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Estado */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Estado</Label>
        <Select value={filters.state} onValueChange={(v) => setFilter("state", v)}>
          <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo Brasil</SelectItem>
            {BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Cidade */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Cidade</Label>
        <Input
          placeholder="Ex: São Paulo"
          value={localCity}
          onChange={(e) => setLocalCity(e.target.value)}
          className="h-9 text-xs rounded-lg"
        />
      </div>

      {/* Raio */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Raio</Label>
        <Select value={filters.raio} onValueChange={(v) => setFilter("raio", v)}>
          <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer distância</SelectItem>
            <SelectItem value="50">Até 50 km</SelectItem>
            <SelectItem value="100">Até 100 km</SelectItem>
            <SelectItem value="200">Até 200 km</SelectItem>
            <SelectItem value="500">Até 500 km</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-1">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium">Aceita troca</span>
          <Switch checked={filters.aceitaTroca} onCheckedChange={(v) => setFilter("aceitaTroca", v)} />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium">Único dono</span>
          <Switch checked={filters.unicoDono} onCheckedChange={(v) => setFilter("unicoDono", v)} />
        </label>
      </div>

      {/* Reset */}
      {activeFiltersCount > 0 && (
        <button onClick={resetAll} className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3 w-3" /> Limpar filtros ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Top bar */}
      <div className="sticky top-16 z-30 border-b border-border bg-[color:var(--color-background)]/95 backdrop-blur px-6 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Mobile filter drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden flex items-center gap-1.5 text-xs h-8">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-[10px] text-white font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle className="font-serif text-base">Filtros</SheetTitle>
                </SheetHeader>
                <FilterPanel />
              </SheetContent>
            </Sheet>

            {/* Desktop sidebar toggle */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-1.5 text-xs h-8"
              onClick={() => setShowSidebar((v) => !v)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showSidebar ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            <span className="text-sm text-muted-foreground">
              <span className="font-serif font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Select value={filters.sort} onValueChange={(v) => setFilter("sort", v as typeof filters.sort)}>
              <SelectTrigger className="h-8 w-40 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais recentes</SelectItem>
                <SelectItem value="preco-asc">Menor preço</SelectItem>
                <SelectItem value="preco-desc">Maior preço</SelectItem>
                <SelectItem value="proximos">Mais próximos</SelectItem>
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={cn("flex h-8 w-8 items-center justify-center transition-colors", view === "grid" ? "bg-[color:var(--color-terracotta)] text-white" : "text-muted-foreground hover:text-foreground")}
              >
                <Grid2X2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("flex h-8 w-8 items-center justify-center transition-colors", view === "list" ? "bg-[color:var(--color-terracotta)] text-white" : "text-muted-foreground hover:text-foreground")}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          {showSidebar && (
            <aside className="hidden md:block w-56 lg:w-64 shrink-0">
              <div className="sticky top-36 rounded-[10px] border border-border bg-card p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-sm font-semibold">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-[10px] text-white font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <FilterPanel />
              </div>
            </aside>
          )}

          {/* Listings */}
          <main className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <EmptyState description="Tente remover alguns filtros ou buscar por outro termo." />
            ) : view === "grid" ? (
              <div className={cn(
                "grid gap-5",
                showSidebar
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}>
                {filtered.map((listing) => {
                  const color = CATEGORY_COLORS[listing.category];
                  const favorited = user ? isFavorited(user.id, listing.id) : false;
                  return (
                    <div key={listing.id} className="car-card group relative flex flex-col overflow-hidden rounded-[10px] border border-border bg-card">
                      {listing.destaquePremium && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-[color:var(--color-gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                          ★ Destaque
                        </span>
                      )}

                      {/* Favorite */}
                      {user && (
                        <button
                          className={cn(
                            "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm shadow transition-all",
                            favorited ? "bg-[color:var(--color-terracotta)] text-white" : "bg-black/50 text-white hover:bg-black/70"
                          )}
                          onClick={(e) => { e.preventDefault(); toggle(user.id, listing.id); }}
                        >
                          <Heart className={cn("h-3.5 w-3.5 transition-transform", favorited ? "fill-white scale-110" : "")} />
                        </button>
                      )}

                      <Link to="/anuncios/$id" params={{ id: listing.id }} className="flex flex-1 flex-col">
                        {/* Image */}
                        <div className="relative flex aspect-[16/10] items-center justify-center bg-secondary overflow-hidden">
                          {listing.photos.length > 0 ? (
                            <img src={listing.photos[0]} alt={listing.title} className="car-card-img h-full w-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Car className="h-12 w-12 text-muted-foreground/25" strokeWidth={1} />
                              <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-widest">Sem foto</span>
                            </div>
                          )}
                          <div className="img-overlay absolute inset-0" />
                          <span
                            className="absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow"
                            style={{ backgroundColor: color }}
                          >
                            {CATEGORY_LABELS[listing.category]}
                          </span>
                          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            {listing.year}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 flex-col gap-2 p-4">
                          <div>
                            <h3 className="font-serif text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-[color:var(--color-terracotta)] transition-colors">
                              {listing.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {listing.year} · {listing.engine} · {listing.color}
                            </p>
                          </div>

                          {/* Stars + km */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const seller = undefined; // score from listing
                                const score = listing.scoreConfianca / 20;
                                return (
                                  <Star
                                    key={i}
                                    className={cn("h-3 w-3", i < Math.round(score) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                                  />
                                );
                              })}
                            </div>
                            <span>· {formatKm(listing.km)}</span>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            <ScoreBadge score={listing.scoreConfianca} />
                          </div>

                          {/* Price + location */}
                          <div className="mt-auto flex items-end justify-between pt-2 border-t border-border/60">
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">Preço</p>
                              <p className="font-serif text-lg font-semibold leading-none">
                                {listing.price ? formatPrice(listing.price) : <span className="text-sm text-muted-foreground">A combinar</span>}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span>{listing.city}, {listing.state}</span>
                              </div>
                              <span className="text-[10px]">{listing.distancia}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List view */
              <div className="flex flex-col gap-3">
                {filtered.map((listing) => {
                  const color = CATEGORY_COLORS[listing.category];
                  const favorited = user ? isFavorited(user.id, listing.id) : false;
                  const inCompare = compareIds.includes(listing.id);
                  return (
                    <div key={listing.id} className="group relative flex rounded-[10px] border border-border bg-card overflow-hidden hover:border-[color:var(--color-terracotta)]/40 transition-colors">
                      <Link to="/anuncios/$id" params={{ id: listing.id }} className="flex flex-1 gap-4">
                        {/* Thumb */}
                        <div className="relative flex w-44 shrink-0 items-center justify-center bg-secondary overflow-hidden">
                          {listing.photos.length > 0 ? (
                            <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <Car className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.2} />
                          )}
                          <span
                            className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow"
                            style={{ backgroundColor: color }}
                          >
                            {CATEGORY_LABELS[listing.category]}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col justify-between py-4 pr-4">
                          <div>
                            <h3 className="font-serif text-base font-semibold group-hover:text-[color:var(--color-terracotta)] transition-colors">
                              {listing.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {listing.year} · {listing.engine} · {listing.color} · {formatKm(listing.km)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <ScoreBadge score={listing.scoreConfianca} />
                            </div>
                          </div>

                          <div className="flex items-end justify-between mt-3">
                            <p className="font-serif text-xl font-semibold">
                              {listing.price ? formatPrice(listing.price) : <span className="text-sm text-muted-foreground font-sans">A combinar</span>}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{listing.city}, {listing.state} — {listing.distancia}</span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Actions */}
                      <div className="flex flex-col items-center justify-center gap-2 px-3 border-l border-border">
                        {user && (
                          <button
                            onClick={() => toggle(user.id, listing.id)}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                              favorited ? "bg-[color:var(--color-terracotta)] text-white" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Heart className={cn("h-3.5 w-3.5", favorited && "fill-white")} />
                          </button>
                        )}
                        <button
                          onClick={() => toggleCompare(listing.id)}
                          disabled={!inCompare && compareIds.length >= 3}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                            inCompare ? "bg-[color:var(--color-terracotta)] text-white" : "text-muted-foreground hover:text-foreground disabled:opacity-30"
                          )}
                        >
                          <GitCompareArrows className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Compare bar */}
      {compareIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3 rounded-full bg-[color:var(--color-charcoal)] px-5 py-3 shadow-2xl text-white text-sm border border-white/10">
          <span className="font-medium">{compareIds.length} veículos selecionados</span>
          <Button asChild size="sm" className="btn-terra text-white rounded-full border-0 h-7 px-4 text-xs">
            <Link to="/comparar">Comparar agora</Link>
          </Button>
          <button onClick={clearCompare} className="text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

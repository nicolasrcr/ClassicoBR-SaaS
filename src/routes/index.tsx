import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Search, X, TrendingUp, Shield, MapPin, SlidersHorizontal, ShieldCheck, Sparkles, Award, Handshake } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryChip } from "@/components/CategoryChip";
import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatKm, formatPrice } from "@/lib/format";
import { BR_STATES, BRANDS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Heart, Car, Star } from "lucide-react";
import heroImage from "@/assets/hero-classic-car.jpg";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { listings, filters, setFilter, toggleCategory, resetFilters, compareIds, toggleCompare, clearCompare } = useAppStore();
  const user = useCurrentUser();
  const { toggle, isFavorited } = useFavoritesStore();
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let l = listings.filter((x) => x.status === "ativo");
    if (filters.search) {
      const q = filters.search.toLowerCase();
      l = l.filter((x) => [x.title, x.brand, x.model, String(x.year)].some((f) => f.toLowerCase().includes(q)));
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
    if (filters.sort === "preco-asc") l = [...l].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (filters.sort === "preco-desc") l = [...l].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    // Premium destacados sempre primeiro
    l = [...l].sort((a, b) => Number(!!b.destaquePremium) - Number(!!a.destaquePremium));
    return l;
  }, [listings, filters]);

  const totals = useMemo(() => {
    const active = listings.filter((l) => l.status === "ativo");
    const cities = new Set(active.map((l) => l.city));
    const sellers = new Set(active.map((l) => l.sellerId));
    return { total: active.length, cities: cities.size, sellers: sellers.size };
  }, [listings]);

  const activeFiltersCount = [
    filters.brand !== "all" && filters.brand,
    filters.anoMin, filters.anoMax, filters.precoMin, filters.precoMax, filters.kmMax,
    filters.aceitaTroca, filters.unicoDono,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ── Premium Hero ── */}
      <section className="hero-dark relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <img
          src={heroImage}
          alt="Chevrolet Opala clássico em rua de paralelepípedos ao pôr do sol"
          width={1600}
          height={1100}
          className="absolute inset-0 h-full w-full object-cover opacity-45 md:opacity-60 scale-105"
        />
        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a09] via-[#0c0a09]/85 to-[#0c0a09]/20 md:via-[#0c0a09]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/30 to-transparent" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[color:var(--color-terracotta)]/25 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[color:var(--color-gold)]/15 blur-[110px] pointer-events-none" />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            {/* Left: copy */}
            <div className="md:col-span-7 lg:col-span-7">
              {/* Eyebrow */}
              <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-md px-4 py-1.5 animate-fade-up">
                <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-white/80">O marketplace dos clássicos</span>
              </div>

              <h1 className="font-serif font-semibold text-white leading-[0.98] tracking-tight text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] animate-fade-up animate-fade-up-1">
                A história
                <br />
                <span className="text-white/95">sobre </span>
                <span className="italic bg-gradient-to-r from-[color:var(--color-terracotta-light)] via-[color:var(--color-gold-light)] to-[color:var(--color-terracotta-light)] bg-clip-text text-transparent">
                  quatro rodas
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/70 animate-fade-up animate-fade-up-2">
                Compre e venda Opalas, Fuscas, Galaxies, Mavericks e outras lendas
                com <span className="text-white font-medium">histórico declarado pelo vendedor</span>
                e contato direto com o dono.
              </p>

              {/* Inline glass search */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] max-w-xl animate-fade-up animate-fade-up-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                    placeholder="Busque por Opala, Maverick, Fusca…"
                    className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none"
                  />
                </div>
                <Link
                  to="/anuncios"
                  className="inline-flex h-11 items-center gap-2 rounded-xl btn-terra px-5 text-sm font-semibold text-white whitespace-nowrap"
                >
                  Buscar
                </Link>
              </form>

              {/* CTAs */}
              <div className="mt-5 flex flex-wrap items-center gap-4 animate-fade-up animate-fade-up-3">
                <Link
                  to="/anunciar"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 hover:border-white/40 transition-all"
                >
                  <Plus className="h-4 w-4" /> Anunciar meu carro
                </Link>
                <Link
                  to="/compra-segura"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[color:var(--color-terracotta-light)]" />
                  Como funciona a compra segura
                </Link>
              </div>

              {/* Inline trust avatars */}
              <div className="mt-8 flex items-center gap-4 animate-fade-up animate-fade-up-3">
                <div className="flex -space-x-2">
                  {["#C4552A", "#C9943A", "#1d6e4e", "#185fa5"].map((c, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-[#0c0a09] ring-1 ring-white/10"
                      style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }}
                    />
                  ))}
                </div>
                <div className="text-xs text-white/60">
                  <div className="flex items-center gap-1 text-[color:var(--color-gold-light)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                    <span className="ml-1.5 text-white font-semibold">4.9</span>
                  </div>
                  <span>+{totals.sellers} vendedores verificados</span>
                </div>
              </div>
            </div>

            {/* Right: floating premium stat card (desktop only) */}
            <div className="hidden md:block md:col-span-5 lg:col-span-5 relative">
              <div className="relative ml-auto max-w-sm">
                {/* Glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[color:var(--color-terracotta)]/30 via-transparent to-[color:var(--color-gold)]/20 blur-2xl rounded-3xl" />

                {/* Card */}
                <div className="relative rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-2xl p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-terracotta)]/20 border border-[color:var(--color-terracotta)]/40">
                        <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-terracotta-light)]" />
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-white/60 font-medium">Marketplace dos clássicos</span>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  </div>

                  <div className="space-y-4">
                    {[
                      { value: totals.total, label: "anúncios ativos", icon: TrendingUp, accent: "terracotta" },
                      { value: totals.cities, label: "cidades cobertas", icon: MapPin, accent: "gold" },
                      { value: totals.sellers, label: "vendedores", icon: Shield, accent: "terracotta" },
                    ].map(({ value, label, icon: Icon }, i) => (
                      <div
                        key={label}
                        className={`animate-fade-up animate-fade-up-${i + 1} flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3.5 hover:bg-white/[0.07] hover:border-white/20 transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--color-terracotta)]/15 border border-[color:var(--color-terracotta)]/25">
                            <Icon className="h-4 w-4 text-[color:var(--color-terracotta-light)]" />
                          </div>
                          <span className="text-xs uppercase tracking-wider text-white/60">{label}</span>
                        </div>
                        <span className="stat-number text-2xl text-white tabular-nums">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-white/50">Atualizado agora</span>
                    <Link to="/anuncios" className="text-xs text-[color:var(--color-terracotta-light)] hover:text-white font-semibold transition-colors">
                      Ver tudo →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4 px-6">
          {[
            { icon: ShieldCheck, title: "Histórico transparente", desc: "Vendedor declara chassi, motor e situação fiscal" },
            { icon: Sparkles, title: "Score de confiança", desc: "Anunciantes com histórico" },
            { icon: Handshake, title: "Contato direto", desc: "Sem atravessador, sem taxa" },
            { icon: Award, title: "Curadoria de clássicos", desc: "Só carros 20+ anos" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 py-5 md:py-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-terracotta)]/10 text-[color:var(--color-terracotta)]">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Filter Bar (floating) ── */}
      <div className="sticky top-16 z-30 px-6 py-3 bg-[color:var(--color-background)]/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por marca, modelo, ano…"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                className="h-10 pl-10 bg-card border-border focus:border-[color:var(--color-terracotta)] focus:ring-[color:var(--color-terracotta)]/20 rounded-lg"
              />
            </div>

            {/* State */}
            <Select value={filters.state} onValueChange={(v) => setFilter("state", v)}>
              <SelectTrigger className="h-10 md:w-44 bg-card rounded-lg">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo Brasil</SelectItem>
                {BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={filters.sort} onValueChange={(v) => setFilter("sort", v as typeof filters.sort)}>
              <SelectTrigger className="h-10 md:w-44 bg-card rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais recentes</SelectItem>
                <SelectItem value="preco-asc">Menor preço</SelectItem>
                <SelectItem value="preco-desc">Maior preço</SelectItem>
                <SelectItem value="proximos">Mais próximos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category chips + advanced toggle */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(["completo", "fazer", "pecas"] as const).map((c) => (
              <CategoryChip key={c} cat={c} active={filters.category === c} onClick={() => toggleCategory(c)} />
            ))}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? "border-[color:var(--color-terracotta)] bg-[color:var(--color-terracotta)]/8 text-[color:var(--color-terracotta)]"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-[10px] text-white font-bold">
                    {activeFiltersCount}
                  </span>
                )}
                {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3 w-3" /> Limpar
                </button>
              )}
            </div>
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="mt-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Marca</Label>
                  <Select value={filters.brand || "all"} onValueChange={(v) => setFilter("brand", v)}>
                    <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ano de</Label>
                  <Input type="number" placeholder="1950" className="h-9 text-xs rounded-lg" value={filters.anoMin} onChange={(e) => setFilter("anoMin", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ano até</Label>
                  <Input type="number" placeholder="2005" className="h-9 text-xs rounded-lg" value={filters.anoMax} onChange={(e) => setFilter("anoMax", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">KM máximo</Label>
                  <Input type="number" placeholder="200.000" className="h-9 text-xs rounded-lg" value={filters.kmMax} onChange={(e) => setFilter("kmMax", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Preço mínimo</Label>
                  <Input type="number" placeholder="R$ 0" className="h-9 text-xs rounded-lg" value={filters.precoMin} onChange={(e) => setFilter("precoMin", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Preço máximo</Label>
                  <Input type="number" placeholder="R$ 500.000" className="h-9 text-xs rounded-lg" value={filters.precoMax} onChange={(e) => setFilter("precoMax", e.target.value)} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={filters.aceitaTroca} onCheckedChange={(v) => setFilter("aceitaTroca", v)} />
                    <span className="font-medium">Aceita troca</span>
                  </label>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={filters.unicoDono} onCheckedChange={(v) => setFilter("unicoDono", v)} />
                    <span className="font-medium">Único dono</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* Results header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="font-serif text-2xl font-semibold text-foreground">{filtered.length}</span>
            <span className="ml-1.5 text-sm text-muted-foreground">
              {filtered.length === 1 ? "resultado" : "resultados"}
              {filters.category ? ` em ${filters.category === "completo" ? "Carro completo" : filters.category === "fazer" ? "Para fazer" : "Peças"}` : ""}
            </span>
          </div>
          <Link
            to="/anuncios"
            className="text-xs text-[color:var(--color-terracotta)] hover:underline font-medium"
          >
            Ver todos com filtros avançados →
          </Link>
        </div>

        {/* Grid — todos os ativos */}
        {filtered.length === 0 ? (
          <EmptyState description="Tente remover alguns filtros ou buscar por outro termo." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => {
              const color = CATEGORY_COLORS[listing.category];
              const favorited = user ? isFavorited(user.id, listing.id) : false;
              const sellerStars = Math.round(listing.scoreConfianca / 20);
              return (
                <div key={listing.id} className="car-card group relative flex flex-col overflow-hidden rounded-[10px] border border-border bg-card">
                  {listing.destaquePremium && (
                    <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[color:var(--color-gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                      <Sparkles className="h-3 w-3" /> Destaque
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
                      <Heart className={cn("h-3.5 w-3.5", favorited ? "fill-white scale-110" : "")} />
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
                          {listing.engine} · {listing.color}
                        </p>
                      </div>

                      {/* Stars + km */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn("h-3 w-3", i < sellerStars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                            />
                          ))}
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
                          <p className="font-serif text-lg font-semibold leading-none text-foreground">
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
        )}

        {/* CTA ver todos */}
        {filtered.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/anuncios"
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-terracotta)] px-6 py-2.5 text-sm font-medium text-[color:var(--color-terracotta)] hover:bg-[color:var(--color-terracotta)]/5 transition-colors"
            >
              Ver todos os {totals.total} anúncios →
            </Link>
          </div>
        )}
      </main>

      {/* ── Eventos & Serviços ── */}
      <section className="border-t border-border bg-card/40 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terracotta)] font-semibold">Mais da comunidade</p>
              <h2 className="font-serif text-3xl md:text-4xl mt-2">Vá além do anúncio</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link to="/eventos" className="car-card group relative overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[21/9] overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200" alt="Encontros de clássicos" className="car-card-img h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-wider text-[color:var(--color-terracotta)] font-semibold">Agenda</p>
                <h3 className="font-serif text-xl mt-1">Encontros, exposições e rallies</h3>
                <p className="mt-2 text-sm text-muted-foreground">Veja os próximos eventos de clássicos perto de você — ou divulgue o seu.</p>
                <span className="mt-3 inline-flex text-xs font-semibold text-[color:var(--color-terracotta)] group-hover:underline">Ver agenda completa →</span>
              </div>
            </Link>
            <Link to="/servicos" className="car-card group relative overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[21/9] overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1632823471565-1ecdf5c6dab1?w=1200" alt="Oficinas e auto-peças" className="car-card-img h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-wider text-[color:var(--color-terracotta)] font-semibold">Serviços & Peças</p>
                <h3 className="font-serif text-xl mt-1">Oficinas, auto-peças e classificados</h3>
                <p className="mt-2 text-sm text-muted-foreground">Toda publicação com validação de IP, fingerprint e metadados das fotos.</p>
                <span className="mt-3 inline-flex text-xs font-semibold text-[color:var(--color-terracotta)] group-hover:underline">Explorar →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Compare bar ── */}
      {compareIds.length >= 2 && (
        <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3 rounded-full bg-[color:var(--color-charcoal)] px-5 py-3 shadow-2xl text-white text-sm border border-white/10">
          <span className="font-medium">{compareIds.length} veículos selecionados</span>
          <Button asChild size="sm" className="btn-terra text-white rounded-full border-0 h-7 px-4 text-xs">
            <Link to="/comparar">Comparar agora</Link>
          </Button>
          <button onClick={clearCompare} className="text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── FAB Anunciar ── */}
      <Link
        to="/anunciar"
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full btn-terra px-5 py-3 text-sm font-semibold text-white shadow-xl"
      >
        <Plus className="h-4 w-4" /> Anunciar
      </Link>

      <Footer />
    </div>
  );
}

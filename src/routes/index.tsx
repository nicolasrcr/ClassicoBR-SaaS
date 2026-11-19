import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, X, TrendingUp, Shield, MapPin, ShieldCheck, Sparkles, Award, Handshake } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatKm, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Heart, Car, Star } from "lucide-react";
import heroImage from "@/assets/hero-classic-car.jpg";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { listings, compareIds, clearCompare } = useAppStore();
  const user = useCurrentUser();
  const { toggle, isFavorited } = useFavoritesStore();
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState("");

  const destaques = useMemo(() => {
    const active = listings.filter((x) => x.status === "ativo");
    // Premium primeiro, depois mais recentes (por createdAt se existir, senão ordem original)
    const sorted = [...active].sort(
      (a, b) => Number(!!b.destaquePremium) - Number(!!a.destaquePremium)
    );
    return sorted.slice(0, 6);
  }, [listings]);

  const totals = useMemo(() => {
    const active = listings.filter((l) => l.status === "ativo");
    const cities = new Set(active.map((l) => l.city));
    const sellers = new Set(active.map((l) => l.sellerId));
    return { total: active.length, cities: cities.size, sellers: sellers.size };
  }, [listings]);

  function submitHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = heroQuery.trim();
    navigate({ to: "/anuncios", search: q ? { q, page: 1 } : { page: 1 } });
  }

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
                <span className="text-xs font-medium tracking-[0.18em] uppercase text-white/80">O marketplace dos clássicos</span>
              </div>

              <h1 className="font-serif font-semibold text-white leading-[0.98] tracking-tight text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] animate-fade-up animate-fade-up-1">
                A história
                <br />
                <span className="text-white/95">sobre </span>
                <span className="italic bg-gradient-to-r from-[color:var(--color-terracotta-light)] via-[color:var(--color-gold-light)] to-[color:var(--color-terracotta-light)] bg-clip-text text-transparent">
                  quatro rodas
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/85 animate-fade-up animate-fade-up-2">
                Encontre o Opala, o Fusca ou o Maverick que você procura, ou anuncie o seu para quem
                valoriza de verdade. Com <span className="text-white font-medium">histórico declarado pelo vendedor</span>{" "}
                e conversa direto com o dono.
              </p>

              {/* Inline glass search */}
              <form
                onSubmit={submitHeroSearch}
                className="mt-8 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] max-w-xl animate-fade-up animate-fade-up-2"
                role="search"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" aria-hidden="true" />
                  <input
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    placeholder="Busque por Opala, Maverick, Fusca…"
                    aria-label="Buscar carros clássicos"
                    className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-white placeholder:text-white/55 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-2 rounded-xl btn-terra px-5 text-sm font-semibold text-white whitespace-nowrap"
                >
                  Buscar
                </button>
              </form>

              {/* CTAs */}
              <div className="mt-5 flex flex-wrap items-center gap-4 animate-fade-up animate-fade-up-3">
                <Link
                  to="/anunciar"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.04] backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 hover:border-white/40 transition-all"
                >
                  <Plus className="h-4 w-4" /> Anunciar meu clássico
                </Link>
                <Link
                  to="/compra-segura"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[color:var(--color-terracotta-light)]" />
                  Como funciona a compra segura
                </Link>
              </div>

              {/* Prova real: só números do próprio marketplace */}
              <p className="mt-8 text-xs text-white/80 animate-fade-up animate-fade-up-3">
                {totals.total} anúncios ativos de {totals.sellers} vendedores em {totals.cities} cidades
              </p>
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
                      <span className="text-xs uppercase tracking-wider text-white/60 font-medium">Marketplace dos clássicos</span>
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
                    <span className="text-xs text-white/50">Os anúncios mais recentes</span>
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
      {/* ── Destaques ── */}
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-terracotta)] font-semibold">
              Em destaque
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2">Clássicos selecionados</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Uma curadoria dos anúncios premium e mais recentes. Use o filtro completo para explorar tudo.
            </p>
          </div>
          <Link
            to="/anuncios"
            className="text-sm font-medium text-[color:var(--color-terracotta)] hover:underline"
          >
            Ver todos os {totals.total} anúncios →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destaques.map((listing) => {
            const color = CATEGORY_COLORS[listing.category];
            const favorited = user ? isFavorited(user.id, listing.id) : false;
            const sellerStars = Math.round(listing.scoreConfianca / 20);
            return (
              <div key={listing.id} className="car-card group relative flex flex-col overflow-hidden rounded-[10px] border border-border bg-card">
                {listing.destaquePremium && (
                  <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[color:var(--color-gold)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                    <Sparkles className="h-3 w-3" /> Destaque
                  </span>
                )}

                {user && (
                  <button
                    aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    className={cn(
                      "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm shadow transition-all",
                      favorited ? "bg-[color:var(--color-terracotta)] text-white" : "bg-black/50 text-white hover:bg-black/70"
                    )}
                    onClick={(e) => { e.preventDefault(); toggle(user.id, listing.id); }}
                  >
                    <Heart className={cn("h-3.5 w-3.5", favorited ? "fill-white scale-110" : "")} />
                  </button>
                )}

                <Link to="/anuncios/$id" params={{ id: listing.id }} className="flex flex-1 flex-col">
                  <div className="relative flex aspect-[16/10] items-center justify-center bg-secondary overflow-hidden">
                    {listing.photos.length > 0 ? (
                      <img src={listing.photos[0]} alt={listing.title} className="car-card-img h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Car className="h-12 w-12 text-muted-foreground/25" strokeWidth={1} />
                        <span className="text-xs text-muted-foreground/40 font-medium uppercase tracking-widest">Sem foto</span>
                      </div>
                    )}
                    <div className="img-overlay absolute inset-0" />
                    <span
                      className="absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white shadow"
                      style={{ backgroundColor: color }}
                    >
                      {CATEGORY_LABELS[listing.category]}
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white">
                      {listing.year}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div>
                      <h3 className="font-serif text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-[color:var(--color-terracotta)] transition-colors">
                        {listing.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {listing.engine} · {listing.color}
                      </p>
                    </div>

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

                    <div className="flex flex-wrap gap-1.5">
                      <ScoreBadge score={listing.scoreConfianca} />
                    </div>

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
                        <span className="text-xs">{listing.distancia}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/anuncios"
            className="inline-flex items-center gap-2 rounded-lg btn-terra px-7 py-3 text-sm font-semibold text-white shadow-lg"
          >
            Ver todos os {totals.total} anúncios →
          </Link>
        </div>
      </main>

      {/* ── Eventos & Serviços ── */}
      <section className="border-t border-border bg-card/40 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-terracotta)] font-semibold">Mais da comunidade</p>
              <h2 className="font-serif text-3xl md:text-4xl mt-2">Vá além do anúncio</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link to="/eventos" className="car-card group relative overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[21/9] overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200" alt="Encontros de clássicos" className="car-card-img h-full w-full object-cover" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-[color:var(--color-terracotta)] font-semibold">Agenda</p>
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
                <p className="text-xs uppercase tracking-wider text-[color:var(--color-terracotta)] font-semibold">Serviços & Peças</p>
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

      <Footer />
    </div>
  );
}

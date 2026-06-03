import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, ArrowRight, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { formatPrice } from "@/lib/format";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";

export const Route = createFileRoute("/favoritos")({ component: Favoritos });

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function Favoritos() {
  const user = useCurrentUser();
  const { listings } = useAppStore();
  const { favorites, toggle } = useFavoritesStore();

  if (!user) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Heart className="h-14 w-14 mx-auto mb-6 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl mb-3">Faça login para ver seus favoritos</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Salve os clássicos que te interessam e acompanhe os preços.
          </p>
          <Button asChild className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta)]/90">
            <Link to="/login">Entrar na conta</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const myFavs = favorites.filter((f) => f.usuarioId === user.id);
  const myListings = myFavs
    .map((f) => ({ fav: f, listing: listings.find((l) => l.id === f.anuncioId) }))
    .filter((x) => x.listing !== undefined) as { fav: typeof myFavs[0]; listing: typeof listings[0] }[];

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
      <Header />
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl flex items-center gap-3">
            <Heart className="h-7 w-7 text-[color:var(--color-terracotta)] fill-[color:var(--color-terracotta)]" />
            Meus Favoritos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {myListings.length === 0
              ? "Nenhum clássico salvo"
              : `${myListings.length} clássico${myListings.length !== 1 ? "s" : ""} salvo${myListings.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {myListings.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-[color:var(--color-border-cream)] bg-white py-24 px-6 text-center shadow-sm">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--color-terracotta)]/10 mb-6">
              <Heart className="h-10 w-10 text-[color:var(--color-terracotta)]/60" />
            </div>
            <h2 className="font-serif text-2xl mb-3">Você ainda não salvou nenhum anúncio</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
              Explore os clássicos disponíveis e clique no coração para salvar os que mais te interessam.
            </p>
            <Button asChild className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta)]/90">
              <Link to="/anuncios" className="flex items-center gap-2">
                Explorar anúncios <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myListings.map(({ fav, listing }) => {
              const days = daysSince(fav.salvoEm);
              const catColor = CATEGORY_COLORS[listing.category];
              return (
                <div
                  key={fav.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[color:var(--color-border-cream)] bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Photo */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                    {listing.photos[0] ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/30">
                        Sem foto
                      </div>
                    )}
                    {/* Saved badge */}
                    <div className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-[10px] text-white">
                      Salvo há {days} dia{days !== 1 ? "s" : ""}
                    </div>
                    {/* Category badge */}
                    <div
                      className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: catColor }}
                    >
                      {CATEGORY_LABELS[listing.category]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-serif text-base leading-snug line-clamp-2 mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {listing.city}, {listing.state}
                    </p>

                    {/* Price */}
                    <p className="text-lg font-bold text-foreground mb-4">
                      {formatPrice(listing.price)}
                    </p>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      <Button asChild size="sm" className="flex-1 bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta)]/90">
                        <Link to="/anuncios/$id" params={{ id: listing.id }} className="flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Ver anúncio
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        onClick={() => toggle(user.id, listing.id)}
                        title="Remover dos favoritos"
                      >
                        <Heart className="h-3.5 w-3.5 fill-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse more CTA */}
        {myListings.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/anuncios"
              className="inline-flex items-center gap-2 text-sm text-[color:var(--color-terracotta)] hover:underline"
            >
              Explorar mais anúncios <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

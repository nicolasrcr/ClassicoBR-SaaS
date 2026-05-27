import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Car, ArrowRight } from "lucide-react";
import type { Listing } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { FipeTag } from "./FipeTag";
import { ScoreBadge } from "./ScoreBadge";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { cn } from "@/lib/utils";

interface CarCardProps {
  listing: Listing;
  showCompare?: boolean;
}

export function CarCard({ listing, showCompare = false }: CarCardProps) {
  const color = CATEGORY_COLORS[listing.category];
  const user = useCurrentUser();
  const { compareIds, toggleCompare } = useAppStore();
  const { toggle, isFavorited } = useFavoritesStore();
  const favorited = user ? isFavorited(user.id, listing.id) : false;
  const inCompare = compareIds.includes(listing.id);

  return (
    <div className="car-card group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Compare checkbox */}
      {showCompare && (
        <label
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white shadow cursor-pointer hover:bg-black/75 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={inCompare}
            onChange={() => toggleCompare(listing.id)}
            className="h-3 w-3 accent-[color:var(--color-terracotta)]"
          />
          Comparar
        </label>
      )}

      {/* Favorite button */}
      {user && (
        <button
          className={cn(
            "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm shadow transition-all",
            favorited
              ? "bg-[color:var(--color-terracotta)] text-white"
              : "bg-black/50 text-white hover:bg-black/70"
          )}
          onClick={(e) => { e.preventDefault(); toggle(user.id, listing.id); }}
        >
          <Heart className={cn("h-3.5 w-3.5 transition-transform", favorited ? "fill-white scale-110" : "")} />
        </button>
      )}

      <Link to="/anuncios/$id" params={{ id: listing.id }} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative flex aspect-[16/10] items-center justify-center bg-[color:var(--color-cream-dark)] overflow-hidden">
          {listing.photos.length > 0 ? (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="car-card-img h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Car className="h-14 w-14 text-muted-foreground/25" strokeWidth={1} />
              <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-widest">Sem foto</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="img-overlay absolute inset-0" />

          {/* Category badge */}
          <span
            className="absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow"
            style={{ backgroundColor: color }}
          >
            {CATEGORY_LABELS[listing.category]}
          </span>

          {/* Year badge */}
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
              {listing.engine} · {listing.color} · {listing.km?.toLocaleString("pt-BR")} km
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <FipeTag perc={listing.percFipe} />
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{listing.city}, {listing.state}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Favorite } from "@/lib/types";
import { mockFavorites } from "@/lib/mock-data";

interface FavoritesState {
  favorites: Favorite[];
  toggle: (userId: string, anuncioId: string) => void;
  isFavorited: (userId: string, anuncioId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: mockFavorites,
      toggle: (userId, anuncioId) => {
        const exists = get().favorites.find((f) => f.usuarioId === userId && f.anuncioId === anuncioId);
        if (exists) {
          set((s) => ({ favorites: s.favorites.filter((f) => f.id !== exists.id) }));
        } else {
          set((s) => ({
            favorites: [
              ...s.favorites,
              { id: "f" + Date.now(), usuarioId: userId, anuncioId, salvoEm: new Date().toISOString().slice(0, 10) },
            ],
          }));
        }
      },
      isFavorited: (userId, anuncioId) =>
        get().favorites.some((f) => f.usuarioId === userId && f.anuncioId === anuncioId),
    }),
    { name: "classicosbr-favorites" },
  ),
);

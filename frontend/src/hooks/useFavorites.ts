"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/api";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadFavorites = () => {
      const stored = localStorage.getItem("enstore_favorites");
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }
      setLoaded(true);
    };

    loadFavorites();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "enstore_favorites") {
        loadFavorites();
      }
    };

    const handleCustomEvent = () => loadFavorites();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favorites-updated", handleCustomEvent);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorites-updated", handleCustomEvent);
    };
  }, []);

  const toggleFavorite = (product: Product) => {
    const exists = favorites.find((p) => p.id === product.id);
    let newFavs;
    if (exists) {
      newFavs = favorites.filter((p) => p.id !== product.id);
    } else {
      newFavs = [...favorites, product];
    }
    setFavorites(newFavs);
    localStorage.setItem("enstore_favorites", JSON.stringify(newFavs));
    window.dispatchEvent(new Event("favorites-updated"));
  };

  const isFavorite = (productId: number) => {
    return favorites.some((p) => p.id === productId);
  };

  return { favorites, toggleFavorite, isFavorite, loaded };
}

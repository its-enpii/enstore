"use client";

import { useFavorites } from "@/hooks/useFavorites";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { FavoriteRounded, ExploreRounded } from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";

export default function FavoritesPage() {
  const { favorites, loaded } = useFavorites();

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Favorites"
        emoji="❤️"
        description={
          loaded
            ? `You have saved ${favorites.length} products.`
            : "Loading your saved items..."
        }
      />

      {!loaded ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500" />
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-2xl border border-brand-500/5 bg-smoke-200 p-8 text-center shadow-xl shadow-brand-500/5 md:p-12 dark:bg-brand-800"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/5 text-brand-500/30">
            <FavoriteRounded sx={{ fontSize: 40 }} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-brand-500/90 dark:text-smoke-200">
            No favorites yet
          </h3>
          <p className="mb-8 leading-relaxed text-brand-500/40">
            Start exploring our services and save your favorite games or
            vouchers for quick access.
          </p>
          <Link href="/services">
            <Button
              variant="primary"
              icon={<ExploreRounded />}
              iconPosition="right"
            >
              Explore Services
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 md:gap-y-8 lg:grid-cols-4"
        >
          {favorites.map((product, index) => (
            <ProductCard
              key={product.id}
              href={`/services/${product.slug}`}
              imageUrl={
                product.image || "/assets/hero-image/mobile-legends.png"
              }
              title={product.name}
              publisher={product.provider || product.brand}
              index={index}
              className="h-full"
              product={product}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

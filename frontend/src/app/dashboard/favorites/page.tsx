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
          description={loaded ? `You have saved ${favorites.length} products.` : "Loading your saved items..."}
        />

        {!loaded ? (
           <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500" />
           </div>
        ) : favorites.length === 0 ? (
           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-md text-center bg-white dark:bg-brand-800 rounded-[40px] p-8 md:p-12 border border-brand-500/5 shadow-xl shadow-brand-500/5"
           >
              <div className="w-20 h-20 bg-brand-500/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-500/30">
                 <FavoriteRounded sx={{ fontSize: 40 }} />
              </div>
              <h3 className="text-xl font-bold text-brand-500 dark:text-smoke-200 mb-2">No favorites yet</h3>
              <p className="text-brand-500/40 mb-8 leading-relaxed">
                 Start exploring our services and save your favorite games or vouchers for quick access.
              </p>
              <Link href="/services">
                 <Button variant="primary" icon={<ExploreRounded />} iconPosition="right">
                    Explore Services
                 </Button>
              </Link>
           </motion.div>
        ) : (
           <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-y-6 gap-x-6 md:gap-y-8 md:grid-cols-3 lg:grid-cols-4"
           >
              {favorites.map((product, index) => (
                <ProductCard
                   key={product.id}
                   href={`/services/${product.slug}`}
                   imageUrl={product.image || "/assets/hero-image/mobile-legends.png"}
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

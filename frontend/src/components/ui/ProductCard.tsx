"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FavoriteRounded, FavoriteBorderRounded } from "@mui/icons-material";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@/lib/api";

const MotionLink = motion.create(Link);

interface ProductCardProps {
  href: string;
  imageUrl: string;
  title: string;
  publisher: string;
  className?: string;
  index?: number;
  product?: Product;
}

const ProductCard = ({
  href,
  imageUrl,
  title,
  publisher,
  className,
  index = 0,
  product,
}: ProductCardProps) => {
  const delay = Math.min(index * 0.1, 0.4);
  const { isFavorite, toggleFavorite, loaded } = useFavorites();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) {
      toggleFavorite(product);
    }
  };

  const isFav = product && loaded ? isFavorite(product.id) : false;

  return (
    <div className={`relative ${className}`}>
      <MotionLink
        href={href}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
        className="block h-full"
      >
        <motion.div
          className="group relative h-full cursor-pointer overflow-hidden rounded-[40px] bg-smoke-200 p-2 shadow-enstore transition-shadow duration-300 hover:shadow-xl sm:p-3 lg:p-4"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Favorite Button Overlay */}
          {product && (
            <div className="absolute top-4 right-4 z-10">
              <motion.button
                onClick={handleFavoriteClick}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-200/20 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-smoke-200 hover:text-red-500"
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <AnimatePresence mode="wait">
                  {isFav ? (
                    <motion.div
                      key="fav"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-red-500"
                    >
                      <FavoriteRounded fontSize="small" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="nofav"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <FavoriteBorderRounded fontSize="small" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          )}

          <div className="relative w-full overflow-hidden rounded-3xl">
            <motion.div
              className="h-40 w-full bg-cover bg-center sm:h-52 lg:h-64"
              style={{ backgroundImage: `url(${imageUrl})` }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
            {/* Dark overlay on hover for better text visibility if needed */}
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
          </div>

          <div className="p-2 sm:p-3 lg:p-4">
            <h3 className="mb-1 line-clamp-1 text-sm font-bold text-brand-500/90 sm:mb-2 sm:text-base lg:text-[20px]">
              {title}
            </h3>
            <p className="truncate text-xs text-brand-500/40 sm:text-sm">
              {publisher}
            </p>
          </div>
        </motion.div>
      </MotionLink>
    </div>
  );
};

export default ProductCard;

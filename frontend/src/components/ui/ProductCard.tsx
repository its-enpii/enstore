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
          className="group relative h-full cursor-pointer overflow-hidden rounded-2xl bg-smoke-200 p-2 shadow-enstore sm:rounded-3xl sm:p-3 lg:rounded-[40px] lg:p-4 hover:shadow-xl transition-shadow duration-300"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Favorite Button Overlay */}
          {product && (
            <div className="absolute top-4 right-4 z-10">
              <motion.button
                onClick={handleFavoriteClick}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors shadow-lg"
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

          <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
            <motion.div
              className="h-40 w-full bg-cover bg-center sm:h-52 lg:h-64"
              style={{ backgroundImage: `url(${imageUrl})` }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
            {/* Dark overlay on hover for better text visibility if needed */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
          </div>

          <div className="p-2 sm:p-3 lg:p-4">
            <h3 className="mb-1 text-sm font-bold text-brand-500/90 sm:mb-2 sm:text-base lg:text-[20px] line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-brand-500/40 sm:text-sm truncate">{publisher}</p>
          </div>
        </motion.div>
      </MotionLink>
    </div>
  );
};

export default ProductCard;

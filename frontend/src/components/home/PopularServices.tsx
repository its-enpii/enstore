"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowForwardRounded } from "@mui/icons-material";
import { motion } from "motion/react";

import ProductCard from "@/components/ui/ProductCard";
import { getProducts, type Product } from "@/lib/api";

export function PopularServices() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await getProducts({
          is_featured: true,
          is_active: true,
          per_page: 4,
          sort_by: "sort_order",
          sort_order: "asc",
        });
        if (res.success && res.data.data) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <section className="bg-cloud-200 py-28">
      <div className="container mx-auto px-4 lg:px-0">
        <motion.div
          className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="mb-2 font-sans text-2xl font-bold text-brand-500/90 sm:mb-4 sm:text-3xl lg:text-4xl">
              Popular Services
            </h2>
            <p className="text-sm text-brand-500/40 sm:text-base">
              Top Up your favorite games and pay easily.
            </p>
          </div>

          <motion.div whileHover={{ x: 5 }}>
            <Link
              href="/services"
              className="group flex items-center gap-1 text-sm font-semibold text-ocean-500 transition-colors duration-300 hover:text-ocean-600 sm:text-base"
            >
              <span>View all services</span>
              <ArrowForwardRounded className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="flex flex-wrap">
            {products.map((product, index) => (
              <ProductCard
                key={`card-${product.id}`}
                href={`/services/${product.slug}`}
                imageUrl={
                  product.image || "/assets/hero-image/mobile-legends.png"
                }
                title={product.name}
                publisher={product.provider || product.brand}
                index={index}
                className="mb-4 w-1/2 px-2 sm:mb-6 sm:px-3 md:mb-8 lg:w-1/4"
              />
            ))}

            {/* Fallback if no featured products */}
            {products.length === 0 && (
              <p className="w-full py-8 text-center text-brand-500/40">
                No featured products available.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import DashboardButton from "@/components/dashboard/DashboardButton";
import {
  SearchRounded,
  TrendingDownRounded,
  FilterListRounded,
  GamepadRounded,
  InfoOutlined,
} from "@mui/icons-material";
import { motion } from "motion/react";
import {
  getProducts,
  getCategories,
  type Product,
  type ProductCategory,
} from "@/lib/api";
import Link from "next/link";

export default function ResellerPriceListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ per_page: 100 }),
          getCategories(),
        ]);

        if (prodRes.success) setProducts(prodRes.data.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (error) {
        console.error("Failed to fetch price list:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || p.category?.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Price List"
        emoji="🏷️"
        description="Your exclusive VIP reseller pricing across all products."
        breadcrumbs={[
          { label: "Dashboard", href: "/reseller/dashboard" },
          { label: "Price List" },
        ]}
        actions={
          <div className="flex items-center gap-3 rounded-2xl bg-ocean-500/10 px-4 py-2.5">
            <TrendingDownRounded className="text-ocean-500" fontSize="small" />
            <span className="text-xs font-bold tracking-widest text-ocean-500 uppercase">
              VIP Discount Active
            </span>
          </div>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-6 lg:col-span-8">
          <DashboardInput
            placeholder="Search products or brands..."
            icon={<SearchRounded />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
        <div className="md:col-span-6 lg:col-span-4">
          <DashboardSelect
            icon={<FilterListRounded />}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            fullWidth
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map((cat) => ({
                value: cat.slug,
                label: cat.name,
              })),
            ]}
          />
        </div>
      </div>

      {/* Price Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-smoke-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group rounded-xl border border-brand-500/5 bg-smoke-200 p-6 transition-all duration-300 hover:border-ocean-500/20"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-500/5 bg-cloud-200 transition-colors group-hover:bg-ocean-500/10">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <GamepadRounded className="text-brand-500/20 transition-colors group-hover:text-ocean-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="leading-tight font-bold text-brand-500/90">
                      {product.name}
                    </h3>
                    <span className="text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                      {product.brand || "Game"}
                    </span>
                  </div>
                </div>
                {product.is_featured && (
                  <span className="rounded-full bg-ocean-500/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-ocean-500 uppercase">
                    Hot
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {product.items?.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-transparent bg-cloud-200/60 p-3 transition-all hover:border-brand-500/5"
                  >
                    <span className="text-xs font-bold text-brand-500/60">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold text-ocean-500">
                      Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                    </span>
                  </div>
                ))}
                {product.items && product.items.length > 3 && (
                  <div className="pt-2 text-center">
                    <span className="text-[10px] font-bold tracking-widest text-brand-500/20 uppercase">
                      + {product.items.length - 3} More Variants
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <Link href={`/services/${product.slug}`} className="w-full">
                  <DashboardButton variant="primary" size="sm" fullWidth>
                    Order Now
                  </DashboardButton>
                </Link>
                <Link href={`/services/${product.slug}`} className="shrink-0">
                  <DashboardButton variant="secondary" size="sm">
                    <InfoOutlined fontSize="small" />
                  </DashboardButton>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-500/10 bg-smoke-200 py-20 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/5">
            <SearchRounded className="text-brand-500/15" fontSize="large" />
          </div>
          <h3 className="text-sm font-bold tracking-widest text-brand-500/40 uppercase">
            No products found
          </h3>
          <p className="mt-2 text-xs text-brand-500/25">
            Try adjusting your search or category filters.
          </p>
        </div>
      )}
    </div>
  );
}

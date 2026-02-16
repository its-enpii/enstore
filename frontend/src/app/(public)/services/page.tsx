"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  SearchRounded,
  SportsEsportsRounded,
  CardGiftcardRounded,
  PhoneAndroidRounded,
  ShareRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import { motion } from "motion/react";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import {
  getProducts,
  getCategories,
  type Product,
  type ProductCategory,
} from "@/lib/api";

const PER_PAGE = 8;

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // API States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // only for the very first load
  const [loadingMore, setLoadingMore] = useState(false); // loading next page
  const [refreshing, setRefreshing] = useState(false); // filter/search change (keeps grid visible)
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const hasMore = currentPage < lastPage;

  // Ref to prevent double-fetch on mount
  const hasFetchedInitial = useRef(false);

  // Category icon mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    games: <SportsEsportsRounded fontSize="small" />,
    vouchers: <CardGiftcardRounded fontSize="small" />,
    "mobile-data": <PhoneAndroidRounded fontSize="small" />,
    "paket-data": <PhoneAndroidRounded fontSize="small" />,
    pulsa: <PhoneAndroidRounded fontSize="small" />,
    "social-media": <ShareRounded fontSize="small" />,
  };

  // ----------------------------------------------------------
  // Debounce search input (400ms)
  // ----------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ----------------------------------------------------------
  // Fetch products (reusable)
  // ----------------------------------------------------------
  const fetchProducts = useCallback(
    async (page: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const filters: Record<string, unknown> = {
          per_page: PER_PAGE,
          page,
          is_active: true,
        };

        if (activeCategory !== "all") {
          filters["category.slug"] = activeCategory;
        }

        if (debouncedSearch.trim()) {
          filters.search = debouncedSearch.trim();
        }

        const res = await getProducts(filters as any);

        if (res.success) {
          const newProducts = res.data.products || [];
          const pagination = res.data.pagination;

          if (append) {
            // Append to existing list
            setProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const uniqueNewProducts = newProducts.filter(
                (p) => !existingIds.has(p.id),
              );
              return [...prev, ...uniqueNewProducts];
            });
          } else {
            // Replace list (new search / category)
            setProducts(newProducts);
          }

          setCurrentPage(pagination?.current_page || page);
          setLastPage(pagination?.last_page || 1);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Gagal memuat produk. Silakan coba lagi.");
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [activeCategory, debouncedSearch],
  );

  // ----------------------------------------------------------
  // Fetch categories (once on mount)
  // ----------------------------------------------------------
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await getCategories();
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCats();
  }, []);

  // ----------------------------------------------------------
  // Fetch products: on mount + when category/search changes
  // ----------------------------------------------------------
  useEffect(() => {
    // Reset to page 1 whenever filters change
    setCurrentPage(1);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // ----------------------------------------------------------
  // Handle Load More — fetch next page from API
  // ----------------------------------------------------------
  const handleLoadMore = useCallback(() => {
    if (loadingMore || refreshing || !hasMore) return;
    const nextPage = currentPage + 1;
    fetchProducts(nextPage, true);
  }, [loadingMore, refreshing, hasMore, currentPage, fetchProducts]);

  // ----------------------------------------------------------
  // Infinite Scroll — IntersectionObserver
  // ----------------------------------------------------------
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Auto load when sentinel is near viewport
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      {
        // Trigger 300px before the sentinel is visible
        rootMargin: "0px 0px 300px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  // ----------------------------------------------------------
  // Handle category change
  // ----------------------------------------------------------
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    // fetchProducts will be called automatically via useEffect
  };

  // Build category tabs from API data
  const categoryTabs = [
    { id: "all", label: "All Products", icon: null },
    ...categories
      .filter((c) => c.is_active)
      .map((c) => ({
        id: c.slug,
        label: c.name,
        icon: categoryIcons[c.slug] || null,
      })),
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cloud-200 pt-28 pb-12 md:pb-[72px]">
        {/* Decorative Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -left-10 text-cloud-300/50"
            initial={{ opacity: 0, rotate: -15 }}
            animate={{ opacity: 1, rotate: -15 }}
            transition={{ duration: 0.8 }}
          >
            <SportsEsportsRounded style={{ fontSize: 180 }} />
          </motion.div>
          <motion.div
            className="absolute top-20 right-10 text-cloud-300/30"
            initial={{ opacity: 0, rotate: 15 }}
            animate={{ opacity: 1, rotate: 15 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <SportsEsportsRounded style={{ fontSize: 120 }} />
          </motion.div>
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-0">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center">
              <h1 className="font-sans text-3xl font-bold tracking-tight text-brand-500/90 md:text-4xl lg:text-6xl lg:leading-[1.1]">
                Top Up <span className="text-ocean-500">Anything</span>
              </h1>
              <h2 className="mb-6 text-2xl font-bold text-brand-500/10 md:mb-10 md:text-3xl lg:text-5xl">
                Anywhere, Instantly.
              </h2>
              <p className="mb-8 max-w-xl text-sm text-brand-500/40 md:mb-12 md:text-base md:tracking-wide">
                Secure payments for games, vouchers, and bills with FinTech
                grade reliability.
              </p>
            </div>

            {/* Search Bar */}
            <motion.div
              className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-brand-500/5 bg-smoke-200 p-2 shadow-2xl shadow-ocean-500/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-1 items-center gap-2 px-4">
                <SearchRounded className="h-5! w-5! text-brand-500/40 md:h-6! md:w-6!" />
                <input
                  type="text"
                  placeholder="Search for games or services..."
                  className="w-full bg-transparent py-3 text-sm text-brand-500/90 placeholder:text-brand-500/30 focus:outline-none md:py-4 md:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="primary" size="md">
                Search
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-cloud-200 pb-28">
        <div className="container mx-auto px-4 lg:px-0">
          {/* Category Tabs */}
          <motion.div
            className="mb-6 flex flex-wrap items-center justify-center gap-2 md:mb-10 md:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {categoryTabs.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "bg-smoke-200 text-brand-500/60 hover:bg-cloud-300"
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </motion.div>

          {/* Initial Loading State (only shown on first ever load) */}
          {initialLoading && (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500" />
            </div>
          )}

          {/* Error State */}
          {error && !initialLoading && (
            <motion.div
              className="py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-lg text-red-500/70">{error}</p>
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onClick={() => fetchProducts(1, false)}
              >
                Coba Lagi
              </Button>
            </motion.div>
          )}

          {/* Products Grid — stays visible even during refresh */}
          {!initialLoading && !error && (
            <>
              <div
                className={`grid grid-cols-2 gap-y-6 gap-x-6 md:gap-y-8 transition-opacity duration-200 md:grid-cols-3 lg:grid-cols-4 ${refreshing ? "pointer-events-none opacity-50" : "opacity-100"}`}
              >
                {products.map((product, index) => (
                  <ProductCard
                    key={`product-${product.id}`}
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
              </div>

              {/* Empty State */}
              {products.length === 0 && (
                <motion.div
                  className="py-20 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-lg text-brand-500/40">No products found</p>
                </motion.div>
              )}

              {/* Infinite Scroll Sentinel + Load More Fallback */}
              {hasMore && (
                <>
                  {/* Invisible sentinel — triggers auto-load when scrolled into view */}
                  <div ref={sentinelRef} className="h-1 w-full" />

                  {/* Loading spinner (shown during auto-load) */}
                  {loadingMore && (
                    <div className="mt-12 flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-ocean-500/20 border-t-ocean-500" />
                    </div>
                  )}

                  {/* Fallback button (visible when not auto-loading, e.g. slow connection) */}
                  {!loadingMore && (
                    <motion.div
                      className="mt-20 flex justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        variant="white"
                        size="md"
                        icon={<ExpandMoreRounded />}
                        iconPosition="right"
                        onClick={handleLoadMore}
                        className="border border-brand-500/5 px-6! py-4!"
                      >
                        Load More
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

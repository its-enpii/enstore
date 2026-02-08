"use client";

import { useState } from "react";
import { SearchRounded, SportsEsportsRounded, CardGiftcardRounded, PhoneAndroidRounded, ShareRounded, ExpandMoreRounded } from "@mui/icons-material";
import { motion } from "motion/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const categories = [
  { id: "all", label: "All Products", icon: null },
  { id: "games", label: "Games", icon: <SportsEsportsRounded fontSize="small" /> },
  { id: "vouchers", label: "Vouchers", icon: <CardGiftcardRounded fontSize="small" /> },
  { id: "mobile-data", label: "Mobile Data", icon: <PhoneAndroidRounded fontSize="small" /> },
  { id: "social-media", label: "Social Media", icon: <ShareRounded fontSize="small" /> },
];

const allProducts = [
  { title: "Mobile Legends", publisher: "Moonton", image: "/assets/hero-image/mobile-legends.png", category: "games" },
  { title: "Free Fire", publisher: "Garena", image: "/assets/hero-image/free-fire.png", category: "games" },
  { title: "Genshin Impact", publisher: "Hoyoverse", image: "/assets/hero-image/genshin-impact.png", category: "games" },
  { title: "Valorant", publisher: "Riot Games", image: "/assets/hero-image/valorant.png", category: "games" },
  { title: "Netflix", publisher: "Netflix, Inc.", image: "/assets/hero-image/honkai-star-rail.png", category: "vouchers" },
  { title: "iQIYI", publisher: "iQIYI, Inc.", image: "/assets/hero-image/zenless-zone-zero.png", category: "vouchers" },
  { title: "Disney+ Hotstar", publisher: "The Walt Disney Company", image: "/assets/hero-image/genshin-impact.png", category: "vouchers" },
  { title: "Zenless Zone Zero", publisher: "Hoyoverse", image: "/assets/hero-image/zenless-zone-zero.png", category: "games" },
  { title: "WeTV", publisher: "Tencent Video", image: "/assets/hero-image/mobile-legends.png", category: "vouchers" },
  { title: "PUBG Mobile", publisher: "Tencent Games", image: "/assets/hero-image/pubg-mobile.png", category: "games" },
  { title: "Vidio Premier", publisher: "Emtek Group", image: "/assets/hero-image/free-fire.png", category: "vouchers" },
  { title: "Apple TV", publisher: "Apple Inc.", image: "/assets/hero-image/valorant.png", category: "vouchers" },
  { title: "Prime Video", publisher: "Amazon", image: "/assets/hero-image/honkai-impact-3rd.png", category: "vouchers" },
  { title: "Honkai Impact 3rd", publisher: "Hoyoverse", image: "/assets/hero-image/honkai-impact-3rd.png", category: "games" },
  { title: "HBO GO", publisher: "Warner Bros. Discovery", image: "/assets/hero-image/pubg-mobile.png", category: "vouchers" },
  { title: "Honkai Star Rail", publisher: "Hoyoverse", image: "/assets/hero-image/honkai-star-rail.png", category: "games" },
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cloud-200 pt-28 pb-[72px]">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

        <div className="container relative z-10 mx-auto px-4 lg:px-0">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center">
                <h1 className="font-sans text-3xl font-bold text-brand-500/90 sm:text-4xl lg:text-6xl tracking-tight lg:leading-[1.1]">
                    Top Up <span className="text-ocean-500">Anything</span>
                </h1>
                <h2 className="mb-10 text-xl font-bold text-brand-500/10 lg:text-5xl">
                    Anywhere, Instantly.
                </h2>
                <p className="mb-12 text-sm text-brand-500/40 sm:text-base max-w-xl tracking-wide">
                    Secure payments for games, vouchers, and bills with FinTech grade reliability.
                </p>
            </div>

            {/* Search Bar */}
            <motion.div
              className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-brand-500/5 bg-white p-2 shadow-2xl shadow-ocean-500/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-1 items-center gap-2 px-4">
                <SearchRounded className="text-brand-500/30" />
                <input
                  type="text"
                  placeholder="Search for games or services..."
                  className="w-full bg-transparent py-2 text-brand-500/90 placeholder:text-brand-500/30 focus:outline-none"
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
            className="mb-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setVisibleCount(8);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer ${
                  activeCategory === category.id
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "bg-white text-brand-500/60 hover:bg-cloud-300"
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <div className="flex flex-wrap">
            {visibleProducts.map((product, index) => (
              <Card
                key={`product-${index}`}
                href={`/services/${product.title.toLowerCase().replace(/\s+/g, "-")}`}
                imageUrl={product.image}
                title={product.title}
                publisher={product.publisher}
                index={index}
                className="mb-4 w-1/2 px-2 sm:mb-6 sm:px-3 md:mb-8 lg:w-1/4"
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <motion.div
              className="py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-lg text-brand-500/40">No products found</p>
            </motion.div>
          )}

          {/* Load More Button */}
          {hasMore && (
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
        </div>
      </section>
    </>
  );
}
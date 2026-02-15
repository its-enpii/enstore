"use client";

import { useState, useEffect, useRef } from "react";
import { SearchRounded, MenuRounded, CloseRounded, ImageNotSupportedRounded, PersonRounded, DashboardRounded } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { usePathname, useRouter } from 'next/navigation';

import Button from "../ui/Button";
import Input from "../ui/Input";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Home"},
  { href: "/services", label: "Services"},
  { href: "/track-order", label: "Track Order"},
  { href: "/help", label: "Help"},
];

function SearchBar({ mobile = false, onSearchSelect }: { mobile?: boolean; onSearchSelect?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await getProducts({ search: query, per_page: 5 });
          if (res.success) {
            setResults(res.data.products);
          } else {
             setResults([]);
          }
        } catch (error) {
           console.error("Search error", error);
           setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    router.push(`/services/${slug}`);
    setIsFocused(false);
    if (onSearchSelect) onSearchSelect();
  };

  return (
    <div ref={containerRef} className={`relative ${mobile ? "w-full" : "w-64 lg:w-80"}`}>
        <Input
            type="search"
            icon={<SearchRounded />}
            iconPosition="left"
            placeholder="Search games..."
            inputSize="sm"
            fullWidth={true}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onClick={(e) => e.currentTarget.select()}
            className="search-input"
        />
        
        <AnimatePresence>
            {isFocused && (query.trim().length >= 2) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-brand-500/5 bg-smoke-200 p-2 shadow-xl z-50 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex items-center justify-center p-4 text-sm text-brand-500/40">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500/20 border-t-ocean-500 mr-2"></div>
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                            {results.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelect(product.slug)}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl p-2 text-left hover:bg-cloud-200 transition-colors w-full"
                                >
                                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-cloud-300 shrink-0">
                                        {product.image ? (
                                           <Image 
                                            src={product.image} 
                                            alt={product.name} 
                                            fill 
                                            className="object-cover"
                                            sizes="40px"
                                           /> 
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-brand-500/20">
                                                <ImageNotSupportedRounded fontSize="small" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-semibold text-brand-500">{product.name}</p>
                                        <p className="truncate text-xs text-brand-500/50">{product.brand}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-brand-500/40">
                            No results found for "{query}"
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === 'admin') return "/admin/dashboard";
    if (user.customer_type === 'reseller') return "/reseller/dashboard";
    return "/dashboard";
  };

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-9999 w-full bg-smoke-200/80 backdrop-blur-lg py-3 shadow-[0_4px_16px_0_rgba(0,23,32,0.06)] sm:py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 lg:px-0">
        <div className="flex items-center justify-between lg:flex-row">
          {/* Logo */}
          <Link href="/">
            <motion.div
                className="text-2xl font-extrabold text-brand-500/90 sm:text-3xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                En<span className="text-ocean-500">Store</span>
            </motion.div>
          </Link>

          {/* Mobile menu button */}
          <motion.button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-cloud-200 text-brand-500/60 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CloseRounded />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MenuRounded />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden flex-1 items-center justify-between gap-6 lg:flex lg:ml-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <nav className="flex items-center justify-center gap-1 rounded-full border border-brand-500/5 bg-cloud-200 p-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex"
                >
                  <Link
                    href={link.href}
                    className={`block rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      ((pathname.includes(link.href) && link.href !== '/') || pathname === link.href)
                        ? "border border-brand-500/5 bg-smoke-200 text-ocean-500"
                        : "text-brand-500/40 hover:text-ocean-500"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center justify-center gap-4">
              <SearchBar />

              {/* Profile / Sign In */}
              <div className="min-w-[140px] flex justify-end">
                {authLoading ? (
                  <div className="h-10 w-32 animate-pulse rounded-xl bg-cloud-300"></div>
                ) : isAuthenticated && user ? (
                  <Link href={getDashboardHref()}>
                    <motion.div 
                        whileHover={{ y: -1 }} 
                        className="flex items-center gap-3 bg-cloud-200 p-1.5 pl-4 rounded-full border border-brand-500/5 hover:border-ocean-500/30 transition-all group"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-brand-500/40 leading-none">Welcome back,</span>
                            <span className="text-sm font-black text-brand-500/90 leading-tight truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-smoke-200 text-sm font-black">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </motion.div>
                  </Link>
                ) : (
                  <Link href="/login">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="dark" size="sm" className="w-fit px-8 rounded-full">
                        Sign In
                      </Button>
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="mt-4 overflow-hidden lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <nav className="flex flex-col gap-2 rounded-2xl border border-brand-500/5 bg-cloud-200 p-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`block w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        pathname === link.href
                          ? "border border-brand-500/5 bg-smoke-200 text-ocean-500"
                          : "text-brand-500/40 hover:bg-smoke-200 hover:text-ocean-500"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-4 flex flex-col gap-3 px-1">
                <SearchBar mobile onSearchSelect={() => setIsMenuOpen(false)} />

                {authLoading ? (
                    <div className="h-12 w-full animate-pulse rounded-2xl bg-cloud-300"></div>
                ) : isAuthenticated && user ? (
                  <Link href={getDashboardHref()} onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center gap-4 bg-cloud-300 dark:bg-brand-900 p-3 rounded-2xl border border-brand-500/5">
                        <div className="w-10 h-10 rounded-full bg-ocean-500 flex items-center justify-center text-smoke-100 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-400 font-bold">My Account</div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">{user.name}</div>
                        </div>
                        <DashboardRounded className="text-slate-400" />
                    </div>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="dark" size="sm" className="w-full h-12 rounded-2xl">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

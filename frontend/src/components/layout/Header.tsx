"use client";

import { useState, useEffect, useRef } from "react";
import {
  SearchRounded,
  MenuRounded,
  CloseRounded,
  ImageNotSupportedRounded,
  PersonRounded,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

import Button from "../ui/Button";
import Input from "../ui/Input";
import { getProducts, getMe } from "@/lib/api";
import type { Product } from "@/lib/api/types";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/track-order", label: "Track Order" },
  { href: "/help", label: "Help" },
];

function SearchBar({
  mobile = false,
  onSearchSelect,
}: {
  mobile?: boolean;
  onSearchSelect?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear search when navigating to a new page
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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    router.push(`/services/${slug}`);
    setIsFocused(false);
    // query clear is handled by useEffect[pathname] but we can also do it here for immediate feedback
    if (onSearchSelect) onSearchSelect();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${mobile ? "w-full" : "w-64 lg:w-80"}`}
    >
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
        {isFocused && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-brand-500/5 bg-smoke-200 p-2 shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center p-4 text-sm text-brand-500/40">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-brand-500/20 border-t-ocean-500"></div>
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="custom-scrollbar flex max-h-60 flex-col gap-1 overflow-y-auto">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.slug)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-smoke-200"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-500/90">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-brand-500/50">
                        {product.brand}
                      </p>
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
  const [user, setUser] = useState<any>(null);
  // Initialize to false to show "Sign In" by default (optimistic unauthenticated)
  // instead of showing nothing while checking
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return;
      }

      try {
        const res = await getMe();
        if (res.success) {
          setUser(res.data);
        } else {
          localStorage.removeItem("auth_token"); // Invalid token
        }
      } catch (error) {
        console.error("Auth check failed", error);
        // Don't remove token on network error, be consistent with optimistic UI
      }
    };

    checkAuth();

    // Listen for storage events (login/logout from other tabs or components)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "customer" && user.customer_type === "reseller")
      return "/reseller/dashboard";
    return "/dashboard";
  };

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-9999 w-full bg-smoke-200 py-3 shadow-[0_4px_16px_0_rgba(0,23,32,0.08)] sm:py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 lg:px-0">
        <div className="flex items-center justify-between lg:flex-row">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="cursor-pointer text-2xl font-extrabold text-brand-500/90 sm:text-3xl"
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
            className="hidden flex-1 items-center justify-between gap-6 lg:ml-6 lg:flex"
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
                      (pathname.includes(link.href) && link.href !== "/") ||
                      pathname === link.href
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

              {user ? (
                <Link href={getDashboardLink()}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-fit"
                      icon={<PersonRounded />}
                    >
                      Dashboard
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="dark" size="sm" className="w-fit">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
              )}
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

              <motion.div
                className="mt-4 flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <SearchBar mobile onSearchSelect={() => setIsMenuOpen(false)} />

                {user ? (
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<PersonRounded />}
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="dark" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

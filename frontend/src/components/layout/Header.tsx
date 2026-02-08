"use client";

import { useState } from "react";
import { SearchRounded, MenuRounded, CloseRounded } from "@mui/icons-material";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from 'next/navigation';

import Button from "../ui/Button";
import Input from "../ui/Input";

const navLinks = [
  { href: "/", label: "Home"},
  { href: "/services", label: "Services"},
  { href: "/track-order", label: "Track Order"},
  { href: "/help", label: "Help"},
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <motion.div
            className="text-2xl font-extrabold text-brand-500/90 sm:text-3xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            En<span className="text-ocean-500">Store</span>
          </motion.div>

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
              <Input
                type="search"
                icon={<SearchRounded />}
                iconPosition="left"
                placeholder="Search games..."
                inputSize="sm"
                fullWidth={true}
              />

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="dark" size="sm" className="w-fit">
                  Sign In
                </Button>
              </motion.div>
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
                <Input
                  type="search"
                  icon={<SearchRounded />}
                  iconPosition="left"
                  placeholder="Search games..."
                  inputSize="sm"
                  fullWidth={true}
                />

                <Button variant="dark" size="sm" className="w-full">
                  Sign In
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

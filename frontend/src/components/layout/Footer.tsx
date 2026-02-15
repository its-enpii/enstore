"use client";

import Link from "next/link";
import { Facebook, Instagram, LinkedIn } from "@mui/icons-material";
import { motion } from "motion/react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const linkColumns = [
    {
      title: "Services",
      links: [
        { href: "#", label: "Games Top-up" },
        { href: "#", label: "Vouchers" },
        { href: "#", label: "Mobile Data" },
        { href: "#", label: "Social Media" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", label: "About Us" },
        { href: "#", label: "Careers" },
        { href: "#", label: "Press" },
        { href: "/help", label: "Contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/terms", label: "Terms" },
        { href: "/privacy", label: "Privacy" },
        { href: "#", label: "Security" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook fontSize="medium" />, href: "#", label: "Facebook" },
    { icon: <Instagram fontSize="medium" />, href: "#", label: "Instagram" },
    { icon: <LinkedIn fontSize="medium" />, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="w-full bg-smoke-200 pt-12 sm:pt-16">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="mb-8 grid gap-8 sm:mb-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <motion.div
            className="md:col-span-2 lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 text-2xl font-extrabold text-brand-500/90 sm:mb-8 sm:text-3xl">
              En<span className="text-ocean-500">Store</span>
            </div>
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-brand-500/40 sm:mb-10 sm:text-base">
              The professional choice for gaming top-ups and digital payments. Secure, fast, and reliable.
            </p>

            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cloud-200 text-brand-500/40 transition-colors hover:bg-ocean-500/10 hover:text-ocean-500 sm:h-10 sm:w-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          {linkColumns.map((column, columnIndex) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (columnIndex + 1) * 0.1 }}
            >
              <h4 className="mb-4 text-lg font-bold text-brand-500/90 sm:mb-6 sm:text-[20px]">
                {column.title}
              </h4>
              <ul className="space-y-3 text-sm text-brand-500/40 sm:space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-block transition-all duration-300 hover:text-ocean-500 hover:translate-x-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="border-t border-brand-500/5 py-4 sm:py-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-brand-500/40 sm:gap-4 sm:text-sm md:flex-row">
            <p>© {currentYear} EnStore. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted By{" "}
              <span className="font-medium text-ocean-500">Enpii Studio</span>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { Facebook, Instagram, LinkedIn, Twitter } from "@mui/icons-material";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-smoke-50 pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
             <div className="mb-6 font-extrabold text-2xl text-brand-500">
                En<span className="text-ocean-500">TopUp</span>
              </div>
            <p className="mb-8 max-w-xs text-sm leading-relaxed text-brand-300">
              The professional choice for gaming top-ups and digital payments. Secure, fast, and reliable.
            </p>
            <div className="flex gap-4">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-200 text-brand-300 transition-colors hover:bg-ocean-100 hover:text-ocean-500">
                <Facebook fontSize="small" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-200 text-brand-300 transition-colors hover:bg-ocean-100 hover:text-ocean-500">
                <Instagram fontSize="small" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-200 text-brand-300 transition-colors hover:bg-ocean-100 hover:text-ocean-500">
                <LinkedIn fontSize="small" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="mb-6 font-bold text-brand-500">Services</h4>
            <ul className="space-y-4 text-sm text-brand-300">
              <li><Link href="#" className="hover:text-ocean-500">Games Top-up</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Vouchers</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Mobile Data</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Social Media</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-brand-500">Company</h4>
            <ul className="space-y-4 text-sm text-brand-300">
              <li><Link href="#" className="hover:text-ocean-500">About Us</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Careers</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Press</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-brand-500">Legal</h4>
            <ul className="space-y-4 text-sm text-brand-300">
              <li><Link href="#" className="hover:text-ocean-500">Terms</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Privacy</Link></li>
              <li><Link href="#" className="hover:text-ocean-500">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-brand-500/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-brand-200 md:flex-row">
            <p>© {currentYear} EnTopUp. All rights reserved.</p>
            <p>Crafted By Enpii Studio</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

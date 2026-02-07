"use client";

import { useState } from "react";
import { SearchRounded } from "@mui/icons-material";
import Link from "next/link";

import Button from "../ui/Button";
import Input from "../ui/Input";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-9999 w-full bg-smoke-200 py-4 shadow-md">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="flex flex-col items-center lg:flex-row">
          <div
            className="text-3xl font-extrabold text-brand-500/90"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            En<span className="text-ocean-500">Store</span>
          </div>

          <div
            className={`mt-4 grid w-full flex-1 grow transition-all duration-300 ease-in-out lg:mt-0 lg:ml-6 lg:grid-rows-[1fr] ${
              isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
                <nav className="flex w-full flex-col items-start justify-start gap-2 rounded-3xl border border-brand-500/5 bg-cloud-200 p-1 lg:w-fit lg:flex-row lg:items-center lg:justify-center lg:rounded-full">
                  <Link
                    href="/"
                    className="w-full rounded-full border border-brand-500/5 bg-smoke-200 px-6 py-3 text-sm font-medium whitespace-nowrap text-ocean-500"
                  >
                    Home
                  </Link>

                  <Link
                    href="/"
                    className="w-full rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap text-brand-500/40 hover:text-ocean-500"
                  >
                    Services
                  </Link>

                  <Link
                    href="/"
                    className="w-full rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap text-brand-500/40 hover:text-ocean-500"
                  >
                    Track Order
                  </Link>

                  <Link
                    href="/"
                    className="w-full rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap text-brand-500/40 hover:text-ocean-500"
                  >
                    Help
                  </Link>
                </nav>

                <div className="mb-4 flex w-full flex-col items-start justify-start gap-4 lg:mb-0 lg:w-fit lg:flex-row lg:items-center lg:justify-center">
                  <Input
                    type="search"
                    icon={<SearchRounded />}
                    iconPosition="left"
                    placeholder="Search games..."
                    inputSize="sm"
                    fullWidth={true}
                  />

                  <Button variant="dark" size="sm" className="w-full lg:w-fit">
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

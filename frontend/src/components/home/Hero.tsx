"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayArrowRounded } from "@mui/icons-material";
import Button from "@/components/ui/Button";

// Placeholder assets until generation is complete
const gameCovers = [
  {
    src: "/game_mlbb.png",
    alt: "Mobile Legends",
    className: "z-30 translate-x-0 translate-y-0 scale-110",
  },
  {
    src: "/game_ff.png",
    alt: "Free Fire",
    className: "z-20 translate-x-24 -translate-y-12 rotate-6 scale-90",
  },
  {
    src: "/game_gi.png",
    alt: "Genshin Impact",
    className: "z-10 -translate-x-24 -translate-y-8 -rotate-6 scale-90",
  },
  {
    src: "/game_val.png",
    alt: "Valorant",
    className:
      "z-0 translate-x-12 translate-y-24 rotate-12 scale-75 opacity-80",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Text Content */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <span className="mb-6 inline-flex items-center rounded-full bg-ocean-50 px-4 py-1.5 text-sm font-bold tracking-wide text-ocean-600 uppercase">
              Banking for Gamers
            </span>

            <h1 className="mb-6 max-w-2xl font-sans text-4xl font-extrabold tracking-tight text-brand-500 lg:text-6xl lg:leading-[1.1]">
              The <span className="text-ocean-500">Professional</span> Standard
              for Game Top-Ups.
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-brand-300">
              Experience seamless transactions with instant delivery and
              encrypted security. Your game assets, delivered in seconds.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="px-8 shadow-lg shadow-ocean-500/20">
                Top Up Now
              </Button>
              <Button
                variant="white"
                size="lg"
                icon={<PlayArrowRounded />}
                className="border border-brand-500/10 hover:bg-white"
              >
                How it works
              </Button>
            </div>
          </div>

          {/* Visuals */}
          <div className="relative flex min-h-[400px] flex-1 items-center justify-center lg:min-h-[600px]">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ocean-200/20 blur-[100px]" />

            <div className="relative h-[400px] w-full max-w-[500px] perspective-[1000px]">
              {/* 
                  NOTE: Using a collage of floating cards. 
                  In a real implementation, we would use proper 3D transforms or a pre-composed image.
                  Here we use absolute positioning with CSS transforms for the "pop" effect.
               */}
              <div className="relative h-full w-full">
                {/* Floating Cards Mockup Structure */}
                <div className="absolute top-1/2 left-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  {/* Central Card (Hero) */}
                  <div className="relative z-30 h-[320px] w-[220px] rounded-2xl bg-white p-2 shadow-2xl transition-transform duration-500 hover:scale-105">
                    <div className="h-full w-full overflow-hidden rounded-xl bg-brand-50">
                      {/* Ideally use next/image here when assets are generated */}
                      <div className="h-full w-full bg-[url('/game_mlbb.png')] bg-cover bg-center" />
                    </div>
                  </div>

                  {/* Right Floating Card */}
                  <div className="absolute top-10 -right-4 z-20 h-[240px] w-[160px] rotate-6 rounded-2xl bg-white p-2 shadow-xl transition-all duration-500 hover:z-40 hover:scale-110 hover:rotate-0">
                    <div className="h-full w-full overflow-hidden rounded-xl bg-brand-50">
                      <div className="h-full w-full bg-[url('/game_ff.png')] bg-cover bg-center" />
                    </div>
                  </div>

                  {/* Left Floating Card */}
                  <div className="absolute bottom-10 -left-4 z-20 h-[240px] w-[160px] -rotate-6 rounded-2xl bg-white p-2 shadow-xl transition-all duration-500 hover:z-40 hover:scale-110 hover:rotate-0">
                    <div className="h-full w-full overflow-hidden rounded-xl bg-brand-50">
                      <div className="h-full w-full bg-[url('/game_gi.png')] bg-cover bg-center" />
                    </div>
                  </div>

                  {/* Background Detail Card */}
                  <div className="absolute -top-6 left-10 z-10 h-[200px] w-[140px] -rotate-12 rounded-2xl bg-white p-2 opacity-60 shadow-lg blur-[1px]">
                    <div className="h-full w-full overflow-hidden rounded-xl bg-brand-50">
                      <div className="h-full w-full bg-[url('/game_val.png')] bg-cover bg-center" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

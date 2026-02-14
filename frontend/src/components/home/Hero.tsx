"use client";

import Image from "next/image";
import { PlayArrowRounded, ArrowForwardRounded } from "@mui/icons-material";
import Button from "@/components/ui/Button";
import { useRef, useEffect } from "react";
import { motion } from "motion/react";

export function Hero() {
  const ScrollContainerRef = useRef<HTMLDivElement>(null);
  const ReverseScrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = ScrollContainerRef.current;
    const reverseScrollContainer = ReverseScrollContainerRef.current;

    if (!scrollContainer) return;
    if (!reverseScrollContainer) return;

    if (reverseScrollContainer) {
      reverseScrollContainer.scrollTop =
        reverseScrollContainer.scrollHeight / 2;
    }

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    scrollContainer.addEventListener("wheel", preventScroll, {
      passive: false,
    });

    reverseScrollContainer.addEventListener("wheel", preventScroll, {
      passive: false,
    });

    const scrollSpeed = 1;
    let frameCount = 0;
    let animationFrameId: number;

    const autoScroll = () => {
      frameCount++;

      if (frameCount % 3 === 0) {
        if (scrollContainer) {
          scrollContainer.scrollTop += scrollSpeed;
          if (scrollContainer.scrollTop >= scrollContainer.scrollHeight / 2) {
            scrollContainer.scrollTop = 0;
          }
        }

        if (reverseScrollContainer) {
          reverseScrollContainer.scrollTop -= scrollSpeed;
          if (reverseScrollContainer.scrollTop <= 0) {
            reverseScrollContainer.scrollTop =
              reverseScrollContainer.scrollHeight / 2;
          }
        }
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const gameCovers = [
    { name: "Genshin Impact", image: "/assets/hero-image/genshin-impact.png" },
    {
      name: "Honkai Impact 3rd",
      image: "/assets/hero-image/honkai-impact-3rd.png",
    },
    { name: "Mobile Legends", image: "/assets/hero-image/mobile-legends.png" },
    { name: "Free Fire", image: "/assets/hero-image/free-fire.png" },
    { name: "PUBG Mobile", image: "/assets/hero-image/pubg-mobile.png" },
    {
      name: "Zenless Zone Zero",
      image: "/assets/hero-image/zenless-zone-zero.png",
    },
    {
      name: "Honkai Star Rail",
      image: "/assets/hero-image/honkai-star-rail.png",
    },
    { name: "Valorant", image: "/assets/hero-image/valorant.png" },
  ];

  return (
    <section className="relative overflow-hidden py-28">
      {/* Background gradient overlay - only visible on mobile/tablet for text readability */}
      <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-cloud-200 via-cloud-200/90 to-cloud-200/60 lg:hidden" />

      <div className="relative z-2 container mx-auto px-4 lg:px-0">
        <motion.div
          className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.span
            className="mb-6 inline-flex items-center rounded-full border border-ocean-500/20 bg-ocean-500/10 px-3 py-2 text-xs font-medium tracking-wide text-ocean-500 uppercase sm:text-sm md:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ocean-500" />
            <span className="ml-2">Banking for Gamers</span>
          </motion.span>

          <motion.h1
            className="mb-4 max-w-2xl font-sans text-3xl font-bold tracking-tight text-brand-500/90 sm:text-4xl md:mb-6 lg:text-6xl lg:leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="mb-1 block">
              The <span className="text-ocean-500">Professional</span>
            </span>
            <span className="mb-1 block">Standard for Game</span>
            <span className="block">Top-Ups.</span>
          </motion.h1>

          <motion.p
            className="mb-8 max-w-sm text-sm leading-relaxed text-brand-500/40 sm:text-base md:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Experience seamless transactions with instant delivery and encrypted
            security. Your game assets, delivered in seconds.
          </motion.p>

          <motion.div
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="dark"
                icon={<ArrowForwardRounded />}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                Top Up Now
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="white"
                size="lg"
                icon={<PlayArrowRounded />}
                className="w-full border border-brand-500/10 hover:bg-white sm:w-auto"
              >
                How it works
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Game covers background - visible on all screen sizes */}
      <motion.div
        className="absolute inset-0 z-0 h-full w-full lg:right-0 lg:left-auto lg:w-1/2"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="flex h-full w-full rotate-25 items-center justify-center gap-4 sm:gap-6">
          {/* First column */}
          <div
            ref={ScrollContainerRef}
            className="mt-20 h-screen w-fit overflow-x-hidden overflow-y-auto scroll-auto [&::-webkit-scrollbar]:hidden"
          >
            {[...gameCovers, ...gameCovers].map((game, index) => (
              <div
                key={index}
                className="relative mb-4 h-[160px] w-[120px] overflow-hidden rounded-2xl sm:mb-6 sm:h-[220px] sm:w-[180px] lg:h-[260px] lg:w-[220px] lg:rounded-4xl"
              >
                <Image
                  src={game.image}
                  alt={game.name}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Second column - visible on all sizes */}
          <div
            ref={ReverseScrollContainerRef}
            className="mb-20 h-screen w-fit overflow-x-hidden overflow-y-auto scroll-auto [&::-webkit-scrollbar]:hidden"
          >
            {[...gameCovers, ...gameCovers].reverse().map((game, index) => (
              <div
                key={index}
                className="relative mb-4 h-[160px] w-[120px] overflow-hidden rounded-2xl sm:mb-6 sm:h-[220px] sm:w-[180px] lg:h-[260px] lg:w-[220px] lg:rounded-4xl"
              >
                <Image
                  src={game.image}
                  alt={game.name}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

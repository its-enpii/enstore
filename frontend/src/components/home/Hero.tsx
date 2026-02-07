"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayArrowRounded, ArrowForwardRounded } from "@mui/icons-material";
import Button from "@/components/ui/Button";
import { useRef, useEffect } from "react";

export function Hero() {
  const ScrollContainerRef = useRef<HTMLDivElement>(null);
  const ReverseScrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = ScrollContainerRef.current;
    const reverseScrollContainer = ReverseScrollContainerRef.current;

    reverseScrollContainer.scrollTop = reverseScrollContainer.scrollHeight / 2;

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
    {
      name: "Genshin Impact",
      image: "/assets/hero-image/genshin-impact.png",
    },
    {
      name: "Honkai Impact 3rd",
      image: "/assets/hero-image/honkai-impact-3rd.png",
    },
    {
      name: "Mobile Legends",
      image: "/assets/hero-image/mobile-legends.png",
    },
    {
      name: "Free Fire",
      image: "/assets/hero-image/free-fire.png",
    },
    {
      name: "PUBG Mobile",
      image: "/assets/hero-image/pubg-mobile.png",
    },
    {
      name: "Zenless Zone Zero",
      image: "/assets/hero-image/zenless-zone-zero.png",
    },
    {
      name: "Honkai Star Rail",
      image: "/assets/hero-image/honkai-star-rail.png",
    },
    {
      name: "Valorant",
      image: "/assets/hero-image/valorant.png",
    },
  ];

  return (
    <section className="relative overflow-hidden py-28">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
          <span className="mb-8 inline-flex items-center rounded-full border border-ocean-500/20 bg-ocean-500/10 px-3 py-2 text-sm font-medium tracking-wide text-ocean-500 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-ocean-500"></span>
            <span className="ml-2">Banking for Gamers</span>
          </span>

          <h1 className="mb-6 max-w-2xl font-sans text-4xl font-bold tracking-tight text-brand-500/90 lg:text-6xl lg:leading-[1.1]">
            <span className="mb-1 block">
              The <span className="text-ocean-500">Professional</span>
            </span>
            <span className="mb-1 block">Standard for Game</span>
            <span className="block">Top-Ups.</span>
          </h1>

          <p className="mb-10 max-w-sm text-base leading-relaxed text-brand-500/40">
            Experience seamless transactions with instant delivery and encrypted
            security. Your game assets, delivered in seconds.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="dark"
              icon={<ArrowForwardRounded />}
              iconPosition="right"
              className="px-8 shadow-lg shadow-ocean-500/20"
            >
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
      </div>

      <div className="absolute top-0 right-0 z-[-1] h-full w-1/2">
        <div className="flex h-full w-full rotate-25 items-center justify-center gap-6">
          <div
            ref={ScrollContainerRef}
            className="mt-20 h-screen w-fit overflow-x-hidden overflow-y-auto scroll-auto [&::-webkit-scrollbar]:hidden"
          >
            {[...gameCovers, ...gameCovers].map((game, index) => (
              <div
                key={index}
                className="relative mb-6 h-[260px] w-[220px] overflow-hidden rounded-4xl"
              >
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div
            ref={ReverseScrollContainerRef}
            className="mb-20 h-screen w-fit overflow-x-hidden overflow-y-auto scroll-auto [&::-webkit-scrollbar]:hidden"
          >
            {[...gameCovers, ...gameCovers].reverse().map((game, index) => (
              <div
                key={index}
                className="relative mb-6 h-[260px] w-[220px] overflow-hidden rounded-4xl"
              >
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowForwardRounded } from "@mui/icons-material";

const services = [
  {
    title: "Mobile Legends",
    publisher: "Moonton",
    image: "/game_mlbb.png",
    color: "bg-blue-900",
  },
  {
    title: "Free Fire",
    publisher: "Garena",
    image: "/game_ff.png",
    color: "bg-orange-800",
  },
  {
    title: "Genshin Impact",
    publisher: "Hoyoverse",
    image: "/game_gi.png",
    color: "bg-indigo-900",
  },
  {
    title: "Valorant",
    publisher: "Riot Games",
    image: "/game_val.png",
    color: "bg-red-900",
  },
];

export function PopularServices() {
  return (
    <section className="bg-smoke-200 py-20">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 font-sans text-3xl font-bold text-brand-500 lg:text-4xl">
              Popular Services
            </h2>
            <p className="text-brand-300">
              Top Up your favorite games and pay easily.
            </p>
          </div>

          <Link
            href="/services"
            className="group flex items-center gap-1 text-sm font-semibold text-ocean-500 transition-colors hover:text-ocean-600"
          >
            View all services
            <ArrowForwardRounded className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-ocean-500/10"
            >
              <div
                className={`relative aspect-4/5 w-full overflow-hidden rounded-2xl ${service.color}`}
              >
                {/* 
                   Ideally next/image, using div bg for now to handle missing assets gracefully during dev.
                   In real app, fallback to a color/placeholder if image fails load. 
                */}
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${service.image})` }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-brand-900/80 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
              </div>

              <div className="mt-4 px-2 pb-2">
                <h3 className="font-bold text-brand-500">{service.title}</h3>
                <p className="text-sm text-brand-300">{service.publisher}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { PopularServices } from "@/components/home/PopularServices";
import { CTA } from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <PopularServices />
      <CTA />
    </>
  );
}

import Image from "next/image";
import { motion } from "motion/react";
import type { ProductItem } from "@/lib/api";

interface ItemCardProps {
  item: ProductItem;
  selectedPackage: number | null;
  setSelectedPackage: (id: number) => void;
  formatPrice: (price: number) => string;
  icon: string | null;
}

export default function ItemCard({
  item,
  selectedPackage,
  setSelectedPackage,
  formatPrice,
  icon,
}: ItemCardProps) {
  return (
    <motion.button
      onClick={() => setSelectedPackage(item.id)}
      className={`relative rounded-3xl border-2 p-6 text-center transition-all duration-300 ${
        selectedPackage === item.id
          ? "border-ocean-500 bg-ocean-500/5"
          : "border-brand-500/5 bg-smoke-200 hover:border-ocean-500/30"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-6 flex justify-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-ocean-500/20 bg-ocean-500/10">
          {icon ? (
            <div className="relative h-8 w-8">
              <Image
                src={icon}
                alt={item.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <span className="text-xl">💎</span>
          )}
        </div>
      </div>

      <p className="mb-2 font-bold text-brand-500/90">{item.name}</p>
      <p className="text-xs text-brand-500/40">Rp. {formatPrice(item.price)}</p>
    </motion.button>
  );
}

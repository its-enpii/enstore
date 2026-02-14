import Link from "next/link";
import { motion } from "motion/react";

const MotionLink = motion.create(Link);
interface ProductCardProps {
  href: string;
  imageUrl: string;
  title: string;
  publisher: string;
  className?: string;
  index?: number;
}

const ProductCard = ({
  href,
  imageUrl,
  title,
  publisher,
  className,
  index = 0,
}: ProductCardProps) => {
  const delay = Math.min(index * 0.1, 0.4);

  return (
    <div className={className}>
      <MotionLink
        href={href}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
      >
        <motion.div
          className="group relative h-full cursor-pointer overflow-hidden rounded-3xl bg-smoke-200 p-3 border border-brand-500/5 transition-all duration-300 sm:rounded-[40px] sm:p-4"
          whileHover={{ y: -5 }}
        >
          <div className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl border border-brand-500/5 bg-smoke-300">
            <motion.div
              className="h-40 w-full bg-cover bg-center sm:h-52 lg:h-64"
              style={{ backgroundImage: `url(${imageUrl})` }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="p-3 lg:p-4">
            <h3 className="mb-1 text-sm font-black text-brand-500 sm:mb-2 sm:text-base lg:text-[20px]">
              {title}
            </h3>
            <p className="text-xs font-bold text-brand-500/20 uppercase tracking-widest sm:text-sm">{publisher}</p>
          </div>
        </motion.div>
      </MotionLink>
    </div>
  );
};

export default ProductCard;

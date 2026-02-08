import Link from "next/link";
import { motion } from "motion/react";

interface CardProps {
    href: string;
    imageUrl: string;
    title: string;
    publisher: string;
    className?: string;
    index?: number;
}

const Card = ({ href, imageUrl, title, publisher, className, index }: CardProps) => {
  const MotionLink = motion(Link);

    if (index === undefined) {
        index = 1;
    }

    return (
        <div className={className}>
          <MotionLink
                href={href}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-smoke-200 p-2 shadow-enstore sm:rounded-3xl sm:p-3 lg:rounded-[40px] lg:p-4"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
                    <motion.div
                      className="h-40 w-full bg-cover bg-center sm:h-52 lg:h-64"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <div className="p-2 sm:p-3 lg:p-4">
                    <h3 className="mb-1 text-sm font-bold text-brand-500/90 sm:mb-2 sm:text-base lg:text-[20px]">
                      {title}
                    </h3>
                    <p className="text-xs text-brand-500/40 sm:text-sm">
                      {publisher}
                    </p>
                  </div>
                </motion.div>
              </MotionLink>
        </div>
    );
};

export default Card;
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import { motion } from "motion/react";
import Link from "next/link";
import { Fragment } from "react";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.div
      className="mb-12 flex items-center gap-2 p-2 text-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {items.map((item, index) => (
        <Fragment key={`breadcrumb-${index}`}>
          <Link
            href={item.href || "#"}
            className={`${
              index === items.length - 1
                ? "text-brand-500/40"
                : "text-ocean-500"
            }`}
          >
            {item.label}
          </Link>

          {index < items.length - 1 && (
            <KeyboardArrowRightRounded
              className="text-brand-500/40"
              fontSize="small"
            />
          )}
        </Fragment>
      ))}
    </motion.div>
  );
}

"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export default function Accordion({
  items,
  allowMultiple = false,
  className = "",
  itemClassName = "",
  triggerClassName = "",
  contentClassName = "",
}: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index],
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl border bg-smoke-200 transition-all ${
              isOpen
                ? "border-ocean-500/20 ring-4 shadow-ocean-500/5 ring-ocean-500/5"
                : "border-brand-500/5 hover:border-brand-500/10"
            } ${itemClassName}`}
          >
            <button
              onClick={() => toggleItem(index)}
              className={`flex w-full items-center justify-between px-6 py-4 text-left font-medium transition-colors ${triggerClassName}`}
            >
              <span
                className={`text-sm font-bold tracking-wide uppercase transition-colors ${isOpen ? "text-ocean-500" : "text-brand-500/70"}`}
              >
                {item.title}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={`${isOpen ? "text-ocean-500" : "text-brand-500/40"}`}
              >
                <KeyboardArrowDownRounded />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div
                    className={`border-t border-brand-500/5 bg-smoke-200 px-6 pt-6 pb-6 ${contentClassName}`}
                  >
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

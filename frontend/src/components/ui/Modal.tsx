"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { CloseRounded } from "@mui/icons-material";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = "md",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-9998 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full overflow-hidden rounded-[32px] bg-white text-left shadow-xl ${widthClasses[width]}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  {title ? <h3 className="text-xl font-bold text-gray-800">{title}</h3> : <div></div>}
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                  >
                    <CloseRounded className="h-5 w-5" />
                  </button>
              </div>

              {/* Content */}
              <div className="p-0">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

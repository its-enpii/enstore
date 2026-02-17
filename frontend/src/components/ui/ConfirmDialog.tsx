"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { WarningRounded, LogoutRounded } from "@mui/icons-material";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-900/60 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-sm overflow-hidden rounded-xl border border-brand-500/10 bg-smoke-200 p-8 shadow-2xl"
          >
            {/* Background Decoration */}
            <div
              className={`absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20 blur-3xl ${
                variant === "danger" ? "bg-red-500" : "bg-ocean-500"
              }`}
            ></div>

            <div className="relative flex flex-col items-center text-center">
              {/* Icon Section */}
              <div
                className={`mb-6 flex h-20 w-20 items-center justify-center rounded-xl shadow-xl ${
                  variant === "danger"
                    ? "bg-red-500 text-smoke-200 shadow-red-500/20"
                    : variant === "warning"
                      ? "bg-amber-500 text-smoke-200 shadow-amber-500/20"
                      : "bg-ocean-500 text-smoke-200 shadow-ocean-500/20"
                }`}
              >
                {title.toLowerCase().includes("logout") ? (
                  <LogoutRounded fontSize="large" />
                ) : (
                  <WarningRounded fontSize="large" />
                )}
              </div>

              {/* Text Content */}
              <h3 className="mb-3 text-2xl font-bold tracking-tight text-brand-500/90">
                {title}
              </h3>
              <p className="mb-8 px-2 text-sm leading-relaxed font-medium text-brand-500/40">
                {description}
              </p>

              {/* Actions */}
              <div className="flex w-full gap-3">
                <Button
                  variant="white"
                  onClick={onClose}
                  fullWidth
                  disabled={isLoading}
                  className="rounded-xl! border-none! bg-slate-100! text-slate-600! hover:bg-slate-200!"
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant="primary"
                  onClick={onConfirm}
                  fullWidth
                  isLoading={isLoading}
                  className={`rounded-xl! ${
                    variant === "danger"
                      ? "bg-red-600! text-white! shadow-sm hover:bg-red-700! hover:shadow-md"
                      : ""
                  }`}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default ConfirmDialog;

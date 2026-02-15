"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { WarningRounded, LogoutRounded } from "@mui/icons-material";
import DashboardButton from "./DashboardButton";

interface DashboardConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const DashboardConfirmDialog: React.FC<DashboardConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
            className="relative w-full max-w-sm bg-white rounded-[32px] border border-brand-500/10 shadow-2xl p-8 overflow-hidden"
          >
            {/* Background Decoration */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${
                variant === 'danger' ? 'bg-red-500' : 'bg-ocean-500'
            }`}></div>

            <div className="relative flex flex-col items-center text-center">
              {/* Icon Section */}
              <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-xl ${
                variant === "danger" ? "bg-red-500 text-white shadow-red-500/20" : 
                variant === "warning" ? "bg-amber-500 text-white shadow-amber-500/20" : 
                "bg-ocean-500 text-white shadow-ocean-500/20"
              }`}>
                {title.toLowerCase().includes("logout") ? (
                  <LogoutRounded fontSize="large" />
                ) : (
                  <WarningRounded fontSize="large" />
                )}
              </div>

              {/* Text Content */}
              <h3 className="text-2xl font-black text-brand-500 mb-3 tracking-tight">
                {title}
              </h3>
              <p className="text-sm font-bold text-brand-500/40 mb-8 leading-relaxed px-2">
                {description}
              </p>

              {/* Actions */}
              <div className="flex w-full gap-3">
                <DashboardButton
                  variant="secondary"
                  onClick={onClose}
                  fullWidth
                  disabled={isLoading}
                >
                  {cancelLabel}
                </DashboardButton>
                <DashboardButton
                  variant={variant === "danger" ? "danger" : "primary"}
                  onClick={onConfirm}
                  fullWidth
                  loading={isLoading}
                >
                  {confirmLabel}
                </DashboardButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default DashboardConfirmDialog;

"use client";

import React from "react";
import {
  HelpOutlineRounded,
  WarningAmberRounded,
  ErrorOutlineRounded,
  InfoOutlined,
} from "@mui/icons-material";
import Modal from "./Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info" | "question";
  loading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "question",
  loading = false,
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return (
          <ErrorOutlineRounded
            className="text-red-500"
            style={{ fontSize: 48 }}
          />
        );
      case "warning":
        return (
          <WarningAmberRounded
            className="text-amber-500"
            style={{ fontSize: 48 }}
          />
        );
      case "info":
        return (
          <InfoOutlined className="text-ocean-500" style={{ fontSize: 48 }} />
        );
      default:
        return (
          <HelpOutlineRounded
            className="text-brand-500/40"
            style={{ fontSize: 48 }}
          />
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20";
      case "info":
        return "bg-ocean-500 hover:bg-ocean-600 text-white shadow-lg shadow-ocean-500/20";
      default:
        return "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="sm">
      <div className="p-8 pt-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-smoke-300 p-4">{getIcon()}</div>
        </div>

        <h3 className="mb-2 text-xl font-bold text-brand-500/90">{title}</h3>
        <p className="mb-8 text-sm leading-relaxed text-brand-500/50">
          {message}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onClose}
            className="order-2 w-full rounded-xl border border-brand-500/10 px-6 py-3 text-sm font-bold text-brand-500/60 transition hover:bg-smoke-300 hover:text-brand-500/90 sm:order-1 sm:w-auto"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`order-1 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition sm:order-2 sm:w-auto ${getConfirmButtonClass()}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import React from "react";
import Button from "./Button";
import Modal from "./Modal";
import { WarningRounded } from "@mui/icons-material";

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

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <WarningRounded className="h-12 w-12 text-red-500" />;
      case "warning":
        return <WarningRounded className="h-12 w-12 text-orange-500" />;
      default:
        return <WarningRounded className="h-12 w-12 text-blue-500" />;
    }
  };



  return (
    <Modal isOpen={isOpen} onClose={onClose} width="sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
          {getIcon()}
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mb-8 text-gray-500">{description}</p>

        <div className="flex w-full gap-3">
          <Button
            variant="white"
            onClick={onClose}
            className="flex-1 justify-center border border-gray-200"
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className={`flex-1 justify-center ${variant === "danger" ? "bg-red-500! text-smoke-200! !hover:bg-red-600" : ""}`}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

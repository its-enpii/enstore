"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardNumericInput from "@/components/dashboard/DashboardNumericInput";
import DashboardButton from "@/components/dashboard/DashboardButton";
import { ProductItem } from "@/lib/api/types";

interface ProductItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: Partial<ProductItem>;
  setCurrentItem: React.Dispatch<React.SetStateAction<Partial<ProductItem>>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

export default function ProductItemModal({
  isOpen,
  onClose,
  currentItem,
  setCurrentItem,
  onSave,
  loading,
}: ProductItemModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentItem.id ? "Edit SKU Item" : "Add New SKU Item"}
      width="lg"
    >
      <form onSubmit={onSave} className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DashboardInput
            label="Item Name"
            value={currentItem.name || ""}
            onChange={(e) =>
              setCurrentItem((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="e.g. 5 Diamonds"
            required
            fullWidth
          />
          <DashboardInput
            label="SKU Code (Unique)"
            value={currentItem.digiflazz_code || ""}
            onChange={(e) =>
              setCurrentItem((prev) => ({
                ...prev,
                digiflazz_code: e.target.value,
              }))
            }
            placeholder="e.g. ML-5"
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DashboardNumericInput
            label="Base Price"
            value={currentItem.base_price || 0}
            onChange={(val) =>
              setCurrentItem((prev) => ({
                ...prev,
                base_price: val,
              }))
            }
            fullWidth
          />
          <DashboardNumericInput
            label="Retail Price"
            value={currentItem.retail_price || 0}
            onChange={(val) =>
              setCurrentItem((prev) => ({
                ...prev,
                retail_price: val,
              }))
            }
            fullWidth
          />
          <DashboardNumericInput
            label="Reseller Price"
            value={currentItem.reseller_price || 0}
            onChange={(val) =>
              setCurrentItem((prev) => ({
                ...prev,
                reseller_price: val,
              }))
            }
            fullWidth
          />
        </div>

        <div className="flex gap-4 pt-2">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg bg-smoke-200 px-4 py-2.5 transition-colors hover:bg-smoke-300">
            <input
              type="checkbox"
              checked={currentItem.is_active ?? true}
              onChange={(e) =>
                setCurrentItem((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded text-ocean-500"
            />
            <span className="text-sm font-bold text-brand-500/60">
              Active Status
            </span>
          </label>
          <div className="flex-1 space-y-1">
            <label className="ml-1 text-[10px] font-bold tracking-tight text-brand-500/30 uppercase">
              Stock Status
            </label>
            <div className="relative">
              <select
                value={currentItem.stock_status || "available"}
                onChange={(e) =>
                  setCurrentItem((prev) => ({
                    ...prev,
                    stock_status: e.target.value,
                  }))
                }
                className="w-full appearance-none rounded-xl border border-brand-500/10 bg-smoke-200 px-4 py-2.5 text-sm font-bold text-brand-500 outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/30"
              >
                <option value="available">Available</option>
                <option value="empty">Empty</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-brand-500/5 pt-6">
          <DashboardButton variant="secondary" type="button" onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton type="submit" loading={loading} disabled={loading}>
            Save Item
          </DashboardButton>
        </div>
      </form>
    </Modal>
  );
}

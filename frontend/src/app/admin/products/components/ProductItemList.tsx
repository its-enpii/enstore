"use client";

import React from "react";
import { EditRounded, DeleteRounded, AddRounded } from "@mui/icons-material";
import DashboardButton from "@/components/dashboard/DashboardButton";
import { ProductItem } from "@/lib/api/types";

interface ProductItemListProps {
  items: ProductItem[];
  onEdit: (item: ProductItem) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

export default function ProductItemList({
  items,
  onEdit,
  onDelete,
  onAdd,
}: ProductItemListProps) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-brand-500/10 bg-smoke-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-brand-500/10 p-6">
        <h3 className="text-lg font-bold text-brand-500">
          Product Items (SKUs)
        </h3>
        <DashboardButton size="sm" icon={<AddRounded />} onClick={onAdd}>
          Add SKU
        </DashboardButton>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center font-bold text-brand-500/40">
          No items found. Add one to start selling.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-brand-500/5 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                <th className="px-6 py-3 pl-8">Name</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3 text-right">Base Price</th>
                <th className="px-6 py-3 text-right">Retail Price</th>
                <th className="px-6 py-3 text-right">Reseller</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-500/5">
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-white">
                  <td className="px-6 py-3 pl-8 font-bold text-brand-500">
                    {item.name}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-brand-500/60">
                    {item.digiflazz_code}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-brand-500/60">
                    Rp {(item.base_price ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-ocean-500">
                    Rp {(item.retail_price ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-500">
                    Rp {(item.reseller_price ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${item.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 pr-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded p-1.5 text-ocean-500 hover:bg-ocean-500/10"
                      >
                        <EditRounded fontSize="small" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-500/10"
                      >
                        <DeleteRounded fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

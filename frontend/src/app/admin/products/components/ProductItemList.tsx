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
              <tr className="bg-brand-500/2 text-xs font-bold tracking-widest text-brand-500/30 uppercase">
                <th className="px-6 py-4 pl-8">Item Information</th>
                <th className="px-6 py-4">SKU Code</th>
                <th className="px-6 py-4 text-right">Pricing Details</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-500/5">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-all duration-200 hover:bg-white/80"
                >
                  <td className="px-6 py-4 pl-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-brand-500 transition-colors group-hover:text-ocean-500">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-medium text-brand-500/30">
                        ID: {item.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="rounded-lg border border-brand-500/5 bg-brand-500/5 px-2.5 py-1 font-mono text-xs font-medium text-brand-500/60 ring-1 ring-brand-500/5">
                      {item.digiflazz_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold tracking-tighter text-brand-500/20 uppercase">
                          Base
                        </span>
                        <span className="font-mono text-xs text-brand-500/60">
                          <span className="mr-0.5 text-[10px] opacity-40">
                            Rp
                          </span>
                          {Number(item.base_price ?? 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold tracking-tighter text-ocean-500/30 uppercase">
                          Retail
                        </span>
                        <span className="text-sm font-bold text-ocean-500">
                          <span className="mr-0.5 text-[10px] opacity-50">
                            Rp
                          </span>
                          {Number(item.retail_price ?? 0).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold tracking-tighter text-emerald-500/30 uppercase">
                          Reseller
                        </span>
                        <span className="text-sm font-bold text-emerald-500">
                          <span className="mr-0.5 text-[10px] opacity-50">
                            Rp
                          </span>
                          {Number(item.reseller_price ?? 0).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-xs ${
                        item.is_active
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                          : "border border-red-500/20 bg-red-500/10 text-red-600"
                      }`}
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 pr-8 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-ocean-500 transition-all hover:bg-ocean-500/10 hover:shadow-sm"
                        title="Edit SKU"
                      >
                        <EditRounded sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-red-500 transition-all hover:bg-red-500/10 hover:shadow-sm"
                        title="Delete SKU"
                      >
                        <DeleteRounded sx={{ fontSize: 18 }} />
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

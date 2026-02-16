"use client";

import React from "react";
import { ImageRounded } from "@mui/icons-material";

interface ProductVisualAssetsProps {
  imagePreview: string | null;
  iconPreview: string | null;
  handleImageChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "icon",
  ) => void;
}

export default function ProductVisualAssets({
  imagePreview,
  iconPreview,
  handleImageChange,
}: ProductVisualAssetsProps) {
  return (
    <div className="space-y-6 rounded-[32px] border border-brand-500/10 bg-smoke-200 p-8 shadow-sm">
      <h3 className="border-b border-brand-500/5 pb-4 text-lg font-bold text-brand-500">
        Visual Assets
      </h3>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-500/10 bg-white">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="h-full w-full object-cover"
                alt="Product Preview"
              />
            ) : (
              <ImageRounded className="text-brand-500/40" />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-brand-500/50 uppercase">
              Cover Image
            </label>
            <input
              type="file"
              onChange={(e) => handleImageChange(e, "image")}
              accept="image/*"
              className="w-full cursor-pointer text-xs text-brand-500 file:mr-2 file:rounded-full file:border-0 file:bg-ocean-500/10 file:px-3 file:py-1 file:text-ocean-500 hover:file:bg-ocean-500/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-500/10 bg-white">
            {iconPreview ? (
              <img
                src={iconPreview}
                className="h-full w-full object-cover"
                alt="Icon Preview"
              />
            ) : (
              <ImageRounded className="text-brand-500/40" />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-brand-500/50 uppercase">
              Icon Logo
            </label>
            <input
              type="file"
              onChange={(e) => handleImageChange(e, "icon")}
              accept="image/*"
              className="w-full cursor-pointer text-xs text-brand-500 file:mr-2 file:rounded-full file:border-0 file:bg-ocean-500/10 file:px-3 file:py-1 file:text-ocean-500 hover:file:bg-ocean-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

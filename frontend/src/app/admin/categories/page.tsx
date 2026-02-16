"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  SearchRounded,
  CategoryRounded,
  InfoRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api, ENDPOINTS } from "@/lib/api";

// --- Types ---
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products_count?: number;
}

export default function AdminCategoriesPage() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Using public endpoint as Admin API for categories does not exist yet
      const res = await api.get<Category[]>(ENDPOINTS.products.categories);
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Fetch categories failed:", err);
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filtered Categories
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">
              Categories 🏷️
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              View product categories.
            </p>
          </div>
          {/* Add Button Removed: API not supported */}
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <InfoRounded className="mt-0.5 text-blue-500" />
          <div>
            <p className="text-sm font-bold text-blue-700">Read Only Access</p>
            <p className="mt-1 text-xs text-blue-600/80">
              Saat ini manajemen kategori (Create/Update/Delete) belum tersedia
              di API Backend. Halaman ini hanya menampilkan daftar kategori yang
              ada.
            </p>
          </div>
        </div>

        {/* Filter Bar (Separated) */}
        <div className="flex flex-col gap-4 rounded-3xl border border-brand-500/5 bg-smoke-200 p-4 md:flex-row">
          <div className="relative flex-1">
            <SearchRounded className="absolute top-1/2 left-4 -translate-y-1/2 text-brand-500/30" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 py-3 pr-4 pl-12 text-brand-500/90 transition-all outline-none placeholder:text-brand-500/20 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10"
            />
          </div>
        </div>

        {/* Categories Table (Data Container) */}
        <div className="overflow-hidden rounded-xl border border-brand-500/5 bg-smoke-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
              <p className="font-bold text-brand-500/40">
                Loading categories...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-20 text-center">
              <CategoryRounded className="mb-4 text-6xl text-brand-500/10" />
              <h3 className="text-xl font-bold text-brand-500/90">
                No Categories Found
              </h3>
              <p className="mt-1 text-brand-500/40">Try a different search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-brand-500/5 bg-brand-500/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 pl-8 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Products
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {filteredCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="group transition-colors hover:bg-smoke-200"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-500/10 text-ocean-500">
                            <CategoryRounded fontSize="small" />
                          </div>
                          <span className="font-bold text-brand-500/90">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-block rounded-md bg-brand-500/5 px-2 py-0.5 font-mono text-xs font-bold text-brand-500/40">
                          {cat.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="line-clamp-1 max-w-[200px] text-sm font-medium text-brand-500/60">
                          {cat.description || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-brand-500/40">
                          {cat.products_count || 0} Items
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

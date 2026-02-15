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
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
       <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-2xl font-black text-brand-500">Categories 🏷️</h1>
                <p className="text-brand-500/50 mt-1 font-bold">View product categories.</p>
             </div>
             {/* Add Button Removed: API not supported */}
          </div>

          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
              <InfoRounded className="text-blue-500 mt-0.5" />
              <div>
                  <p className="text-blue-700 font-bold text-sm">Read Only Access</p>
                  <p className="text-blue-600/80 text-xs mt-1">
                      Saat ini manajemen kategori (Create/Update/Delete) belum tersedia di API Backend. 
                      Halaman ini hanya menampilkan daftar kategori yang ada.
                  </p>
              </div>
          </div>

          {/* Filter Bar (Separated) */}
          <div className="bg-smoke-200 p-4 rounded-3xl border border-brand-500/5 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                  <SearchRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none transition-all font-bold text-brand-500 placeholder:text-brand-500/20"
                  />
              </div>
          </div>

          {/* Categories Table (Data Container) */}
          <div className="bg-smoke-200 rounded-[32px] border border-brand-500/5 overflow-hidden shadow-sm">
              {loading ? (
                 <div className="p-12 text-center">
                    <div className="inline-block w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-brand-500/40 font-bold">Loading categories...</p>
                 </div>
              ) : filteredCategories.length === 0 ? (
                 <div className="p-20 text-center">
                    <CategoryRounded className="text-brand-500/10 text-6xl mb-4" />
                    <h3 className="text-xl font-bold text-brand-500">No Categories Found</h3>
                    <p className="text-brand-500/40 mt-1">Try a different search.</p>
                 </div>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-brand-500/5 border-b border-brand-500/5">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest pl-8">Name</th>
                                <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">Slug</th>
                                <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-xs font-black text-brand-500/40 uppercase tracking-widest">Products</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-500/5">
                            {filteredCategories.map(cat => (
                                <tr key={cat.id} className="group hover:bg-white transition-colors">
                                    <td className="px-6 py-4 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-ocean-500/10 text-ocean-500 flex items-center justify-center">
                                                <CategoryRounded fontSize="small" />
                                            </div>
                                            <span className="font-bold text-brand-500">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs bg-brand-500/5 text-brand-500/40 px-2 py-0.5 rounded-md inline-block font-mono font-bold">
                                            {cat.slug}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-brand-500/60 line-clamp-1 max-w-[200px] font-medium">
                                            {cat.description || '-'}
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

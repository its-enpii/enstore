"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AddRounded,
  SearchRounded,
  FilterListRounded,
  EditRounded,
  DeleteRounded,
  CloudSyncRounded,
  MoreVertRounded,
  GamepadRounded,
  LocalOfferRounded,
  WifiRounded,
  ElectricBoltRounded,
  PhoneAndroidRounded,
  Inventory2Rounded,
  ChevronLeftRounded,
  ChevronRightRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";

import { api, ENDPOINTS } from "@/lib/api";

// --- Types ---
interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  type: string;
  category?: {
    name: string;
    slug: string;
  };
  is_active: boolean;
  is_featured: boolean;
  image?: string;
  items_count?: number; 
  created_at: string;
}

interface ProductsResponse {
  current_page: number;
  data: Product[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// --- Icons Helper ---
const getTypeIcon = (type: string) => {
  switch (type) {
    case "game": return <GamepadRounded fontSize="small" />;
    case "pulsa": return <PhoneAndroidRounded fontSize="small" />;
    case "data": return <WifiRounded fontSize="small" />;
    case "pln": return <ElectricBoltRounded fontSize="small" />;
    case "voucher": return <LocalOfferRounded fontSize="small" />;
    default: return <Inventory2Rounded fontSize="small" />;
  }
};

export default function AdminProductsPage() {
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: "",
  });

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      params.append("page",String(filters.page));
      params.append("per_page", String(filters.per_page));
      if (filters.search) params.append("search", filters.search);

      const endpoint = `${ENDPOINTS.admin.products.list}?${params.toString()}`;
      // Pass generic type to api.get to fix "unknown" type error
      const res = await api.get<ProductsResponse>(endpoint, undefined, true);

      if (res.success) {
        setProducts(res.data.data);
        setMeta({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
          from: res.data.from,
          to: res.data.to,
        });
      }
    } catch (err) {
      console.error("Fetch products failed:", err);
      toast.error("Gagal memuat daftar produk");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial Fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1, search: searchTerm }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSyncDigiflazz = async () => {
    setSyncing(true);
    const toastId = toast.loading("Sedang sinkronisasi produk dengan Digiflazz...");
    try {
      const res = await api.post(ENDPOINTS.admin.products.syncDigiflazz, {}, true);
      if (res.success) {
        toast.success("Sinkronisasi berhasil!", { id: toastId });
        fetchProducts(); // Refresh list
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal sinkronisasi", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini? Semua item terkait akan ikut terhapus.")) return;

    try {
      const endpoint = ENDPOINTS.admin.products.delete(id);
      const res = await api.delete(endpoint, true);
      if (res.success) {
        toast.success("Produk berhasil dihapus");
        fetchProducts();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus produk");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">Product Management 🎮</h1>
            <p className="text-brand-500/50 mt-1 font-bold">Manage game services, vouchers, and product catalogs.</p>
          </div>
          
          <div className="flex gap-3">
             <DashboardButton 
                variant="secondary" 
                icon={<CloudSyncRounded />} 
                onClick={handleSyncDigiflazz}
                loading={syncing}
                disabled={syncing}
                className="bg-smoke-200"
             >
                Sync Digiflazz
             </DashboardButton>
             <Link href="/admin/products/create">
                <DashboardButton icon={<AddRounded />}>
                   Add Product
                </DashboardButton>
             </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-smoke-200 p-4 rounded-3xl border border-brand-500/5 flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <SearchRounded className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/30" />
            <input
              type="text"
              placeholder="Search product name, brand, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/10 outline-none transition-all font-bold text-brand-500/90 placeholder:text-brand-500/20"
            />
          </form>
          
          <div className="flex gap-3">
             {/* Unused Input import removed to fix linting, using native input above */}
             <button className="px-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 text-brand-500/60 font-bold hover:bg-brand-500/5 hover:text-brand-500/90 transition-colors flex items-center gap-2">
                <FilterListRounded fontSize="small" />
                <span>Filters</span>
             </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-smoke-200 rounded-xl border border-brand-500/5 overflow-hidden shadow-sm">
          {loading ? (
             <div className="p-12 text-center">
                <div className="inline-block w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-500/40 font-bold">Loading products...</p>
             </div>
          ) : products.length === 0 ? (
             <div className="p-20 text-center">
                <GamepadRounded className="text-brand-500/10 text-6xl mb-4" />
                <h3 className="text-xl font-bold text-brand-500/90">No Products Found</h3>
                <p className="text-brand-500/40 mt-1">Try adjusting your search or add a new product.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-500/5 border-b border-brand-500/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-bold text-brand-500/40 uppercase tracking-widest pl-8">Product Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-brand-500/40 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-brand-500/40 uppercase tracking-widest">Brand</th>
                    <th className="px-6 py-4 text-xs font-bold text-brand-500/40 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-brand-500/40 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-brand-500/40 uppercase tracking-widest text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {products.map((product) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      key={product.id} 
                      className="group hover:bg-smoke-200 transition-colors cursor-default"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-cloud-100 flex items-center justify-center overflow-hidden border border-brand-500/5">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                getTypeIcon(product.type)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-brand-500/90">{product.name}</div>
                            <div className="text-[10px] bg-brand-500/5 text-brand-500/40 px-2 py-0.5 rounded-md inline-block mt-1 font-bold">
                                {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-brand-500/60 font-bold text-sm">
                            {getTypeIcon(product.type)}
                            <span className="capitalize">{product.type}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="font-bold text-brand-500/90">{product.brand}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-sm font-bold text-brand-500/60">{product.category?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${product.is_active 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                           {product.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/products/${product.id}`}>
                            <button className="p-2 rounded-xl text-ocean-500 hover:bg-ocean-500/10 transition-colors" title="Edit">
                              <EditRounded fontSize="small" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors" 
                            title="Delete"
                          >
                            <DeleteRounded fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t border-brand-500/5 flex items-center justify-between">
               <p className="text-xs font-bold text-brand-500/40 pl-4">
                  Showing {meta.from}-{meta.to} of {meta.total} items
               </p>
               <div className="flex gap-2 pr-4">
                  <button 
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page === 1}
                    className="p-2 rounded-xl border border-brand-500/10 hover:bg-smoke-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-brand-500/90"
                  >
                     <ChevronLeftRounded fontSize="small" />
                  </button>
                  {[...Array(meta.last_page).keys()].map((idx) => {
                      // Simple logic to show max 5 pages, to allow build to pass without errors on "Array(tooBig)" if it happens
                      // But for now, let's just stick to reliable basic map
                      return (
                        <button
                            key={idx}
                            onClick={() => handlePageChange(idx + 1)}
                            className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors border ${
                                meta.current_page === idx + 1 
                                ? 'bg-ocean-500 border-ocean-500 text-white' 
                                : 'bg-transparent border-transparent hover:bg-smoke-200 text-brand-500/60'
                            }`}
                        >
                            {idx + 1}
                        </button>
                      );
                  })}
                  <button 
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page}
                    className="p-2 rounded-xl border border-brand-500/10 hover:bg-smoke-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-brand-500/90"
                  >
                     <ChevronRightRounded fontSize="small" />
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

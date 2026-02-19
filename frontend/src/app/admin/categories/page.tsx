"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  SearchRounded,
  CategoryRounded,
  AddRounded,
  EditRounded,
  DeleteRounded,
  CloseRounded,
  CloudUploadRounded,
  ImageRounded,
  FilterListRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { api, ENDPOINTS } from "@/lib/api";
import {
  ProductCategory as Category,
  LaravelPagination,
} from "@/lib/api/types";

export default function AdminCategoriesPage() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] =
    useState<LaravelPagination<Category> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "PHYSICAL",
    description: "",
    icon: null as File | null,
    is_active: true,
    sort_order: 0,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    loading: false,
  });

  // Fetch Categories
  const fetchCategories = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const endpoint = ENDPOINTS.admin.categories.list;
      const res = await api.get<LaravelPagination<Category>>(
        endpoint,
        { search },
        true,
      );
      if (res.success) {
        // Handle both paginated and raw array responses
        const categoryData = Array.isArray(res.data)
          ? res.data
          : (res.data as any).data || [];
        setCategories(categoryData);
        if (!Array.isArray(res.data)) {
          setPagination(res.data as any);
        }
      }
    } catch (err) {
      console.error("Fetch categories failed:", err);
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchCategories]);

  // Modal Handlers
  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        type: category.type || "PHYSICAL",
        description: category.description || "",
        icon: null,
        is_active: category.is_active,
        sort_order: category.sort_order || 0,
      });
      setPreviewImage(category.icon);
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        type: "PHYSICAL",
        description: "",
        icon: null,
        is_active: true,
        sort_order: 0,
      });
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, icon: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("slug", formData.slug);
      dataToSend.append("type", formData.type);
      dataToSend.append("description", formData.description);
      dataToSend.append("is_active", formData.is_active ? "1" : "0");
      dataToSend.append("sort_order", formData.sort_order.toString());
      if (formData.icon) {
        dataToSend.append("icon", formData.icon);
      }

      let res;
      if (editingCategory) {
        // Use POST for update to handle FormData/File upload in PHP
        res = await api.post(
          ENDPOINTS.admin.categories.update(editingCategory.id),
          dataToSend,
          true,
        );
      } else {
        res = await api.post(
          ENDPOINTS.admin.categories.create,
          dataToSend,
          true,
        );
      }

      if (res.success) {
        toast.success(
          editingCategory
            ? "Kategori berhasil diperbarui"
            : "Kategori berhasil dibuat",
        );
        setIsModalOpen(false);
        fetchCategories(searchTerm);
      } else {
        toast.error(res.message || "Gagal menyimpan kategori");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDelete({ isOpen: true, id, loading: false });
  };

  const processDelete = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.delete(
        ENDPOINTS.admin.categories.delete(confirmDelete.id),
        true,
      );
      if (res.success) {
        toast.success("Kategori berhasil dihapus");
        fetchCategories(searchTerm);
        setConfirmDelete({ isOpen: false, id: null, loading: false });
      } else {
        toast.error(res.message || "Gagal menghapus kategori");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus kategori");
    } finally {
      setConfirmDelete((prev) => ({ ...prev, loading: false }));
    }
  };

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
              Manage product categories.
            </p>
          </div>
          <DashboardButton
            variant="primary"
            icon={<AddRounded />}
            onClick={() => handleOpenModal()}
          >
            Add Category
          </DashboardButton>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-6 rounded-3xl border border-brand-500/5 bg-smoke-200 p-5 md:flex-row">
          <DashboardInput
            fullWidth
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<SearchRounded />}
          />
        </div>

        {/* Categories Table (Data Container) */}
        <div className="overflow-hidden rounded-2xl border border-brand-500/5 bg-smoke-200 shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
              <p className="font-bold text-brand-500/40">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
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
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Products
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-500/5">
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="group transition-colors hover:bg-smoke-200"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-ocean-500/10 text-ocean-500">
                            {cat.icon ? (
                              <Image
                                src={
                                  typeof cat.icon === "string" &&
                                  cat.icon.startsWith("http")
                                    ? cat.icon
                                    : `/api/storage/${cat.icon}`
                                }
                                alt={cat.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <CategoryRounded fontSize="small" />
                            )}
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
                        <span className="text-xs font-bold text-brand-500/60">
                          {cat.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-brand-500/40">
                          {cat.products_count || 0} Items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={cat.is_active ? "active" : "neutral"}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <DashboardButton
                            variant="secondary"
                            size="sm"
                            icon={<EditRounded sx={{ fontSize: 16 }} />}
                            onClick={() => handleOpenModal(cat)}
                          />
                          <DashboardButton
                            variant="secondary"
                            size="sm"
                            className="text-red-500 hover:bg-red-50!"
                            icon={<DeleteRounded sx={{ fontSize: 16 }} />}
                            onClick={() => handleDelete(cat.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-500/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-hidden overflow-y-auto rounded-xl bg-smoke-200 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brand-500/90">
                    {editingCategory ? "Edit Category" : "New Category"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-smoke-200 text-brand-500/40 transition-all hover:bg-brand-500/5 hover:text-brand-500/90"
                  >
                    <CloseRounded />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Icon Upload */}
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Category Icon
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex h-32 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-500/10 bg-smoke-200 transition-all hover:border-ocean-500/30"
                    >
                      {previewImage ? (
                        <>
                          <Image
                            src={
                              typeof previewImage === "string" &&
                              (previewImage.startsWith("http") ||
                                previewImage.startsWith("data:"))
                                ? previewImage
                                : `/api/storage/${previewImage}`
                            }
                            alt="preview"
                            fill
                            className="object-contain p-4"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-500/40 opacity-0 transition-all group-hover:opacity-100">
                            <CloudUploadRounded className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <ImageRounded
                            className="mb-2 text-brand-500/20"
                            sx={{ fontSize: 32 }}
                          />
                          <p className="text-xs font-bold text-brand-500/40">
                            Upload Icon
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <DashboardInput
                    label="Category Name"
                    placeholder="e.g. Mobile Legends"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    fullWidth
                    required
                  />

                  <DashboardInput
                    label="Slug (Optional)"
                    placeholder="e.g. mobile-legends"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    fullWidth
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <DashboardSelect
                      label="Type"
                      options={[
                        { value: "PHYSICAL", label: "Physical Goods" },
                        { value: "VIRTUAL", label: "Virtual / Top Up" },
                      ]}
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    />

                    <DashboardInput
                      label="Sort Order"
                      type="number"
                      value={formData.sort_order.toString()}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sort_order: parseInt(e.target.value) || 0,
                        })
                      }
                      fullWidth
                    />
                  </div>

                  <DashboardSelect
                    label="Status"
                    options={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                    value={formData.is_active ? "1" : "0"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === "1",
                      })
                    }
                  />

                  <div className="pt-4">
                    <DashboardButton
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={submitting}
                    >
                      {editingCategory ? "Update Category" : "Create Category"}
                    </DashboardButton>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={processDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products associated with it might be affected."
        confirmLabel="Delete Category"
        loading={confirmDelete.loading}
        type="danger"
      />
    </DashboardLayout>
  );
}

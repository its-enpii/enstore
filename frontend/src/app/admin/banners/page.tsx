"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  AddRounded,
  SearchRounded,
  FilterListRounded,
  EditRounded,
  DeleteRounded,
  ImageRounded,
  LinkRounded,
  CalendarTodayRounded,
  CloseRounded,
  CloudUploadRounded,
  SaveRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import DataTable from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import { api, ENDPOINTS } from "@/lib/api";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function AdminBannersPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    type: "",
    search: "",
    page: 1,
  });

  // Ordering State
  const [orders, setOrders] = useState<{ [key: number]: number }>({});
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    loading: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "slider",
    link: "",
    description: "",
    is_active: true,
    sort_order: 0,
    start_date: "",
    end_date: "",
    image: null as File | null,
  });

  useEffect(() => {
    fetchBanners();
  }, [filters]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        type: filters.type,
        search: filters.search,
        page: filters.page.toString(),
      }).toString();

      const res = await api.get(
        ENDPOINTS.admin.banners.list + `?${query}`,
        undefined,
        true,
      );
      if (res.success) {
        const resData = res.data as any;
        setData(resData.data);
        setPagination({
          current_page: resData.current_page,
          last_page: resData.last_page,
          total: resData.total,
        });

        // Initialize orders state
        const initialOrders: any = {};
        resData.data.forEach((item: any) => {
          initialOrders[item.id] = item.sort_order;
        });
        setOrders(initialOrders);
        setHasOrderChanges(false);
      }
    } catch (err) {
      toast.error("Gagal mengambil data banner");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (id: number, value: string) => {
    const newOrder = parseInt(value) || 0;
    setOrders((prev) => ({ ...prev, [id]: newOrder }));
    setHasOrderChanges(true);
  };

  const saveOrders = async () => {
    setSavingOrder(true);
    try {
      const payload = {
        orders: Object.entries(orders).map(([id, sort_order]) => ({
          id: parseInt(id),
          sort_order,
        })),
      };

      const res = await api.post(
        ENDPOINTS.admin.banners.updateOrder, // Endpoint already exists in config.ts based on previous check
        payload,
        true,
      );

      if (res.success) {
        toast.success("Order saved!");
        setHasOrderChanges(false);
        fetchBanners();
      } else {
        toast.error("Failed to save order");
      }
    } catch (err) {
      toast.error("Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleOpenModal = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        type: banner.type,
        link: banner.link || "",
        description: banner.description || "",
        is_active: banner.is_active,
        sort_order: banner.sort_order,
        start_date: banner.start_date
          ? new Date(banner.start_date).toISOString().slice(0, 16)
          : "",
        end_date: banner.end_date
          ? new Date(banner.end_date).toISOString().slice(0, 16)
          : "",
        image: null,
      });
      setPreviewImage(banner.image);
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        type: "slider",
        link: "",
        description: "",
        is_active: true,
        sort_order: 0,
        start_date: "",
        end_date: "",
        image: null,
      });
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
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
      dataToSend.append("title", formData.title);
      dataToSend.append("type", formData.type);
      dataToSend.append("link", formData.link);
      dataToSend.append("description", formData.description);
      dataToSend.append("is_active", formData.is_active ? "1" : "0");
      dataToSend.append("sort_order", formData.sort_order.toString());
      if (formData.start_date)
        dataToSend.append("start_date", formData.start_date);
      if (formData.end_date) dataToSend.append("end_date", formData.end_date);
      if (formData.image) dataToSend.append("image", formData.image);

      let res;
      if (editingBanner) {
        res = await api.post(
          ENDPOINTS.admin.banners.update(editingBanner.id),
          dataToSend,
          true,
        );
      } else {
        res = await api.post(ENDPOINTS.admin.banners.create, dataToSend, true);
      }

      if (res.success) {
        toast.success(
          editingBanner
            ? "Banner berhasil diperbarui"
            : "Banner berhasil dibuat",
        );
        setIsModalOpen(false);
        fetchBanners();
      } else {
        toast.error(res.message || "Gagal menyimpan banner");
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
        ENDPOINTS.admin.banners.delete(confirmDelete.id),
        true,
      );
      if (res.success) {
        toast.success("Banner berhasil dihapus");
        fetchBanners();
        setConfirmDelete({ isOpen: false, id: null, loading: false });
      } else {
        toast.error(res.message || "Gagal menghapus banner");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus banner");
    } finally {
      setConfirmDelete((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusLabel = (banner: any) => {
    if (!banner.is_active) return { label: "INACTIVE", status: "neutral" };

    const now = new Date();
    const start = banner.start_date ? new Date(banner.start_date) : null;
    const end = banner.end_date ? new Date(banner.end_date) : null;

    if (start && start > now) return { label: "SCHEDULED", status: "warning" };
    if (end && end < now) return { label: "EXPIRED", status: "danger" };

    return { label: "ACTIVE", status: "success" };
  };

  const columns: any[] = [
    {
      key: "sort_order",
      label: "ORDER",
      render: (val: number, item: any) => (
        <input
          type="number"
          value={orders[item.id] !== undefined ? orders[item.id] : val}
          onChange={(e) => handleOrderChange(item.id, e.target.value)}
          className="w-16 rounded-lg border border-brand-500/10 bg-smoke-200 px-2 py-1 text-center text-sm font-bold text-brand-500 focus:border-ocean-500 focus:outline-none"
        />
      ),
    },
    {
      key: "image",
      label: "PREVIEW",
      render: (val: string) => (
        <div className="relative h-12 w-24 overflow-hidden rounded-lg border border-brand-500/5 bg-smoke-300">
          <Image
            src={
              typeof val === "string" && val.startsWith("http")
                ? val
                : `/api/storage/${val}`
            }
            alt="banner"
            fill
            className="object-cover"
          />
        </div>
      ),
    },
    {
      key: "title",
      label: "INFO",
      render: (val: string, item: any) => (
        <div>
          <div className="text-sm font-bold text-brand-500/90">{val}</div>
          <div className="text-[10px] text-brand-500/50">
            {item.start_date
              ? new Date(item.start_date).toLocaleDateString()
              : "Now"}{" "}
            -{" "}
            {item.end_date
              ? new Date(item.end_date).toLocaleDateString()
              : "Forever"}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "TYPE",
      render: (val: string) => (
        <span className="rounded-full bg-ocean-500/10 px-2 py-1 text-[10px] font-bold text-ocean-500 uppercase">
          {val}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "STATUS",
      render: (val: boolean, item: any) => {
        const { label, status } = getStatusLabel(item);
        return <StatusBadge status={status as any} label={label} />;
      },
    },
    {
      key: "actions",
      label: "",
      render: (_: any, item: any) => (
        <div className="flex gap-2">
          <DashboardButton
            variant="secondary"
            size="sm"
            icon={<EditRounded sx={{ fontSize: 16 }} />}
            onClick={() => handleOpenModal(item)}
          />
          <DashboardButton
            variant="secondary"
            size="sm"
            className="text-red-500 hover:bg-red-50!"
            icon={<DeleteRounded sx={{ fontSize: 16 }} />}
            onClick={() => handleDelete(item.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <PageHeader
          title="Banner Management"
          emoji="🖼️"
          description="Manage sliders, popups, and promotions on your platform."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Banners" },
          ]}
          actions={
            <div className="flex gap-3">
              {hasOrderChanges && (
                <DashboardButton
                  variant="primary"
                  className="bg-green-500 hover:bg-green-600"
                  icon={<SaveRounded />}
                  loading={savingOrder}
                  onClick={saveOrders}
                >
                  Save Order
                </DashboardButton>
              )}
              <DashboardButton
                variant="primary"
                icon={<AddRounded />}
                onClick={() => handleOpenModal()}
              >
                Add Banner
              </DashboardButton>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-500/5 bg-smoke-200 p-6 shadow-sm">
          <div className="min-w-[300px] flex-1">
            <DashboardInput
              placeholder="Search by title..."
              icon={<SearchRounded />}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div className="w-48">
            <DashboardSelect
              options={[
                { value: "", label: "All Types" },
                { value: "slider", label: "Slider" },
                { value: "popup", label: "Popup" },
                { value: "promo", label: "Promo" },
                { value: "banner", label: "Banner" },
              ]}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              icon={<FilterListRounded />}
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
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
              className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden overflow-y-auto rounded-xl bg-smoke-200 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brand-500/90">
                    {editingBanner ? "Edit Banner" : "Create New Banner"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-smoke-200 text-brand-500/40 transition-all hover:bg-brand-500/5 hover:text-brand-500/90"
                  >
                    <CloseRounded />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="mb-2 block text-xs font-bold tracking-widest text-brand-500/40 uppercase">
                      Banner Image
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex aspect-3/1 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-brand-500/10 bg-smoke-200 transition-all hover:border-ocean-500/30"
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
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-500/40 opacity-0 transition-all group-hover:opacity-100">
                            <CloudUploadRounded className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <ImageRounded
                            className="mb-2 text-brand-500/20"
                            sx={{ fontSize: 40 }}
                          />
                          <p className="text-xs font-bold text-brand-500/40">
                            Click to upload image
                          </p>
                          <p className="mt-1 text-[10px] text-brand-500/20 uppercase">
                            Recommended: 1200x400px
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

                  <div className="col-span-2">
                    <DashboardInput
                      label="Banner Title"
                      placeholder="Enter banner title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      fullWidth
                      required
                    />
                  </div>

                  <DashboardSelect
                    label="Banner Type"
                    options={[
                      { value: "slider", label: "Slider (Main)" },
                      { value: "popup", label: "Popup" },
                      { value: "promo", label: "Promo Card" },
                      { value: "banner", label: "Small Banner" },
                    ]}
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    icon={<FilterListRounded />}
                  />

                  <DashboardInput
                    label="Redirect Link (Optional)"
                    placeholder="https://..."
                    icon={<LinkRounded />}
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    fullWidth
                  />

                  <DashboardInput
                    label="Start Date (Optional)"
                    type="datetime-local"
                    icon={<CalendarTodayRounded />}
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    fullWidth
                  />

                  <DashboardInput
                    label="End Date (Optional)"
                    type="datetime-local"
                    icon={<CalendarTodayRounded />}
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    fullWidth
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

                  <DashboardSelect
                    label="Active Status"
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
                    icon={<FilterListRounded />}
                  />
                </div>

                <div className="mt-8">
                  <DashboardButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={submitting}
                  >
                    {editingBanner ? "Update Banner" : "Create Banner"}
                  </DashboardButton>
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
        title="Delete Banner"
        message="Apakah Anda yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Banner"
        loading={confirmDelete.loading}
        type="danger"
      />
    </DashboardLayout>
  );
}

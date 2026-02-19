"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  AddRounded,
  SearchRounded,
  EditRounded,
  DeleteRounded,
  ImageRounded,
  LinkRounded,
  CalendarTodayRounded,
  CloseRounded,
  CloudUploadRounded,
  SaveRounded,
  DescriptionRounded,
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
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", page: 1 });
  const [orders, setOrders] = useState<{ [key: number]: number }>({});
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, loading: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
    description: "",
    is_active: true,
    sort_order: 0,
    start_date: "",
    end_date: "",
    image: null as File | null,
  });

  useEffect(() => { fetchBanners(); }, [filters]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ENDPOINTS.admin.banners.list}?search=${filters.search}&page=${filters.page}`, undefined, true);
      if (res.success) {
        const resData = res.data as any;
        setData(resData.data);
        setPagination({ current_page: resData.current_page, last_page: resData.last_page, total: resData.total });
        const initialOrders: any = {};
        resData.data.forEach((item: any) => initialOrders[item.id] = item.sort_order);
        setOrders(initialOrders);
        setHasOrderChanges(false);
      }
    } catch (err) { toast.error("Gagal mengambil data banner"); }
    finally { setLoading(false); }
  };

  const handleOrderChange = (id: number, value: string) => {
    setOrders({ ...orders, [id]: parseInt(value) || 0 });
    setHasOrderChanges(true);
  };

  const saveOrders = async () => {
    try {
      const res = await api.post(ENDPOINTS.admin.banners.updateOrder, {
        orders: Object.entries(orders).map(([id, sort_order]) => ({ id: parseInt(id), sort_order }))
      }, true);
      if (res.success) { toast.success("Order saved!"); fetchBanners(); }
    } catch (err) { toast.error("Failed"); }
  };

  const handleOpenModal = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        link: banner.link || "",
        description: banner.description || "",
        is_active: banner.is_active,
        sort_order: banner.sort_order,
        start_date: banner.start_date ? new Date(banner.start_date).toISOString().slice(0, 16) : "",
        end_date: banner.end_date ? new Date(banner.end_date).toISOString().slice(0, 16) : "",
        image: null,
      });
      setPreviewImage(banner.image);
    } else {
      setEditingBanner(null);
      setFormData({ title: "", subtitle: "", link: "", description: "", is_active: true, sort_order: 0, start_date: "", end_date: "", image: null });
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("subtitle", formData.subtitle);
      dataToSend.append("link", formData.link);
      dataToSend.append("description", formData.description);
      dataToSend.append("is_active", formData.is_active ? "1" : "0");
      dataToSend.append("sort_order", formData.sort_order.toString());
      if (formData.start_date) dataToSend.append("start_date", formData.start_date);
      if (formData.end_date) dataToSend.append("end_date", formData.end_date);
      if (formData.image) dataToSend.append("image", formData.image);

      const res = await api.post(editingBanner ? ENDPOINTS.admin.banners.update(editingBanner.id) : ENDPOINTS.admin.banners.create, dataToSend, true);
      if (res.success) { toast.success("Saved"); setIsModalOpen(false); fetchBanners(); }
    } catch (err) { toast.error("Error"); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: "sort_order", label: "ORDER", render: (val: number, item: any) => (<input type="number" value={orders[item.id] ?? val} onChange={(e) => handleOrderChange(item.id, e.target.value)} className="w-16 rounded-lg bg-smoke-300 p-1 text-center" />) },
    { key: "image", label: "PREVIEW", render: (val: string) => (<div className="relative h-12 w-24 overflow-hidden rounded-lg bg-smoke-300"><Image src={val.startsWith("http") ? val : `/api/storage/${val}`} alt="banner" fill className="object-cover" /></div>) },
    { key: "title", label: "BANNER INFO", render: (val: string, item: any) => (<div><div className="font-bold text-brand-500">{val}</div><div className="text-[10px] text-brand-500/50">{item.subtitle || "-"}</div></div>) },
    { key: "is_active", label: "STATUS", render: (val: boolean) => <StatusBadge status={val ? "success" : "neutral"} label={val ? "ACTIVE" : "INACTIVE"} /> },
    { key: "actions", label: "", render: (_: any, item: any) => (<div className="flex gap-2"><DashboardButton variant="secondary" size="sm" icon={<EditRounded fontSize="small" />} onClick={() => handleOpenModal(item)} /><DashboardButton variant="secondary" size="sm" className="text-red-500" icon={<DeleteRounded fontSize="small" />} onClick={() => setConfirmDelete({ isOpen: true, id: item.id, loading: false })} /></div>) },
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Banner Management" emoji="🖼️" description="Manage sliders and promos" actions={<DashboardButton variant="primary" icon={<AddRounded />} onClick={() => handleOpenModal()}>Add Banner</DashboardButton>} />
      
      <div className="my-6"><DashboardInput placeholder="Search banners..." icon={<SearchRounded />} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div>

      <DataTable columns={columns} data={data} loading={loading} currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} onPageChange={(page) => setFilters({ ...filters, page })} />

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-500/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-smoke-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold">{editingBanner ? "Edit Banner" : "Create Banner"}</h3>
                
                <div onClick={() => fileInputRef.current?.click()} className="aspect-3/1 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-brand-500/10 bg-smoke-300 flex items-center justify-center relative">
                  {previewImage ? <Image src={previewImage.startsWith("data:") || previewImage.startsWith("http") ? previewImage : `/api/storage/${previewImage}`} alt="preview" fill className="object-cover" /> : <div className="text-center text-brand-500/30"><ImageRounded sx={{ fontSize: 40 }} /><p>Click to upload image</p></div>}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setFormData({ ...formData, image: file }); const reader = new FileReader(); reader.onloadend = () => setPreviewImage(reader.result as string); reader.readAsDataURL(file); } }} />

                <DashboardInput label="Judul Banner" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required fullWidth />
                <DashboardInput label="Deskripsi Singkat (Subtitle)" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} fullWidth placeholder="Contoh: Diskon up to 90%" />
                
                <div className="col-span-2">
                  <label className="mb-2 block text-xs font-bold text-brand-500/40 uppercase">Deskripsi Lengkap (Optional)</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-brand-500/10 bg-smoke-300 p-4 text-sm" rows={3} placeholder="Detail promo..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DashboardInput label="Redirect Link" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} fullWidth icon={<LinkRounded />} />
                  <DashboardInput label="Sort Order" type="number" value={formData.sort_order.toString()} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} fullWidth />
                  <DashboardInput label="Start Date" type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} fullWidth />
                  <DashboardInput label="End Date" type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} fullWidth />
                </div>

                <DashboardSelect label="Status" options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} value={formData.is_active ? "1" : "0"} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "1" })} />

                <DashboardButton type="submit" variant="primary" fullWidth loading={submitting}>Save Banner</DashboardButton>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal isOpen={confirmDelete.isOpen} onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} onConfirm={async () => { setConfirmDelete({...confirmDelete, loading: true}); try { const res = await api.delete(ENDPOINTS.admin.banners.delete(confirmDelete.id!), true); if (res.success) { fetchBanners(); setConfirmDelete({ isOpen: false, id: null, loading: false }); } } catch (e) {} }} title="Delete Banner" message="Yakin hapus?" confirmLabel="Hapus" loading={confirmDelete.loading} type="danger" />
    </DashboardLayout>
  );
}

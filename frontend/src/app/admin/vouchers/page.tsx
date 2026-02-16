"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  LocalActivityRounded,
  AddRounded,
  SearchRounded,
  FilterListRounded,
  EditRounded,
  DeleteRounded,
  ConfirmationNumberRounded,
  CategoryRounded,
  PersonRounded,
  CalendarTodayRounded,
  CloseRounded,
  MonetizationOnRounded,
  PercentRounded,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

import DataTable from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import { api, ENDPOINTS } from "@/lib/api";

export default function AdminVouchersPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    type: "",
    search: "",
    is_active: "",
    page: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "percentage",
    value: 0,
    min_transaction: 0,
    max_discount: null as number | null,
    usage_limit: null as number | null,
    user_limit: 1,
    product_id: null as number | null,
    customer_type: "all",
    is_active: true,
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        type: filters.type,
        search: filters.search,
        is_active: filters.is_active,
        page: filters.page.toString(),
      }).toString();

      const res = await api.get(
        ENDPOINTS.admin.vouchers.list + `?${query}`,
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
      }
    } catch (err) {
      toast.error("Gagal mengambil data voucher");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // We use a larger per_page to get more products for the selector
      const res = await api.get(
        "/admin/products?per_page=100",
        undefined,
        true,
      );
      if (res.success) {
        setProducts((res.data as any).data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products for selector", err);
    }
  };

  const handleOpenModal = (voucher: any = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        value: parseFloat(voucher.value),
        min_transaction: parseFloat(voucher.min_transaction),
        max_discount: voucher.max_discount
          ? parseFloat(voucher.max_discount)
          : null,
        usage_limit: voucher.usage_limit,
        user_limit: voucher.user_limit,
        product_id: voucher.product_id,
        customer_type: voucher.customer_type,
        is_active: voucher.is_active,
        start_date: voucher.start_date
          ? new Date(voucher.start_date).toISOString().slice(0, 16)
          : "",
        end_date: voucher.end_date
          ? new Date(voucher.end_date).toISOString().slice(0, 16)
          : "",
        description: voucher.description || "",
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: "",
        name: "",
        type: "percentage",
        value: 0,
        min_transaction: 0,
        max_discount: null,
        usage_limit: null,
        user_limit: 1,
        product_id: null,
        customer_type: "all",
        is_active: true,
        start_date: "",
        end_date: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let res;
      if (editingVoucher) {
        res = await api.put(
          ENDPOINTS.admin.vouchers.update(editingVoucher.id),
          formData,
          true,
        );
      } else {
        res = await api.post(ENDPOINTS.admin.vouchers.create, formData, true);
      }

      if (res.success) {
        toast.success(
          editingVoucher
            ? "Voucher berhasil diperbarui"
            : "Voucher berhasil dibuat",
        );
        setIsModalOpen(false);
        fetchVouchers();
      } else {
        toast.error(res.message || "Gagal menyimpan voucher");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus voucher ini?")) return;

    try {
      const res = await api.delete(ENDPOINTS.admin.vouchers.delete(id), true);
      if (res.success) {
        toast.success("Voucher berhasil dihapus");
        fetchVouchers();
      } else {
        toast.error(res.message || "Gagal menghapus voucher");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus voucher");
    }
  };

  const columns: any[] = [
    {
      key: "code",
      label: "CODE",
      render: (val: string) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wider text-ocean-500">
            {val}
          </span>
          <span className="line-clamp-1 text-[10px] font-bold tracking-tight text-brand-500/40 uppercase">
            {data.find((v) => v.code === val)?.name}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      label: "DISCOUNT",
      render: (_: string, item: any) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-brand-500/90">
            {item.type === "percentage"
              ? `${parseFloat(item.value)}%`
              : `Rp ${parseInt(item.value).toLocaleString()}`}
          </span>
          {item.type === "percentage" && item.max_discount && (
            <span className="text-[10px] text-brand-500/40">
              (Max Rp {parseInt(item.max_discount).toLocaleString()})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "product",
      label: "PRODUCT",
      render: (val: any) => (
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${val ? "bg-ocean-500/10 text-ocean-500" : "bg-brand-500/5 text-brand-500/40"}`}
        >
          {val ? val.name : "ALL PRODUCTS"}
        </span>
      ),
    },
    {
      key: "customer_type",
      label: "TARGET",
      render: (val: string) => (
        <span className="text-[10px] font-bold text-brand-500/60 uppercase">
          {val}
        </span>
      ),
    },
    {
      key: "usage",
      label: "USAGE",
      render: (_: any, item: any) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-smoke-200">
              <div
                className="h-full bg-ocean-500 transition-all"
                style={{
                  width: item.usage_limit
                    ? `${(item.usage_count / item.usage_limit) * 100}%`
                    : "0%",
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-brand-500/60">
              {item.usage_count} / {item.usage_limit || "∞"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "is_active",
      label: "STATUS",
      render: (val: boolean) => (
        <StatusBadge
          status={val ? "success" : "neutral"}
          label={val ? "ACTIVE" : "INACTIVE"}
        />
      ),
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
          title="Voucher Management"
          emoji="🎟️"
          description="Create and manage discount codes for your customers."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Vouchers" },
          ]}
          actions={
            <DashboardButton
              variant="primary"
              icon={<AddRounded />}
              onClick={() => handleOpenModal()}
            >
              Create Voucher
            </DashboardButton>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-500/5 bg-smoke-200 p-6 shadow-sm">
          <div className="min-w-[300px] flex-1">
            <DashboardInput
              placeholder="Search by code or name..."
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
                { value: "percentage", label: "Percentage (%)" },
                { value: "fixed", label: "Fixed (RP)" },
              ]}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              icon={<FilterListRounded />}
            />
          </div>
          <div className="w-48">
            <DashboardSelect
              options={[
                { value: "", label: "All Status" },
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
              value={filters.is_active}
              onChange={(e) =>
                setFilters({ ...filters, is_active: e.target.value })
              }
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
              className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden overflow-y-auto rounded-xl bg-smoke-200 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="p-10">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-brand-500/90">
                    {editingVoucher ? "Edit Voucher" : "Create New Voucher"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-smoke-200 text-brand-500/40 transition-all hover:bg-brand-500/5 hover:text-brand-500/90"
                  >
                    <CloseRounded />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Info Section */}
                  <div className="col-span-1 space-y-6 md:col-span-2 lg:col-span-1">
                    <DashboardInput
                      label="Voucher Code"
                      placeholder="E.g. HEMAT50"
                      icon={<ConfirmationNumberRounded />}
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      fullWidth
                      required
                    />
                    <DashboardInput
                      label="Campaign Name"
                      placeholder="E.g. Harbolnas Promo"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      fullWidth
                      required
                    />
                    <div className="space-y-2">
                      <label className="mb-2 ml-4 block text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                        Product Restriction (Optional)
                      </label>
                      <DashboardSelect
                        options={[
                          { value: "", label: "ALL PRODUCTS" },
                          ...products.map((p) => ({
                            value: p.id.toString(),
                            label: p.name,
                          })),
                        ]}
                        value={formData.product_id?.toString() || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            product_id: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        icon={<CategoryRounded />}
                      />
                    </div>
                  </div>

                  {/* Discount Section */}
                  <div className="space-y-6">
                    <DashboardSelect
                      label="Discount Type"
                      options={[
                        { value: "percentage", label: "Percentage (%)" },
                        { value: "fixed", label: "Fixed Amount (Rp)" },
                      ]}
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      icon={<PercentRounded />}
                    />
                    <DashboardInput
                      label={
                        formData.type === "percentage"
                          ? "Discount Value (%)"
                          : "Discount Value (Rp)"
                      }
                      type="number"
                      icon={
                        formData.type === "percentage" ? (
                          <PercentRounded />
                        ) : (
                          <MonetizationOnRounded />
                        )
                      }
                      value={formData.value.toString()}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: parseFloat(e.target.value) || 0,
                        })
                      }
                      fullWidth
                      required
                    />
                    <DashboardInput
                      label="Max Discount (Rp)"
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={formData.max_discount?.toString() || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_discount: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      fullWidth
                      disabled={formData.type === "fixed"}
                    />
                  </div>

                  {/* Conditions Section */}
                  <div className="space-y-6">
                    <DashboardInput
                      label="Min. Transaction (Rp)"
                      type="number"
                      value={formData.min_transaction.toString()}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_transaction: parseFloat(e.target.value) || 0,
                        })
                      }
                      fullWidth
                    />
                    <DashboardSelect
                      label="Customer Target"
                      options={[
                        { value: "all", label: "All Users" },
                        { value: "retail", label: "Retail Only" },
                        { value: "reseller", label: "Reseller Only" },
                      ]}
                      value={formData.customer_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_type: e.target.value,
                        })
                      }
                      icon={<PersonRounded />}
                    />
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
                      icon={<FilterListRounded />}
                    />
                  </div>

                  {/* Limits Section */}
                  <div className="space-y-6">
                    <DashboardInput
                      label="Total Usage Limit"
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={formData.usage_limit?.toString() || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usage_limit: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      fullWidth
                    />
                    <DashboardInput
                      label="Limit Per User"
                      type="number"
                      value={formData.user_limit.toString()}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          user_limit: parseInt(e.target.value) || 1,
                        })
                      }
                      fullWidth
                    />
                  </div>

                  {/* Schedule Section */}
                  <div className="space-y-6">
                    <DashboardInput
                      label="Start Date"
                      type="datetime-local"
                      icon={<CalendarTodayRounded />}
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      fullWidth
                    />
                    <DashboardInput
                      label="End Date"
                      type="datetime-local"
                      icon={<CalendarTodayRounded />}
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      fullWidth
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-1">
                    <label className="mb-2 ml-4 block text-[10px] font-bold tracking-widest text-brand-500/30 uppercase">
                      Description (Optional)
                    </label>
                    <textarea
                      className="h-[100px] w-full resize-none rounded-xl border-2 border-transparent bg-smoke-200 p-4 text-sm font-bold text-brand-500/90 transition-all placeholder:text-brand-500/20 focus:border-ocean-500/50 focus:outline-hidden"
                      placeholder="Voucher terms and conditions..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <DashboardButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={submitting}
                    size="lg"
                  >
                    {editingVoucher ? "Update Voucher" : "Create Voucher"}
                  </DashboardButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

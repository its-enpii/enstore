"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowBackRounded,
  SaveRounded,
  AddRounded,
  EditRounded,
  DeleteRounded,
  ImageRounded,
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import { api, ENDPOINTS } from "@/lib/api";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// --- Types ---

interface ProductItem {
  id: number;
  product_id?: number;
  name: string;
  digiflazz_code: string;
  base_price: number;
  retail_price: number;
  reseller_price: number;
  stock_status: string;
  is_active: boolean;
  total_sold?: number;
}

interface InputField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string;
}

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  brand: string;
  provider: string; // Added
  type: string;
  category_id: string;
  description: string;
  payment_type: string;
  is_active: number | boolean;
  is_featured: number | boolean;
  sort_order: number;
  rating: number; // Added
  image: string;
  icon: string; // Added
  input_fields: InputField[] | string; // Could be JSON string or array
  server_options: string[] | string; // Could be JSON string or array
  items: ProductItem[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);

  // Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ProductItem>>({});
  const [savingItem, setSavingItem] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    loading: boolean;
  }>({
    isOpen: false,
    id: null,
    loading: false,
  });

  // Form State (Product)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    brand: "",
    provider: "",
    type: "game",
    category_id: "",
    description: "",
    payment_type: "prepaid",
    is_active: true,
    is_featured: false,
    sort_order: 0,
    rating: 0,
  });

  // Dynamic Fields
  const [inputFields, setInputFields] = useState<InputField[]>([]);
  const [serverOptions, setServerOptions] = useState<string[]>([]);
  const [serverInput, setServerInput] = useState("");

  // Files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Fetch Product & Categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get<ProductDetail>(
          ENDPOINTS.admin.products.detail(productId),
          undefined,
          true,
        ),
        api.get<Category[]>(ENDPOINTS.products.categories),
      ]);

      if (catRes.success) setCategories(catRes.data);

      if (prodRes.success) {
        const prod = prodRes.data;
        setProductData(prod);
        setItems(prod.items || []);

        // Populate Form
        setFormData({
          name: prod.name,
          slug: prod.slug,
          brand: prod.brand,
          provider: prod.provider || "",
          type: prod.type,
          category_id: prod.category_id,
          description: prod.description || "",
          payment_type: prod.payment_type,
          is_active: Boolean(prod.is_active),
          is_featured: Boolean(prod.is_featured),
          sort_order: prod.sort_order || 0,
          rating: prod.rating || 0,
        });

        if (prod.image) setImagePreview(prod.image);
        if (prod.icon) setIconPreview(prod.icon);

        // Parse Dynamic Fields
        if (prod.input_fields) {
          try {
            setInputFields(
              typeof prod.input_fields === "string"
                ? JSON.parse(prod.input_fields)
                : prod.input_fields,
            );
          } catch (e) {
            console.error("Error parsing input_fields", e);
            setInputFields([]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Product Form Handlers
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "icon",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "image") {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setIconFile(file);
        setIconPreview(URL.createObjectURL(file));
      }
    }
  };

  // Dynamic Fields Handlers
  const addInputField = () =>
    setInputFields([
      ...inputFields,
      { name: "", label: "", type: "text", required: true, options: "" },
    ]);
  const removeInputField = (idx: number) =>
    setInputFields(inputFields.filter((_, i) => i !== idx));
  const updateInputField = (
    idx: number,
    field: keyof InputField,
    value: any,
  ) => {
    const newFields = [...inputFields];
    newFields[idx] = { ...newFields[idx], [field]: value };
    setInputFields(newFields);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("_method", "PUT");

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
    });

    if (imageFile) data.append("image", imageFile);
    if (iconFile) data.append("icon", iconFile);

    // Arrays
    inputFields.forEach((field, index) => {
      data.append(`input_fields[${index}][name]`, field.name);
      data.append(`input_fields[${index}][label]`, field.label);
      data.append(`input_fields[${index}][type]`, field.type);
      data.append(
        `input_fields[${index}][required]`,
        field.required ? "1" : "0",
      );
      if (field.type === "select" && field.options) {
        data.append(`input_fields[${index}][options]`, field.options);
      }
    });

    try {
      const res = await api.post(
        ENDPOINTS.admin.products.update(productId),
        data,
        true,
      );
      if (res.success) {
        toast.success("Produk berhasil diperbarui!");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal update produk");
    } finally {
      setSaving(false);
    }
  };

  // Item Management Handlers (Kept same)
  const openItemModal = (item?: ProductItem) => {
    if (item) {
      setCurrentItem(item);
    } else {
      setCurrentItem({
        name: "",
        digiflazz_code: "",
        base_price: 0,
        retail_price: 0,
        reseller_price: 0,
        stock_status: "available",
        is_active: true,
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);

    try {
      const payload = { ...currentItem, product_id: parseInt(productId) };
      let res;
      if (currentItem.id) {
        res = await api.put(
          ENDPOINTS.admin.productItems.update(currentItem.id),
          payload,
          true,
        );
      } else {
        res = await api.post(
          ENDPOINTS.admin.productItems.create(productId),
          payload,
          true,
        );
      }

      if (res.success) {
        toast.success(
          `Item berhasil ${currentItem.id ? "diupdate" : "dibuat"}!`,
        );
        setIsItemModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan item");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = (itemId: number) => {
    setConfirmDelete({ isOpen: true, id: itemId, loading: false });
  };

  const processDeleteItem = async () => {
    if (!confirmDelete.id) return;
    setConfirmDelete((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.delete(
        ENDPOINTS.admin.productItems.delete(confirmDelete.id),
        true,
      );
      if (res.success) {
        toast.success("Item dihapus");
        fetchData();
        setConfirmDelete({ isOpen: false, id: null, loading: false });
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal hapus item");
    } finally {
      setConfirmDelete((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-xl p-2 text-brand-500/40 transition-colors hover:bg-white hover:text-brand-500"
            >
              <ArrowBackRounded />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-brand-500">
                Edit Product
              </h1>
              <p className="font-bold text-brand-500/50">{productData?.name}</p>
            </div>
          </div>

          {/* Product Actions */}
          <div className="flex gap-2">
            <DashboardButton
              onClick={handleUpdateProduct}
              icon={<SaveRounded />}
              loading={saving}
              disabled={saving}
            >
              Save Changes
            </DashboardButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Product Form */}
          <div className="space-y-8 lg:col-span-2">
            <form
              id="product-form"
              onSubmit={handleUpdateProduct}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="space-y-6 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
                <h3 className="border-b border-brand-500/5 pb-4 text-lg font-bold text-brand-500">
                  Product Details
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-500/50 uppercase">
                      Details
                    </label>
                    <Input
                      fullWidth
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                    />
                    <Input
                      fullWidth
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Brand"
                    />
                    <Input
                      fullWidth
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="Slug"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-500/50 uppercase">
                      Configuration
                    </label>
                    <div className="relative">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="mb-3 w-full appearance-none rounded-xl border border-brand-500/5 bg-white px-4 py-3 text-brand-500 outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mb-3 w-full appearance-none rounded-xl border border-brand-500/5 bg-white px-4 py-3 text-brand-500 outline-none"
                      >
                        <option value="game">Game</option>
                        <option value="pulsa">Pulsa</option>
                        <option value="data">Data</option>
                        <option value="voucher">Voucher</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Input
                      fullWidth
                      name="provider"
                      value={formData.provider}
                      onChange={handleChange}
                      placeholder="Provider (e.g. Digiflazz)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-500/50 uppercase">
                    Description
                  </label>
                  <Textarea
                    fullWidth
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-brand-500/50 uppercase">
                      Rating
                    </label>
                    <Input
                      fullWidth
                      type="number"
                      step="0.1"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-2 flex items-end gap-6 pb-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleCheckbox}
                        className="h-5 w-5 rounded text-ocean-500"
                      />
                      <span className="font-medium text-brand-500">Active</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleCheckbox}
                        className="h-5 w-5 rounded text-ocean-500"
                      />
                      <span className="font-medium text-brand-500">
                        Featured
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-6 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
                <div className="space-y-8">
                  {/* Input Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-500/5 pb-2">
                      <label className="text-xs font-bold text-brand-500/50 uppercase">
                        User Input Fields
                      </label>
                      <button
                        type="button"
                        onClick={addInputField}
                        className="text-xs font-bold tracking-widest text-ocean-500 uppercase hover:underline"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {inputFields.map((field, idx) => (
                        <div
                          key={idx}
                          className="space-y-2 rounded-xl border border-brand-500/5 bg-white p-3"
                        >
                          <div className="flex gap-2">
                            <input
                              className="w-full bg-transparent text-xs font-medium outline-none"
                              placeholder="Name (user_id)"
                              value={field.name}
                              onChange={(e) =>
                                updateInputField(idx, "name", e.target.value)
                              }
                            />
                            <input
                              className="w-full bg-transparent text-xs font-medium outline-none"
                              placeholder="Label"
                              value={field.label}
                              onChange={(e) =>
                                updateInputField(idx, "label", e.target.value)
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={field.type}
                              onChange={(e) =>
                                updateInputField(idx, "type", e.target.value)
                              }
                              className="rounded bg-smoke-200 px-1 py-0.5 text-xs outline-none"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="email">Email</option>
                              <option value="select">Dropdown</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  updateInputField(
                                    idx,
                                    "required",
                                    e.target.checked,
                                  )
                                }
                              />{" "}
                              Req
                            </label>
                            <button
                              type="button"
                              onClick={() => removeInputField(idx)}
                              className="ml-auto text-red-500"
                            >
                              <DeleteRounded style={{ fontSize: 14 }} />
                            </button>
                          </div>
                          {field.type === "select" && (
                            <div className="mt-1">
                              <input
                                className="w-full rounded border border-yellow-500/20 bg-yellow-50 px-2 py-1 font-mono text-xs text-yellow-700 outline-none placeholder:text-yellow-700/40"
                                placeholder="Options (comma separated)"
                                value={field.options || ""}
                                onChange={(e) =>
                                  updateInputField(
                                    idx,
                                    "options",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-6 rounded-[32px] border border-brand-500/5 bg-smoke-200 p-8 shadow-sm">
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
                        />
                      ) : (
                        <ImageRounded />
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-brand-500/50 uppercase">
                        Cover Image
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleImageChange(e, "image")}
                        className="w-full cursor-pointer text-xs text-brand-500 file:mr-2 file:rounded-full file:border-0 file:bg-ocean-500/10 file:px-3 file:py-1 file:text-ocean-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-500/10 bg-white">
                      {iconPreview ? (
                        <img
                          src={iconPreview}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageRounded />
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-brand-500/50 uppercase">
                        Icon Logo
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleImageChange(e, "icon")}
                        className="w-full cursor-pointer text-xs text-brand-500 file:mr-2 file:rounded-full file:border-0 file:bg-ocean-500/10 file:px-3 file:py-1 file:text-ocean-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Items List */}
            <div className="overflow-hidden rounded-[32px] border border-brand-500/5 bg-smoke-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-brand-500/5 p-6">
                <h3 className="text-lg font-bold text-brand-500">
                  Product Items (SKUs)
                </h3>
                <DashboardButton
                  size="sm"
                  icon={<AddRounded />}
                  onClick={() => openItemModal()}
                >
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
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-white"
                        >
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
                            Rp{" "}
                            {(item.retail_price ?? 0).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-emerald-500">
                            Rp{" "}
                            {(item.reseller_price ?? 0).toLocaleString("id-ID")}
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
                                onClick={() => openItemModal(item)}
                                className="rounded p-1.5 text-ocean-500 hover:bg-ocean-500/10"
                              >
                                <EditRounded fontSize="small" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
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
          </div>

          {/* Right Column: Stats / Info */}
          <div className="space-y-6">
            <div className="space-y-4 rounded-[32px] bg-ocean-500 p-8 text-smoke-200">
              <h3 className="text-xl font-bold">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black">{items.length}</div>
                  <div className="text-xs font-bold uppercase opacity-60">
                    Items
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black">
                    {items.filter((i) => i.is_active).length}
                  </div>
                  <div className="text-xs font-bold uppercase opacity-60">
                    Active
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed font-bold opacity-60">
                Make sure to update reseller prices regularly based on base
                price changes to maintain profit margins.
              </p>
            </div>
          </div>
        </div>

        {/* Item Modal */}
        <Modal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          title={currentItem.id ? "Edit SKU Item" : "Add New SKU Item"}
          width="lg"
        >
          <form onSubmit={handleSaveItem} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-500/50 uppercase">
                  Item Name
                </label>
                <Input
                  fullWidth
                  name="itemName"
                  value={currentItem.name || ""}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. 5 Diamonds"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-500/50 uppercase">
                  SKU Code (Unique)
                </label>
                <Input
                  fullWidth
                  name="itemSku"
                  value={currentItem.digiflazz_code || ""}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      digiflazz_code: e.target.value,
                    }))
                  }
                  placeholder="e.g. ML-5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-500/50 uppercase">
                  Base Price (Modal)
                </label>
                <Input
                  fullWidth
                  name="basePrice"
                  type="number"
                  value={currentItem.base_price || 0}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      base_price: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-500/50 uppercase">
                  Retail Price
                </label>
                <Input
                  fullWidth
                  name="retailPrice"
                  type="number"
                  value={currentItem.retail_price || 0}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      retail_price: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-500/50 uppercase">
                  Reseller Price
                </label>
                <Input
                  fullWidth
                  name="resellerPrice"
                  type="number"
                  value={currentItem.reseller_price || 0}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      reseller_price: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentItem.is_active ?? true}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded text-ocean-500"
                />
                <span className="font-bold text-brand-500">Active</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-500/50 uppercase">
                  Stock:
                </span>
                <select
                  value={currentItem.stock_status || "available"}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      stock_status: e.target.value,
                    }))
                  }
                  className="rounded border border-brand-500/10 bg-white px-2 py-1 text-sm font-bold text-brand-500"
                >
                  <option value="available">Available</option>
                  <option value="empty">Empty</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-brand-500/5 pt-6">
              <DashboardButton
                variant="secondary"
                type="button"
                onClick={() => setIsItemModalOpen(false)}
              >
                Cancel
              </DashboardButton>
              <DashboardButton
                type="submit"
                loading={savingItem}
                disabled={savingItem}
              >
                Save Item
              </DashboardButton>
            </div>
          </form>
        </Modal>
      </div>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={processDeleteItem}
        title="Delete Item"
        message="Hapus item ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Item"
        loading={confirmDelete.loading}
        type="danger"
      />
    </DashboardLayout>
  );
}

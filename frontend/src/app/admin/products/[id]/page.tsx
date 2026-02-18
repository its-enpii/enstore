"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowBackRounded, SaveRounded } from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import DashboardTextarea from "@/components/dashboard/DashboardTextarea";
import { api, ENDPOINTS } from "@/lib/api";
import {
  Product,
  ProductItem,
  ProductCategory as Category,
  InputField,
} from "@/lib/api/types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// Sub-components
import ProductItemModal from "../components/ProductItemModal";
import ProductItemList from "../components/ProductItemList";
import ProductDynamicFields from "../components/ProductDynamicFields";
import ProductVisualAssets from "../components/ProductVisualAssets";

// --- Types ---
// Local interfaces removed in favor of @/lib/api/types

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);
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
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    slug: "",
    brand: "",
    publisher: "",
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
        api.get<Product>(
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
          name: prod.name || "",
          slug: prod.slug || "",
          brand: prod.brand || "",
          publisher: prod.publisher || "",
          provider: prod.provider || "",
          type: prod.type || "game",
          category_id: prod.category_id || "",
          description: prod.description || "",
          payment_type: prod.payment_type || "prepaid",
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
      // Don't append null/undefined as strings "null"/"undefined"
      // Also skip complex objects like input_fields, handle them separately if needed,
      // but here we already have inputFields state
      if (value !== null && value !== undefined && typeof value !== "object") {
        data.append(key, String(value));
      }
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
              <p className="font-bold text-brand-500/50">
                {productData?.name || "Loading..."}
              </p>
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
                  <DashboardInput
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="Name"
                  />
                  <DashboardInput
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={formData.brand || ""}
                    onChange={handleChange}
                    placeholder="e.g. Mobile Legends"
                  />
                  <DashboardInput
                    fullWidth
                    label="Publisher"
                    name="publisher"
                    value={formData.publisher || ""}
                    onChange={handleChange}
                    placeholder="e.g. Moonton (Optional)"
                  />
                  <DashboardInput
                    fullWidth
                    label="Slug"
                    name="slug"
                    value={formData.slug || ""}
                    onChange={handleChange}
                    placeholder="Slug"
                  />
                  <DashboardSelect
                    label="Category"
                    name="category_id"
                    value={formData.category_id || ""}
                    onChange={handleChange}
                    options={categories.map((cat) => ({
                      value: String(cat.id),
                      label: cat.name,
                    }))}
                    placeholder="Select Category"
                    required
                    fullWidth
                  />
                  <DashboardSelect
                    label="Type"
                    name="type"
                    value={formData.type || "game"}
                    onChange={handleChange}
                    options={[
                      { value: "game", label: "Game" },
                      { value: "pulsa", label: "Pulsa" },
                      { value: "data", label: "Data" },
                      { value: "voucher", label: "Voucher" },
                      { value: "other", label: "Other" },
                    ]}
                    fullWidth
                  />
                  <DashboardInput
                    fullWidth
                    label="Provider"
                    name="provider"
                    value={formData.provider || ""}
                    onChange={handleChange}
                    placeholder="Provider (e.g. Digiflazz)"
                  />
                </div>

                <DashboardTextarea
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={3}
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <DashboardInput
                      fullWidth
                      label="Rating"
                      type="number"
                      step="0.1"
                      name="rating"
                      value={formData.rating || 0}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-2 flex items-end gap-6 pb-2">
                    <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2.5 transition-colors hover:border-ocean-500/30">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleCheckbox}
                        className="h-5 w-5 rounded text-ocean-500"
                      />
                      <span className="text-sm font-medium text-brand-500/60">
                        Active Status
                      </span>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2.5 transition-colors hover:border-ocean-500/30">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleCheckbox}
                        className="h-5 w-5 rounded text-ocean-500"
                      />
                      <span className="text-sm font-medium text-brand-500/60">
                        Featured
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <ProductDynamicFields
                inputFields={inputFields}
                onAdd={addInputField}
                onRemove={removeInputField}
                onUpdate={updateInputField}
              />

              <ProductVisualAssets
                imagePreview={imagePreview}
                iconPreview={iconPreview}
                handleImageChange={handleImageChange}
              />
            </form>

            <ProductItemList
              items={items}
              onEdit={openItemModal}
              onDelete={handleDeleteItem}
              onAdd={() => openItemModal()}
            />
          </div>

          {/* Right Column: Stats / Info */}
          <div className="space-y-6">
            <div className="space-y-4 rounded-[32px] bg-ocean-500 p-8 text-smoke-200">
              <h3 className="text-xl font-bold">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {(items?.length || 0).toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs font-bold uppercase opacity-60">
                    Items
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {(items || [])
                      .filter((i) => i.is_active)
                      .length.toLocaleString("id-ID")}
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
        <ProductItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          onSave={handleSaveItem}
          loading={savingItem}
        />
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

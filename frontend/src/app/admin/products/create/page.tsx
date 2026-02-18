"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowBackRounded, SaveRounded } from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import DashboardTextarea from "@/components/dashboard/DashboardTextarea";
import { api, ENDPOINTS } from "@/lib/api";
import { ProductCategory as Category, InputField } from "@/lib/api/types";

// Sub-components
import ProductDynamicFields from "../components/ProductDynamicFields";
import ProductVisualAssets from "../components/ProductVisualAssets";

// --- Types ---
// Local interfaces removed in favor of @/lib/api/types

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form State
  const [formData, setFormData] = useState({
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

  // Dynamic Fields State
  const [inputFields, setInputFields] = useState<InputField[]>([
    { name: "user_id", label: "User ID", type: "text", required: true },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Category[]>(ENDPOINTS.products.categories);
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

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

  // Image Handlers
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

  // Input Fields Handlers
  const addInputField = () => {
    setInputFields([
      ...inputFields,
      { name: "", label: "", type: "text", required: true, options: "" },
    ]);
  };

  const removeInputField = (index: number) => {
    setInputFields(inputFields.filter((_, i) => i !== index));
  };

  const updateInputField = (
    index: number,
    field: keyof InputField,
    value: any,
  ) => {
    const newFields = [...inputFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setInputFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    // Basic Fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
    });

    // Files
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
      const res = await api.post(ENDPOINTS.admin.products.create, data, true);
      if (res.success) {
        toast.success("Produk berhasil dibuat!");
        router.push("/admin/products");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-xl p-2 text-brand-500/40 transition-colors hover:bg-smoke-200 hover:text-brand-500/90"
          >
            <ArrowBackRounded />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-500/90">
              Add New Product
            </h1>
            <p className="mt-2 text-sm text-brand-500/40">
              Create a new game service or voucher product.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-xl border border-brand-500/5 bg-smoke-200 p-8 shadow-sm"
        >
          {/* General Info */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="border-b border-brand-500/5 pb-4 text-lg font-bold text-brand-500/90">
                General Information
              </h3>

              <div className="space-y-4">
                <DashboardInput
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Mobile Legends"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <DashboardInput
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g. Mobile Legends"
                    required
                  />
                  <DashboardInput
                    fullWidth
                    label="Publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="e.g. Moonton (Optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DashboardInput
                    fullWidth
                    label="Provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    placeholder="e.g. Digiflazz"
                  />
                  <DashboardInput
                    fullWidth
                    label="Slug (URL)"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="auto-generated-if-empty"
                  />
                </div>

                <DashboardTextarea
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Product description..."
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="border-b border-brand-500/5 pb-4 text-lg font-bold text-brand-500/90">
                Configuration
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DashboardSelect
                    label="Category"
                    name="category_id"
                    value={formData.category_id}
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
                    value={formData.type}
                    onChange={handleChange}
                    options={[
                      { value: "game", label: "Game Topup" },
                      { value: "pulsa", label: "Pulsa" },
                      { value: "data", label: "Data Package" },
                      { value: "voucher", label: "Voucher" },
                      { value: "pln", label: "PLN Token" },
                      { value: "other", label: "Other" },
                    ]}
                    fullWidth
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DashboardSelect
                    label="Payment Type"
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleChange}
                    options={[
                      { value: "prepaid", label: "Prepaid (Instant)" },
                      { value: "postpaid", label: "Postpaid (Bill)" },
                    ]}
                    fullWidth
                  />
                  <DashboardInput
                    fullWidth
                    label="Sort Order"
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                  />
                </div>

                <DashboardInput
                  fullWidth
                  label="Rating (0-5)"
                  type="number"
                  step="0.1"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                />

                <div className="flex gap-4 pt-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2.5 transition-colors hover:border-ocean-500/30">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleCheckbox}
                      className="h-5 w-5 rounded text-ocean-500 focus:ring-ocean-500"
                    />
                    <span className="text-sm font-medium text-brand-500/60">
                      Active
                    </span>
                  </label>

                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2.5 transition-colors hover:border-ocean-500/30">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleCheckbox}
                      className="h-5 w-5 rounded text-ocean-500 focus:ring-ocean-500"
                    />
                    <span className="text-sm font-medium text-brand-500/60">
                      Featured
                    </span>
                  </label>
                </div>
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

          <div className="flex justify-end gap-3 border-t border-brand-500/5 pt-4">
            <DashboardButton
              variant="secondary"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </DashboardButton>
            <DashboardButton
              type="submit"
              icon={<SaveRounded />}
              loading={loading}
              disabled={loading}
            >
              Create Product
            </DashboardButton>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

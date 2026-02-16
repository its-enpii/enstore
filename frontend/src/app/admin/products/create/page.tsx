"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  ArrowBackRounded, 
  SaveRounded, 
  ImageRounded,
  AddRounded,
  DeleteRounded,
  DragIndicatorRounded
} from "@mui/icons-material";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardButton from "@/components/dashboard/DashboardButton";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { api, ENDPOINTS } from "@/lib/api";

// --- Types ---
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface InputField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form State
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

  // Dynamic Fields State
  const [inputFields, setInputFields] = useState<InputField[]>([
     { name: "user_id", label: "User ID", type: "text", required: true }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, checked } = e.target;
     setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Image Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'icon') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'image') {
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
     setInputFields([...inputFields, { name: "", label: "", type: "text", required: true, options: "" }]);
  };

  const removeInputField = (index: number) => {
     setInputFields(inputFields.filter((_, i) => i !== index));
  };

  const updateInputField = (index: number, field: keyof InputField, value: any) => {
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
       data.append(`input_fields[${index}][required]`, field.required ? '1' : '0');
       if (field.type === 'select' && field.options) {
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
       <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="p-2 rounded-xl text-brand-500/40 hover:bg-smoke-200 hover:text-brand-500/90 transition-colors">
                <ArrowBackRounded />
             </button>
             <div>
                <h1 className="text-2xl font-bold text-brand-500/90">Add New Product</h1>
                <p className="text-brand-500/50 font-bold">Create a new game service or voucher product.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-smoke-200 p-8 rounded-xl border border-brand-500/5 shadow-sm space-y-8">
             
             {/* General Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-brand-500/90 border-b border-brand-500/5 pb-4">General Information</h3>
                    
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Product Name</label>
                          <Input fullWidth name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Mobile Legends" required />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Brand</label>
                             <Input fullWidth name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Moonton" required />
                          </div>
                          <div>
                             <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Provider</label>
                             <Input fullWidth name="provider" value={formData.provider} onChange={handleChange} placeholder="e.g. Digiflazz" />
                          </div>
                       </div>

                       <div>
                          <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Slug (URL)</label>
                          <Input fullWidth name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated-if-empty" />
                       </div>

                       <div>
                          <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Description</label>
                          <Textarea fullWidth name="description" value={formData.description} onChange={handleChange} placeholder="Product description..." rows={4} />
                       </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-brand-500/90 border-b border-brand-500/5 pb-4">Configuration</h3>
                    
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Category</label>
                              <div className="relative">
                                 <select 
                                   name="category_id" 
                                   value={formData.category_id} 
                                   onChange={handleChange}
                                   className="w-full px-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 font-bold text-brand-500/90 outline-none appearance-none"
                                   required
                                 >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                 </select>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Type</label>
                              <div className="relative">
                                 <select 
                                   name="type" 
                                   value={formData.type} 
                                   onChange={handleChange}
                                   className="w-full px-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 font-bold text-brand-500/90 outline-none appearance-none"
                                 >
                                    <option value="game">Game Topup</option>
                                    <option value="pulsa">Pulsa</option>
                                    <option value="data">Data Package</option>
                                    <option value="voucher">Voucher</option>
                                    <option value="pln">PLN Token</option>
                                    <option value="other">Other</option>
                                 </select>
                              </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Payment Type</label>
                              <div className="relative">
                                 <select 
                                   name="payment_type" 
                                   value={formData.payment_type} 
                                   onChange={handleChange}
                                   className="w-full px-4 py-3 bg-smoke-200 rounded-xl border border-brand-500/5 font-bold text-brand-500/90 outline-none appearance-none"
                                 >
                                    <option value="prepaid">Prepaid (Instant)</option>
                                    <option value="postpaid">Postpaid (Bill)</option>
                                 </select>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Sort Order</label>
                              <Input fullWidth type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} />
                          </div>
                       </div>

                       <div>
                          <label className="text-xs font-bold uppercase text-brand-500/50 block mb-2">Rating (0-5)</label>
                          <Input fullWidth type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange} />
                       </div>

                       <div className="flex gap-4 pt-2">
                           <label className="flex items-center gap-2 cursor-pointer p-3 bg-smoke-200 rounded-xl border border-brand-500/5 flex-1 hover:border-ocean-500/30 transition-colors">
                               <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleCheckbox} className="w-5 h-5 rounded text-ocean-500 focus:ring-ocean-500" />
                               <span className="font-bold text-brand-500/90 text-sm">Active</span>
                           </label>
                           
                           <label className="flex items-center gap-2 cursor-pointer p-3 bg-smoke-200 rounded-xl border border-brand-500/5 flex-1 hover:border-ocean-500/30 transition-colors">
                               <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleCheckbox} className="w-5 h-5 rounded text-ocean-500 focus:ring-ocean-500" />
                               <span className="font-bold text-brand-500/90 text-sm">Featured</span>
                           </label>
                       </div>
                    </div>
                </div>
             </div>

             <div className="space-y-6">
                {/* Dynamic Input Fields */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-brand-500/5 pb-4">
                      <h3 className="text-lg font-bold text-brand-500/90">Input Fields</h3>
                      <button type="button" onClick={addInputField} className="text-xs font-bold text-ocean-500 hover:bg-ocean-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                          <AddRounded fontSize="small" /> Add Field
                      </button>
                   </div>
                   
                   <div className="space-y-3">
                      {inputFields.map((field, idx) => (
                         <div key={idx} className="bg-smoke-200 p-4 rounded-xl border border-brand-500/5 space-y-3 relative group">
                             <div className="flex gap-3">
                                 <div className="flex-1">
                                    <input 
                                       type="text" 
                                       placeholder="Name (e.g. server_id)" 
                                       value={field.name}
                                       onChange={(e) => updateInputField(idx, 'name', e.target.value)}
                                       className="w-full px-3 py-2 bg-smoke-200 rounded-lg text-sm font-bold text-brand-500/90 outline-none border border-transparent focus:border-ocean-500/20"
                                    />
                                 </div>
                                 <div className="flex-1">
                                    <input 
                                       type="text" 
                                       placeholder="Label (e.g. Server)" 
                                       value={field.label}
                                       onChange={(e) => updateInputField(idx, 'label', e.target.value)}
                                       className="w-full px-3 py-2 bg-smoke-200 rounded-lg text-sm font-bold text-brand-500/90 outline-none border border-transparent focus:border-ocean-500/20"
                                    />
                                 </div>
                             </div>
                             <div className="flex gap-3 items-center">
                                 <select 
                                    value={field.type}
                                    onChange={(e) => updateInputField(idx, 'type', e.target.value)}
                                    className="px-3 py-2 bg-smoke-200 rounded-lg text-sm font-bold text-brand-500/90 outline-none flex-1"
                                 >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="email">Email</option>
                                    <option value="select">Dropdown (Select)</option>
                                 </select>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                     <input type="checkbox" checked={field.required} onChange={(e) => updateInputField(idx, 'required', e.target.checked)} className="rounded text-ocean-500" />
                                     <span className="text-xs font-bold text-brand-500/60">Required</span>
                                 </label>
                                 <button type="button" onClick={() => removeInputField(idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                     <DeleteRounded fontSize="small" />
                                 </button>
                             </div>
                             {field.type === 'select' && (
                                <div className="pt-2 border-t border-brand-500/5">
                                   <input 
                                     type="text" 
                                     placeholder="Options (comma separated, e.g. Asia,Europe,America)" 
                                     value={field.options || ''}
                                     onChange={(e) => updateInputField(idx, 'options', e.target.value)}
                                     className="w-full px-3 py-2 bg-yellow-50 rounded-lg text-sm font-bold text-yellow-700 outline-none border border-yellow-500/20 placeholder:text-yellow-700/40"
                                   />
                                </div>
                             )}
                         </div>
                      ))}
                      {inputFields.length === 0 && (
                         <p className="text-center text-xs text-brand-500/40 font-bold py-4">No input fields defined.</p>
                      )}
                   </div>
                </div>


             </div>

             {/* Images */}
             <div className="space-y-6 pt-4 border-t border-brand-500/5">
                <h3 className="text-lg font-bold text-brand-500/90">Visual Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Main Image */}
                   <div className="space-y-4">
                      <label className="text-xs font-bold uppercase text-brand-500/50">Cover Image</label>
                      <div className="flex items-center gap-4">
                         <div className="w-24 h-24 bg-smoke-200 rounded-xl overflow-hidden border border-brand-500/10 flex items-center justify-center">
                            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageRounded className="text-brand-500/20" />}
                         </div>
                         <div className="flex-1">
                            <input type="file" onChange={(e) => handleImageChange(e, 'image')} accept="image/*" className="text-sm text-brand-500/90 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ocean-500/10 file:text-ocean-500 hover:file:bg-ocean-500/20 cursor-pointer w-full" />
                         </div>
                      </div>
                   </div>

                   {/* Icon */}
                   <div className="space-y-4">
                      <label className="text-xs font-bold uppercase text-brand-500/50">Icon / Logo</label>
                      <div className="flex items-center gap-4">
                         <div className="w-24 h-24 bg-smoke-200 rounded-xl overflow-hidden border border-brand-500/10 flex items-center justify-center">
                            {iconPreview ? <img src={iconPreview} className="w-full h-full object-cover" /> : <ImageRounded className="text-brand-500/20" />}
                         </div>
                         <div className="flex-1">
                            <input type="file" onChange={(e) => handleImageChange(e, 'icon')} accept="image/*" className="text-sm text-brand-500/90 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ocean-500/10 file:text-ocean-500 hover:file:bg-ocean-500/20 cursor-pointer w-full" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-brand-500/5">
                <DashboardButton variant="secondary" type="button" onClick={() => router.back()}>Cancel</DashboardButton>
                <DashboardButton type="submit" icon={<SaveRounded />} loading={loading} disabled={loading}>Create Product</DashboardButton>
             </div>
          </form>
       </div>
    </DashboardLayout>
  );
}

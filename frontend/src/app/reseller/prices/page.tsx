"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import DashboardInput from "@/components/dashboard/DashboardInput";
import DashboardSelect from "@/components/dashboard/DashboardSelect";
import DashboardButton from "@/components/dashboard/DashboardButton";
import { 
  SearchRounded, 
  TrendingDownRounded,
  FilterListRounded,
  GamepadRounded,
  InfoOutlined
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { getProducts, getCategories, type Product, type ProductCategory } from '@/lib/api';
import Link from 'next/link';

export default function ResellerPriceListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ per_page: 100 }), 
          getCategories()
        ]);
        
        if (prodRes.success) setProducts(prodRes.data.products);
        if (catRes.success) setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch price list:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category?.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout role="reseller">
      <div className="space-y-8">
        <PageHeader
          title="Price List"
          emoji="🏷️"
          description="Your exclusive VIP reseller pricing across all products."
          breadcrumbs={[
            { label: "Dashboard", href: "/reseller/dashboard" },
            { label: "Price List" },
          ]}
          actions={
            <div className="bg-ocean-500/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <TrendingDownRounded className="text-ocean-500" fontSize="small" />
              <span className="text-xs font-black text-ocean-500 uppercase tracking-widest">VIP Discount Active</span>
            </div>
          }
        />

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 lg:col-span-8">
            <DashboardInput 
              placeholder="Search products or brands..." 
              icon={<SearchRounded />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          </div>
          <div className="md:col-span-6 lg:col-span-4">
              <DashboardSelect 
                  icon={<FilterListRounded />}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  fullWidth
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...categories.map(cat => ({ value: cat.slug, label: cat.name }))
                  ]}
              />
          </div>
        </div>

        {/* Price Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-48 bg-smoke-200 dark:bg-brand-800 animate-pulse rounded-[28px]" />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-smoke-200 dark:bg-brand-800 rounded-[28px] p-6 border border-brand-500/5 hover:border-ocean-500/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-cloud-200 dark:bg-brand-700/30 rounded-2xl flex items-center justify-center group-hover:bg-ocean-500/10 transition-colors shrink-0 border border-brand-500/5">
                          {product.image ? (
                              <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                          ) : (
                              <GamepadRounded className="text-brand-500/20 group-hover:text-ocean-500 transition-colors" />
                          )}
                      </div>
                      <div>
                          <h3 className="font-black text-brand-500 dark:text-smoke-200 leading-tight">{product.name}</h3>
                          <span className="text-[10px] font-bold text-brand-500/30 uppercase tracking-widest">{product.brand || 'Game'}</span>
                      </div>
                  </div>
                  {product.is_featured && (
                      <span className="bg-ocean-500/10 text-ocean-500 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Hot</span>
                  )}
                </div>

                <div className="space-y-2">
                  {product.items?.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-cloud-200/60 dark:bg-brand-700/20 border border-transparent hover:border-brand-500/5 transition-all">
                      <span className="text-xs font-bold text-brand-500/60 dark:text-smoke-300">{item.name}</span>
                      <span className="text-sm font-black text-ocean-500">
                          Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                      </span>
                    </div>
                  ))}
                  {product.items && product.items.length > 3 && (
                      <div className="text-center pt-2">
                          <span className="text-[10px] font-bold text-brand-500/20 uppercase tracking-widest">
                              + {product.items.length - 3} More Variants
                          </span>
                      </div>
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <Link href={`/services/${product.slug}`} className="w-full">
                      <DashboardButton variant="primary" size="sm" fullWidth>
                          Order Now
                      </DashboardButton>
                  </Link>
                  <Link href={`/services/${product.slug}`} className="shrink-0">
                    <DashboardButton variant="secondary" size="sm">
                        <InfoOutlined fontSize="small" />
                    </DashboardButton>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-20 text-center bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-dashed border-brand-500/10">
              <div className="w-20 h-20 bg-brand-500/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <SearchRounded className="text-brand-500/15" fontSize="large" />
              </div>
              <h3 className="text-sm font-black text-brand-500/40 uppercase tracking-widest">No products found</h3>
              <p className="text-xs text-brand-500/25 mt-2">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { 
  SearchRounded, 
  LocalOfferRounded, 
  TrendingDownRounded,
  FilterListRounded,
  GamepadRounded,
  InfoOutlined
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { getProducts, getCategories, type Product, type ProductCategory } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-ocean-500 font-bold mb-2">
            <LocalOfferRounded fontSize="small" />
            <span className="text-sm uppercase tracking-wider">VIP Reseller Access</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-brand-500">
            Special <span className="text-ocean-500">Price List</span>
          </h1>
          <p className="text-brand-500/50 mt-2 max-w-xl">
            As a VIP Reseller, you get access to discounted pricing across all our game services and vouchers.
          </p>
        </div>
        
        <div className="bg-cloud-200 p-4 rounded-2xl border border-brand-500/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-ocean-500 rounded-xl flex items-center justify-center text-smoke-100">
                <TrendingDownRounded />
            </div>
            <div>
                <div className="text-[10px] font-bold text-ocean-500 uppercase tracking-widest">Global Status</div>
                <div className="text-sm font-black text-brand-500">Up to 15% VIP Discount Applied</div>
            </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 lg:col-span-8">
          <Input 
            placeholder="Search products or brands..." 
            icon={<SearchRounded />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
        <div className="md:col-span-6 lg:col-span-4 flex gap-2">
            <select 
                title="Category"
                className="flex-1 bg-cloud-200 border border-brand-500/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20 transition-all cursor-pointer text-brand-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
            </select>
            <Button variant="white" icon={<FilterListRounded />} size="md" className="shrink-0" />
        </div>
      </div>

      {/* Price Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-cloud-200 animate-pulse rounded-3xl" />
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
              className="group bg-cloud-200 rounded-[32px] p-6 border border-brand-500/5 hover:border-ocean-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-smoke-200 rounded-2xl flex items-center justify-center group-hover:bg-smoke-300 transition-colors shrink-0 border border-brand-500/5">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                        ) : (
                            <GamepadRounded className="text-brand-500/20 group-hover:text-ocean-500 transition-colors" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-black text-brand-500 leading-tight">{product.name}</h3>
                        <span className="text-[10px] font-bold text-brand-500/30 uppercase tracking-widest">{product.brand || 'Game'}</span>
                    </div>
                </div>
                {product.is_featured && (
                    <span className="bg-ocean-500/10 text-ocean-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Hot</span>
                )}
              </div>

              <div className="space-y-3">
                {product.items?.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-smoke-300/50 border border-transparent hover:border-brand-500/5 transition-all">
                    <span className="text-xs font-bold text-brand-500/60">{item.name}</span>
                    <div className="text-right">
                        <span className="text-sm font-black text-ocean-500">
                            Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                        </span>
                    </div>
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
                    <Button variant="dark" size="sm" className="rounded-2xl w-full">
                        Order Now
                    </Button>
                </Link>
                <button className="p-3 bg-smoke-300/50 rounded-2xl text-brand-500/20 hover:text-ocean-500 hover:bg-ocean-500/5 transition-all border border-transparent hover:border-ocean-500/10">
                    <InfoOutlined fontSize="small" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="py-20 text-center bg-cloud-200 rounded-[40px] border border-dashed border-brand-500/10">
            <div className="w-20 h-20 bg-smoke-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchRounded className="text-brand-500/20" fontSize="large" />
            </div>
            <h3 className="text-xl font-bold text-brand-500">No products found</h3>
            <p className="text-brand-500/40">Try adjusting your search or category filters.</p>
        </div>
      )}
    </div>
  );
}

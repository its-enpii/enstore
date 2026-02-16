import React from "react";
import { TrendingUp, ShoppingBag } from "@mui/icons-material";

interface ProductStat {
  product_name: string;
  count: number;
  total_spent: string | number;
}

interface TopProductsListProps {
  products: ProductStat[];
  loading?: boolean;
}

const TopProductsList: React.FC<TopProductsListProps> = ({
  products,
  loading,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-brand-500/10 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-bold text-brand-500">Top Products</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center justify-between"
            >
              <div className="h-4 w-32 rounded bg-gray-200"></div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-500/10 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-brand-500">
          <TrendingUp className="text-ocean-500" />
          Top Products
        </h3>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-brand-500/30">
          <ShoppingBag fontSize="large" className="mb-2 opacity-50" />
          <p className="text-sm">No sales data yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-brand-500/5"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ocean-500/10 text-xs font-bold text-ocean-500">
                  #{index + 1}
                </div>
                <div className="truncate">
                  <p className="truncate text-sm font-bold text-brand-500 transition-colors group-hover:text-ocean-500">
                    {product.product_name}
                  </p>
                  <p className="text-xs text-brand-500/40">
                    {product.count} transactions
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-brand-500">
                  Rp {Number(product.total_spent).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProductsList;

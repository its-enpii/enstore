"use client";

import React from "react";
import { motion } from "motion/react";
import { KeyboardArrowLeftRounded, KeyboardArrowRightRounded } from "@mui/icons-material";

// ============================================================
// DataTable Column Definition
// ============================================================
export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

// ============================================================
// DataTable Props
// ============================================================
interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  // Pagination
  currentPage?: number;
  lastPage?: number;
  total?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  // Selection
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectRow?: (index: number) => void;
  onSelectAll?: () => void;
  // Row key
  rowKey?: (row: T, index: number) => string | number;
}

// ============================================================
// Skeleton Row
// ============================================================
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-brand-500/5 rounded-full w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ============================================================
// DataTable Component
// ============================================================
function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyIcon,
  emptyTitle = "No data found",
  emptyDescription,
  currentPage = 1,
  lastPage = 1,
  total = 0,
  perPage = 10,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  rowKey,
}: DataTableProps<T>) {

  const alignClass = (align?: string) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-smoke-200 dark:bg-brand-800 rounded-[28px] border border-brand-500/5 overflow-hidden"
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-500/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-[10px] font-black text-brand-500/40 dark:text-brand-500/50 ${alignClass(col.align)} ${col.sortable ? "cursor-pointer select-none hover:text-ocean-500 transition-colors" : ""}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className={`inline-flex items-center gap-1 ${col.align === "right" ? "flex-row-reverse" : ""}`}>
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      <span className="text-ocean-500 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-500/5">
            {/* Loading Skeleton */}
            {loading && data.length === 0 && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))}
              </>
            )}

            {/* Data Rows */}
            {!loading && data.length > 0 && data.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row, idx) : idx}
                className="hover:bg-cloud-200/60 dark:hover:bg-brand-700/30 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-4 text-sm text-brand-500 dark:text-smoke-300 ${alignClass(col.align)}`}>
                    {col.render
                      ? col.render(row, idx)
                      : String((row as any)[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  {emptyIcon && (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/5 flex items-center justify-center text-brand-500/15">
                      {emptyIcon}
                    </div>
                  )}
                  <p className="text-xs font-black text-brand-500/30">{emptyTitle}</p>
                  {emptyDescription && (
                    <p className="text-xs text-brand-500/20 mt-1">{emptyDescription}</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && lastPage > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-brand-500/5">
          <p className="text-[10px] font-bold text-brand-500/30">
            Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg text-brand-500/40 hover:text-brand-500 hover:bg-brand-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <KeyboardArrowLeftRounded fontSize="small" />
            </button>

            {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
              let page: number;
              if (lastPage <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= lastPage - 2) {
                page = lastPage - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-colors ${
                    page === currentPage
                      ? "bg-ocean-500 text-smoke-200"
                      : "text-brand-500/40 hover:text-brand-500 hover:bg-brand-500/5"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="p-1.5 rounded-lg text-brand-500/40 hover:text-brand-500 hover:bg-brand-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <KeyboardArrowRightRounded fontSize="small" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default DataTable;

"use client";

import React from "react";
import { motion } from "motion/react";
import {
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
} from "@mui/icons-material";

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
          <div className="h-4 w-3/4 rounded-full bg-brand-500/5" />
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
      className="overflow-hidden rounded-[28px] border border-brand-500/5 bg-smoke-200"
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-500/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-[10px] font-black text-brand-500/40 ${alignClass(col.align)} ${col.sortable ? "cursor-pointer transition-colors select-none hover:text-ocean-500" : ""}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div
                    className={`inline-flex items-center gap-1 ${col.align === "right" ? "flex-row-reverse" : ""}`}
                  >
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      <span className="text-xs text-ocean-500">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
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
            {!loading &&
              data.length > 0 &&
              data.map((row, idx) => (
                <tr
                  key={rowKey ? rowKey(row, idx) : idx}
                  className="transition-colors duration-150 hover:bg-cloud-200/60"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-4 text-sm text-brand-500 ${alignClass(col.align)}`}
                    >
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
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/5 text-brand-500/15">
                      {emptyIcon}
                    </div>
                  )}
                  <p className="text-xs font-black text-brand-500/30">
                    {emptyTitle}
                  </p>
                  {emptyDescription && (
                    <p className="mt-1 text-xs text-brand-500/20">
                      {emptyDescription}
                    </p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && lastPage > 1 && (
        <div className="flex items-center justify-between border-t border-brand-500/5 px-5 py-4">
          <p className="text-[10px] font-bold text-brand-500/30">
            Showing {(currentPage - 1) * perPage + 1}–
            {Math.min(currentPage * perPage, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-lg p-1.5 text-brand-500/40 transition-colors hover:bg-brand-500/5 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-30"
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
                  className={`h-8 w-8 rounded-lg text-xs font-black transition-colors ${
                    page === currentPage
                      ? "bg-ocean-500 text-smoke-200"
                      : "text-brand-500/40 hover:bg-brand-500/5 hover:text-brand-500"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="rounded-lg p-1.5 text-brand-500/40 transition-colors hover:bg-brand-500/5 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-30"
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

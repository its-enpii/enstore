"use client";

import React from "react";
import { DeleteRounded } from "@mui/icons-material";
import { InputField } from "@/lib/api/types";

interface ProductDynamicFieldsProps {
  inputFields: InputField[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof InputField, value: any) => void;
}

export default function ProductDynamicFields({
  inputFields,
  onAdd,
  onRemove,
  onUpdate,
}: ProductDynamicFieldsProps) {
  return (
    <div className="space-y-6 rounded-[32px] border border-brand-500/10 bg-smoke-200 p-8 shadow-sm">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-500/10 pb-2">
            <label className="text-xs font-bold text-brand-500/50 uppercase">
              User Input Fields
            </label>
            <button
              type="button"
              onClick={onAdd}
              className="rounded-lg bg-ocean-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-ocean-500 uppercase transition-colors hover:bg-ocean-500/20"
            >
              + Add Field
            </button>
          </div>
          <div className="space-y-2">
            {inputFields.map((field, idx) => (
              <div
                key={idx}
                className="space-y-2 rounded-xl border border-brand-500/10 bg-white p-3"
              >
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold tracking-tight text-brand-500/30 uppercase">
                      Field Name
                    </label>
                    <input
                      className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2.5 text-xs font-bold text-brand-500 outline-none focus:border-ocean-500/20"
                      placeholder="e.g. user_id"
                      value={field.name || ""}
                      onChange={(e) => onUpdate(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold tracking-tight text-brand-500/30 uppercase">
                      Display Label
                    </label>
                    <input
                      className="w-full rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2.5 text-xs font-bold text-brand-500 outline-none focus:border-ocean-500/20"
                      placeholder="e.g. User ID"
                      value={field.label || ""}
                      onChange={(e) => onUpdate(idx, "label", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold tracking-tight text-brand-500/30 uppercase">
                      Field Type
                    </label>
                    <div className="relative">
                      <select
                        value={field.type}
                        onChange={(e) => onUpdate(idx, "type", e.target.value)}
                        className="w-full appearance-none rounded-xl border border-brand-500/5 bg-smoke-200 px-4 py-2.5 text-xs font-bold text-brand-500 outline-none focus:border-ocean-500/20"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="select">Dropdown</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-smoke-200 px-4 py-2.5 transition-colors hover:bg-smoke-300">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          onUpdate(idx, "required", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-brand-500/10 text-ocean-500"
                      />
                      <span className="text-xs font-bold text-brand-500/60">
                        Required
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemove(idx)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                    >
                      <DeleteRounded style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
                {field.type === "select" && (
                  <div className="mt-1">
                    <input
                      className="w-full rounded border border-yellow-500/20 bg-yellow-50 px-2 py-1 font-mono text-xs text-yellow-700 outline-none placeholder:text-yellow-700/40"
                      placeholder="Options (comma separated)"
                      value={field.options || ""}
                      onChange={(e) => onUpdate(idx, "options", e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
            {inputFields.length === 0 && (
              <p className="py-4 text-center text-xs font-bold text-brand-500/40">
                No input fields defined.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

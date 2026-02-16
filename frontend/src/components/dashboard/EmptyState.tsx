"use client";

import React from "react";
import { motion } from "motion/react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-[32px] border border-dashed border-brand-500/10 bg-cloud-200/50 px-8 py-16 text-center"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/5 text-brand-500/15">
        {icon}
      </div>
      <h3 className="text-sm font-black text-brand-500/40">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-xs text-brand-500/30">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;

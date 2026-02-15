"use client";

import React from "react";
import { motion } from "motion/react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-16 px-8 text-center bg-cloud-200/50 dark:bg-brand-800/30 rounded-[32px] border border-dashed border-brand-500/10"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-brand-500/5 flex items-center justify-center text-brand-500/15">
        {icon}
      </div>
      <h3 className="text-sm font-black text-brand-500/40 dark:text-brand-500/50">{title}</h3>
      {description && (
        <p className="text-xs text-brand-500/30 dark:text-brand-500/40 mt-2 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;

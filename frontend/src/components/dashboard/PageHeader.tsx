"use client";

import React from "react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  emoji?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  emoji,
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-brand-500/90">
          {title} {emoji && <span>{emoji}</span>}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-brand-500/40">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;

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
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="mx-1 text-xs text-brand-500/20">/</span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[10px] font-bold text-brand-500/40 transition-colors hover:text-ocean-500"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[10px] font-bold text-brand-500/60">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-black text-brand-500">
          {title} {emoji && <span>{emoji}</span>}
        </h1>
        {description && (
          <p className="mt-1 text-sm font-bold text-brand-500/50">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;

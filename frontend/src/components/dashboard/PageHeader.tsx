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

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, emoji, actions, breadcrumbs }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-2">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-brand-500/20 text-xs mx-1">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-[10px] font-bold text-brand-500/40 hover:text-ocean-500 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[10px] font-bold text-brand-500/60 dark:text-brand-500/40">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-black text-brand-500 dark:text-smoke-200">
          {title} {emoji && <span>{emoji}</span>}
        </h1>
        {description && <p className="text-brand-500/50 dark:text-brand-500/40 mt-1 font-bold text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;

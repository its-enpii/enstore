"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-brand-500/5 bg-cloud-200 p-4">
      <div className="container mx-auto py-2">
        <p className="text-center text-sm text-brand-500/40">
          &copy; {new Date().getFullYear()} EnStore. Powered by{" "}
          <span className="font-bold text-ocean-500">Enpii Studio</span>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

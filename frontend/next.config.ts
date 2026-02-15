import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@mui/icons-material"],
  images: {
    remotePatterns: [
      {
        // Supabase Storage (product images)
        protocol: "https",
        hostname: "rkdcloophaoszfvyzeex.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Backend local storage (fallback)
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;

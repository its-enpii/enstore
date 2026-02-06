import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/icons-material"],
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;

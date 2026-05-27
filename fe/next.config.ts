import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'qrcode', '@yudiel/react-qr-scanner'],
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;

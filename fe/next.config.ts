import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // 静态站点生成配置（用于SEO优化）
  output: 'export',
  
  // 图片优化配置（静态导出时需要禁用）
  images: {
    unoptimized: true,
  },

  // Trailing slash for better compatibility
  trailingSlash: true,

  // Turbopack配置（Next.js 16+）
  turbopack: {},
};

export default nextConfig;

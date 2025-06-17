import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // ログ設定の例
  logging: {
    fetches: {
      fullUrl: true, // フルURLをログに表示
    },
  },
};

export default nextConfig;

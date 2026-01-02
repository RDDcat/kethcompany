import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 모든 페이지를 API 라우트로 리다이렉트 (순수 HTML)
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/api/home',
      },
      {
        source: '/zeroboard/zboard.php',
        destination: '/api/zeroboard',
      },
    ];
  },
};

export default nextConfig;

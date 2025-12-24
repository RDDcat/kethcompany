import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /zeroboard/zboard.php 요청을 API 라우트로 리다이렉트
  async rewrites() {
    return [
      {
        source: '/zeroboard/zboard.php',
        destination: '/api/zeroboard',
      },
    ];
  },
};

export default nextConfig;

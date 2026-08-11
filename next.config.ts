import type { NextConfig } from "next";

const backendBase = (
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3001"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    // FE 자체 라우트(/api, /api/openapi)는 제외하고, 그 외 /api/* 는 백엔드로 프록시.
    // API_BASE_URL이 비어 relative fetch가 나와도 중앙 목록 등이 동작하도록 안전망.
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${backendBase}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;

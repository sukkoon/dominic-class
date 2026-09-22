import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      // 강사 아바타
      { protocol: "https", hostname: "api.dicebear.com" },
      // 언어별 랜드마크 히어로 사진
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;

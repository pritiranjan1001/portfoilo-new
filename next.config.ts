import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /** Cache optimized images longer in production (repeat visits feel instant). */
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jyotiranjanswain.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

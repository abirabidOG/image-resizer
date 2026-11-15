import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/imageresizer",
        destination: "/",
        permanent: true,
      },
      {
        source: "/image-resizer",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

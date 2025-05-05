import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("http://res.cloudinary.com/**"),
      new URL("https://picsum.photos/**"),
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    }
  }
};

export default nextConfig;

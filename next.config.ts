import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "peaceful-acoustics-7f7ce4f047.media.strapiapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/api/portraits/**",
      },
      // Strapi local (dev)
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/**",
      },
      // Strapi Cloud (prod)
      {
        protocol: "https",
        hostname: "*.strapiapp.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

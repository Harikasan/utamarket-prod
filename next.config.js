/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
    domains: ["utamarket-db.cj2icmg206xo.us-east-2.rds.amazonaws.com"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "utamarket-db.cj2icmg206xo.us-east-2.rds.amazonaws.com",
      ],
    },
  },
};

export default nextConfig;

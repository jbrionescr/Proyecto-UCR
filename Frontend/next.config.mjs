/** @type {import("next").NextConfig} */
const nextConfig = {
  // pdf-parse usa pdfjs-dist (workers/requires dinámicos); evitar que webpack lo empaquete
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};
export default nextConfig;

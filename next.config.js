/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.sudanzon.com",
      },
      {
        protocol: "https",
        hostname: "sudanzon.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "https://api.sudanzon.com/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;



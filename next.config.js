/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
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
};

module.exports = nextConfig;

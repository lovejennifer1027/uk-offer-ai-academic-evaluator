/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  reactStrictMode: true,
  serverExternalPackages: ["mammoth", "pdf-parse"]
};

export default nextConfig;

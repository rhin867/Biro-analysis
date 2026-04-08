/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig

// next.config.js
/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during the build
  },
};

module.exports = nextConfig;

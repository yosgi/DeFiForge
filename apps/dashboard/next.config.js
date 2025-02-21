/** @type {import('next').NextConfig} */
require('dotenv').config()
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This will allow production builds to complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

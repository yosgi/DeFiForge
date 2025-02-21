// next.config.mjs
const withNextIntl = createNextIntlPlugin("./i18n/request.ts")
import createNextIntlPlugin from 'next-intl/plugin';
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
};

export default withNextIntl(nextConfig);




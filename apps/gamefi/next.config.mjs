// apps/gamefi/next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

// 处理 ESM 下的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 如果您使用 next-intl 插件
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  eslint: {
    // This will allow production builds to complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // 只在客户端构建时复制静态资源
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, '../../packages/shared-assets/public'),
              // 复制到 gamefi 应用的 public/shared-assets 目录下
              to: path.resolve(__dirname, 'public'),
            },
          ],
        })
      );
    }
    return config;
  },
};

export default withNextIntl(nextConfig);

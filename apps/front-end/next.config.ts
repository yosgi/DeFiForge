import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { resolve } from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: resolve(__dirname, "../../packages/shared-assets/public"),
              to: resolve(__dirname, "public"),
            },
          ],
        })
      );
    }
    return config;
  },
};

export default withNextIntl(nextConfig);

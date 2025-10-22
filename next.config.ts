import type { NextConfig } from 'next';
import { codeInspectorPlugin } from 'code-inspector-plugin';

const nextConfig: NextConfig = {
  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     // Polyfill indexedDB for server-side rendering
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       indexeddb: false,
  //     };
  //   }
  //   return config;
  // },
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
      editor: 'code-insiders',
    }),
  },
};

export default nextConfig;

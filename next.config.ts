import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    // Supabase's default Site URL can point at the home page. Finish PKCE there too.
    return [{
      source: '/',
      has: [{ type: 'query', key: 'code', value: '(?<authCode>[A-Za-z0-9_-]{1,1024})' }],
      destination: '/auth/callback?code=:authCode',
      permanent: false,
    }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

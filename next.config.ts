import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow the sandboxed live-preview host to talk to the dev server.
  allowedDevOrigins: ['*.e2b.app', '*.app.github.dev', '*.gitpod.io'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;

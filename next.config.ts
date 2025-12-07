import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // キャッシュ制御の設定
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

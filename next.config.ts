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
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://checkout.stripe.com",
              "img-src 'self' data: https: blob: https://www.google-analytics.com https://www.googletagmanager.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://nrypzitmxcvimvriqnss.supabase.co https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

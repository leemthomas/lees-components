import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Lets the Studio's Presentation tool frame the site during local development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Content-Security-Policy', value: "frame-ancestors 'self' http://localhost:3333 https://aqa-sanity-sandbox-studio.vercel.app https://*.sanity.studio" }],
      },
    ]
  },
  logging: { fetches: { fullUrl: true } },
}

export default nextConfig

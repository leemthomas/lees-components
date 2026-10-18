import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Lets the Studio's Presentation tool frame the site locally and on Vercel
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Content-Security-Policy', value: "frame-ancestors 'self' http://localhost:3333 https://lees-components-studio.vercel.app https://*.sanity.studio" }],
      },
    ]
  },
  logging: { fetches: { fullUrl: true } },
}

export default nextConfig

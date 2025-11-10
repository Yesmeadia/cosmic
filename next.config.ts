/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(), autoplay=(), clipboard-write=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), sync-xhr=(), usb=(), vr=()'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 
                https://vercel.live 
                https://www.google.com 
                https://www.gstatic.com 
                https://www.googletagmanager.com 
                https://www.clarity.ms 
                https://*.google-analytics.com;
              style-src 'self' 
                'unsafe-inline'
                https://fonts.googleapis.com 
                https://www.gstatic.com;
              img-src 'self' 
                data: 
                blob:
                https://images.unsplash.com
                https://www.gstatic.com 
                https://*.clarity.ms
                https://*.google-analytics.com 
                https://*.doubleclick.net;
              font-src 'self' 
                data:
                https://fonts.gstatic.com;
              connect-src 'self' 
                https://api.example.com 
                https://www.google.com 
                https://*.clarity.ms
                https://*.google-analytics.com 
                https://*.doubleclick.net;
              frame-src 'self' 
                https://vercel.live 
                https://www.google.com;
              media-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  },
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  }
}

module.exports = nextConfig
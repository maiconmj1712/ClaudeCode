/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@panexa/shared-types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
      { protocol: 'https', hostname: 'panexa.com.br' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}

module.exports = nextConfig

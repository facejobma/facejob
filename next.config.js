/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['utfs.io'],
      },
}


module.exports = nextConfig

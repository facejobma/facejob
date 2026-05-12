/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Only use standalone output in production
    ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
    
    // Performance optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
    
    // Development-specific settings
    ...(process.env.NODE_ENV === 'development' && {
        onDemandEntries: {
            // Reduce cache time in development
            maxInactiveAge: 25 * 1000,
            pagesBufferLength: 2,
        },
    }),
    
    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'utfs.io',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
    
    // Compression
    compress: true,
    
    // Turbopack configuration (empty to silence warning)
    turbopack: {},
    
    // Headers for caching (only in production)
    async headers() {
        const headers = [];
        
        // COOP and COEP headers for FFmpeg.wasm (SharedArrayBuffer support)
        headers.push({
            source: '/:path*',
            headers: [
                {
                    key: 'Cross-Origin-Opener-Policy',
                    value: 'same-origin',
                },
                {
                    key: 'Cross-Origin-Embedder-Policy',
                    value: 'require-corp',
                },
            ],
        });
        
        if (process.env.NODE_ENV === 'production') {
            headers.push(
                {
                    source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
                    headers: [
                        {
                            key: 'Cache-Control',
                            value: 'public, max-age=31536000, immutable',
                        },
                    ],
                },
                {
                    source: '/_next/static/:path*',
                    headers: [
                        {
                            key: 'Cache-Control',
                            value: 'public, max-age=31536000, immutable',
                        },
                    ],
                }
            );
        }
        
        return headers;
    },
}

module.exports = nextConfig
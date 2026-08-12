/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Only use standalone output in production
    ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),


    env: {
        FACEJOB_AWS_REGION: process.env.FACEJOB_AWS_REGION,
        FACEJOB_AWS_ACCESS_KEY_ID: process.env.FACEJOB_AWS_ACCESS_KEY_ID,
        FACEJOB_AWS_SECRET_ACCESS_KEY: process.env.FACEJOB_AWS_SECRET_ACCESS_KEY,
        FACEJOB_AWS_S3_BUCKET_NAME: process.env.FACEJOB_AWS_S3_BUCKET_NAME,
    },
    
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
            {
                protocol: 'https',
                hostname: 'api.facejob.ma',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
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
        
        // COOP and COEP headers for FFmpeg.wasm (SharedArrayBuffer support).
        // Use credentialless so public cross-origin media can render without
        // requiring third-party servers to send Cross-Origin-Resource-Policy.
        headers.push({
            source: '/:path*',
            headers: [
                {
                    key: 'Cross-Origin-Opener-Policy',
                    value: 'same-origin',
                },
                {
                    key: 'Cross-Origin-Embedder-Policy',
                    value: 'credentialless',
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

    // Proxy API requests to the backend ALB to avoid Mixed Content (HTTP vs HTTPS)
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://FaceJobALB-1148147173.eu-west-3.elb.amazonaws.com/api/:path*',
            },
        ];
    },
}

module.exports = nextConfig

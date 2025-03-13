/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'places.googleapis.com',
            'maps.googleapis.com',
            'lh3.googleusercontent.com',
            'streetviewpixels-pa.googleapis.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            }
        ],
        unoptimized: false,
    },
}

module.exports = nextConfig 
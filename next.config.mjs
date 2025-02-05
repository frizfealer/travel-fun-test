let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
        port: '',
        pathname: '/v1/places/**',
      },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  rewrites: async () => {
    return [
      {
        source: "/api/py/:path*",
        destination: process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/api/py/:path*"
          : "/api/",
      },
      {
        source: "/docs",
        destination: process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/api/py/docs"
          : "/api/py/docs",
      },
      {
        source: "/openapi.json",
        destination: process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/api/py/openapi.json"
          : "/api/py/openapi.json",
      },
    ]
  },
}

// Merge user config if exists
if (userConfig) {
  for (const key in userConfig) {
    if (typeof nextConfig[key] === 'object' && !Array.isArray(nextConfig[key])) {
      nextConfig[key] = { ...nextConfig[key], ...userConfig[key] }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig

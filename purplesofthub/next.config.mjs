/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    // Optimize image formats for better performance
    formats: ["image/avif", "image/webp"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for images (60 seconds)
    minimumCacheTTL: 60,
  },
  // Enable React strict mode for better performance detection
  reactStrictMode: true,
  // Turbopack configuration (Next.js 16 default bundler)
  turbopack: {
    // Empty config to use Turbopack defaults - most webpack configs work as-is
  },
  // Optimize webpack bundling (also used for Turbopack compatibility)
  webpack: (config, { isServer }) => {
    // Reduce bundle size by removing unused modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Headers for better caching
  headers: async () => [
    {
      // Cache static assets aggressively
      source: "/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache images
      source: "/images/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      // Security headers
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
      ],
    },
  ],
  // Experimental features for better performance
  experimental: {
    // Optimize server components
    optimizePackageImports: ["lucide-react", "recharts", "react-apexcharts"],
  },
};

export default nextConfig;

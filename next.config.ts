import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization for better performance
  output: 'standalone',
  
  // Optimize images
  images: {
    unoptimized: true, // For Render compatibility
  },
  
  // Environment variables for build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@supabase/ssr', '@supabase/supabase-js'],
  },
  
  // ESLint configuration for build
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint warnings
    ignoreDuringBuilds: true,
    // Custom rules for production
    dirs: ['src'],
  },
  
  // TypeScript configuration
  typescript: {
    // Allow production builds to successfully complete even if there are TypeScript errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    if (process.env.NODE_ENV === "development") {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "@dyad-sh/nextjs-webpack-component-tagger",
      });
    }
    return config;
  },
  // Add the rewrites configuration here for multiple external APIs
  async rewrites() {
    return [
      {
        // Example 1: For a primary external API
        source: '/api/service1/:path*',
        destination: `${process.env.EXTERNAL_API_URL_SERVICE1}/:path*`,
      },
      {
        // Example 2: For a secondary external API (e.g., a payment gateway)
        source: '/api/service2/:path*',
        destination: `${process.env.EXTERNAL_API_URL_SERVICE2}/:path*`,
      },
      {
        // Example 3: For another specific external service (e.g., a weather API)
        source: '/api/weather/:path*',
        destination: `${process.env.WEATHER_API_URL}/:path*`,
      },
      // You can add as many rewrite rules as needed for different APIs
    ];
  },
};

export default nextConfig;


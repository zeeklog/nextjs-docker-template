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
    const rewrites = [];

    // Get environment variables
    const externalApiUrlService1 = process.env.EXTERNAL_API_URL_SERVICE1;
    const externalApiUrlService2 = process.env.EXTERNAL_API_URL_SERVICE2;
    const weatherApiUrl = process.env.WEATHER_API_URL;

    // Conditionally add rewrite rules
    if (externalApiUrlService1) { // Checks if the string is not empty or undefined
      rewrites.push({
        source: '/api/service1/:path*',
        destination: `${externalApiUrlService1}/:path*`,
      });
    }

    if (externalApiUrlService2) { // Checks if the string is not empty or undefined
      rewrites.push({
        source: '/api/service2/:path*',
        destination: `${externalApiUrlService2}/:path*`,
      });
    }

    if (weatherApiUrl) { // Checks if the string is not empty or undefined
      rewrites.push({
        source: '/api/weather/:path*',
        destination: `${weatherApiUrl}/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;


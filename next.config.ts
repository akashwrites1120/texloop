import type { NextConfig } from "next";

interface ExtendedNextConfig extends NextConfig {
  devServer?: {
    allowedDevOrigins?: string[];
  };
}

const nextConfig: ExtendedNextConfig = {
  devServer: {
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://10.66.247.57:3000",
    ],
  },
};

export default nextConfig;

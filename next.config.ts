import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [new URL("https://www.picudarbnica.lv/wp-content/**"), new URL("https://www.lulu.lv/**")],
  },
};

export default nextConfig;

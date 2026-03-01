import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js がワークスペースルートを誤検出する警告を抑えるため
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
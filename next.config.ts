import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "onnxruntime-node",
  ],
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/onnxruntime-node/package.json",
      "./node_modules/onnxruntime-node/dist/**/*.js",
      "./node_modules/onnxruntime-node/lib/**/*.js",
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/*",
    ],
  },
};

export default nextConfig;

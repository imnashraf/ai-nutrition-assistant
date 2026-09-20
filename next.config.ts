import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@huggingface/transformers",
    "onnxruntime-node",
  ],
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/onnxruntime-node/bin/**/*.node",
    ],
  },
};

export default nextConfig;

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Avoid duplicate development mounts and trim large package barrel imports.
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "clsx"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

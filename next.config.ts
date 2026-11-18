import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local UI tests run a demo dev server in its own folder so it never clobbers the real build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

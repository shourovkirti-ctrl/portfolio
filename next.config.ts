import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the whole site is prerendered to HTML at build time and
  // deployed to Cloudflare Pages. See docs/TECHNICAL_PLAN.md §6.
  output: "export",

  // Emits /about/index.html rather than /about.html, which is what static
  // hosts expect when serving directories.
  trailingSlash: true,

  // Next's image optimiser needs a server. Images are already resized and
  // converted by our own sharp pipeline before they are committed or
  // uploaded, so there is nothing to give up here.
  images: { unoptimized: true },

  // A type error should stop a deploy, not ship. (Next 16 removed the
  // `eslint` config key — linting runs as its own step, see npm run check.)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;

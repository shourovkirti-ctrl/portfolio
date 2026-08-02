import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";

/**
 * The instrumented harnesses under /dev are excluded. They are dev-only and
 * should not ship at all; this is the second line of defence rather than the
 * first.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/dev/" }],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}

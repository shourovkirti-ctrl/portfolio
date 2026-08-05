import type { MetadataRoute } from "next";
import { exhibitions, papers, places } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * Every route, built from the same content the pages are.
 *
 * The origin comes from one environment variable and nothing else, so moving
 * from the free pages.dev URL to a real domain is a one-line change rather
 * than a search across the codebase. See docs/TECHNICAL_PLAN.md §6.1.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_ORIGIN}${path}`;

  return [
    { url: url("/"), priority: 1 },
    { url: url("/heritage/"), priority: 0.9 },
    { url: url("/heritage/exhibitions/"), priority: 0.7 },
    { url: url("/research/"), priority: 0.8 },
    { url: url("/photography/"), priority: 0.3 },
    { url: url("/commercial/"), priority: 0.3 },
    { url: url("/about/"), priority: 0.6 },
    ...places.map((place) => ({
      url: url(`/heritage/places/${place.slug}/`),
      priority: 0.6,
    })),
    ...exhibitions.map((exhibition) => ({
      url: url(`/heritage/exhibitions/${exhibition.slug}/`),
      priority: 0.5,
    })),
    ...papers.map((paper) => ({
      url: url(`/research/${paper.slug}/`),
      priority: 0.7,
    })),
  ];
}

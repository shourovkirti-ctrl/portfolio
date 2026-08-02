/**
 * Site-wide constants.
 *
 * The canonical origin lives here and nowhere else. Every internal link is
 * relative; this value is used only for sitemap, robots, canonical tags and
 * Open Graph URLs. Changing domain is then a one-line change — which is the
 * whole reason the site can be built on a free *.pages.dev URL and moved to
 * a real domain at launch. See docs/TECHNICAL_PLAN.md §6.1.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000";

/**
 * "Khondoker", with an e — the spelling on the three papers, on AIUB's own
 * pages, and the one he chose for the site. His NID reads KHONDOKAR and
 * several profiles read Shourov; About resolves all of that in one line
 * rather than leaving a visitor to wonder whether they have the right man.
 */
export const SITE_NAME = "Khondoker Zobaed Hassan";

export const SITE_DESCRIPTION =
  "Photographer and heritage documentarian in Dhaka. Records of buildings, " +
  "sculptures and landscapes in three dimensions.";

/** Navigation, in the order the site is meant to be read. */
export const TABS = [
  { href: "/", label: "Home" },
  { href: "/heritage/", label: "Heritage" },
  { href: "/photography/", label: "Photography" },
  { href: "/commercial/", label: "Commercial" },
  { href: "/research/", label: "Research" },
  { href: "/about/", label: "About" },
] as const;

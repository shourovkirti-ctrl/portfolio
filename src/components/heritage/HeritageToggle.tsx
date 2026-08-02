import Link from "next/link";

/**
 * Places or Exhibitions.
 *
 * Two real routes rather than client state, so each thread is linkable,
 * crawlable and reachable with the back button. The distinction is the
 * point of the tab: places outlive us, exhibitions do not.
 */
export function HeritageToggle({ current }: { current: "places" | "exhibitions" }) {
  const item = (href: string, label: string, key: "places" | "exhibitions") => (
    <Link
      href={href}
      aria-current={current === key ? "page" : undefined}
      className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline aria-[current=page]:text-neutral-950 aria-[current=page]:underline focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:text-neutral-50 dark:aria-[current=page]:text-neutral-50"
    >
      {label}
    </Link>
  );

  return (
    <nav aria-label="Heritage threads" className="flex gap-5">
      {item("/heritage/", "Places", "places")}
      {item("/heritage/exhibitions/", "Exhibitions", "exhibitions")}
    </nav>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Commercial",
  description:
    "Commercial 3D, animation, product photography and virtual tours by " +
    "Khondoker Zobaed Hassan. In preparation.",
};

/**
 * Placeholder.
 *
 * The real tab is a typographic index — client, capability, year — with a
 * preview panel, and it needs the client years and two lines each, plus the
 * video pipeline. Phase 2. See docs/DESIGN_PLAN.md §7.
 *
 * This tab is the one most likely to be someone's first page, arriving from
 * a search, so the stub carries the contact route rather than sending them
 * away empty-handed.
 */
export default function CommercialPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-serif text-3xl leading-tight text-balance">
        Client work.
      </h1>
      <p className="mt-5 text-[17px] leading-[1.75]">
        3D animation and product renders, product photography, architectural
        visualisation, and 360° tours of showrooms, offices and resorts — for
        Grameenphone, Partex, Akij Ceramics, Star Ceramics, Fresh Ceramics, RAK
        Ceramics, Sigmind AI and others. Google Street View Trusted certified.
      </p>
      <p className="mt-5 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        The index of this work is not built yet — it needs the video pulled
        down and re-encoded before any of it can be shown properly.
      </p>
      <p className="mt-8">
        <Link
          href="/about/"
          className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Contact, in the meantime →
        </Link>
      </p>
    </div>
  );
}

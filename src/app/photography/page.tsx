import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Photography",
  description:
    "Photography by Khondoker Zobaed Hassan — portrait, street, nature and " +
    "aerial work. In preparation.",
};

/**
 * Placeholder.
 *
 * The real room is one image at a time, full bleed, running by camera
 * distance — portrait, street, nature and bird, bird eye view — and it needs
 * forty to sixty curated photographs that do not exist in the repo yet. It
 * lands in phase 2. See docs/DESIGN_PLAN.md §6.
 *
 * A stub rather than a hidden tab: the navigation is the site's map, and a
 * tab that appears later reads as a site that was incomplete. This says what
 * is coming and does not pretend to be it.
 */
export default function PhotographyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-serif text-3xl leading-tight text-balance">
        The quiet room.
      </h1>
      <p className="mt-5 text-[17px] leading-[1.75]">
        The rest of this site says that enough photographs hold an object.
        This room will say the opposite: that one photograph holds a moment.
        One image at a time, no grid, running from portrait to street to
        nature to the view from several hundred metres up.
      </p>
      <p className="mt-5 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        It is not built yet. The photographs are being selected — around fifty
        from a larger body of work — and nothing here will be a render.
      </p>
      <p className="mt-8">
        <Link
          href="/heritage/"
          className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          The heritage archive is finished enough to walk through →
        </Link>
      </p>
    </div>
  );
}

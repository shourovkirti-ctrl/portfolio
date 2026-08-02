import Link from "next/link";
import { places, papers, exhibitions } from "@/lib/content";

/**
 * Home, simple version.
 *
 * The real one is a single continuous scroll — coin, sculpture, room,
 * building, hill, then the map of Bangladesh — and it lands in phase 3, once
 * the splats for each rung exist. Until then this states the thesis and
 * hands over the map, which is the same job the ladder's ending does.
 * See docs/DESIGN_PLAN.md §4.
 */

const recordCount = places.reduce((n, place) => n + place.formats.length, 0);

const DOORS = [
  { href: "/heritage/", label: "Heritage", note: null as string | null },
  { href: "/research/", label: "Research & Writing", note: null },
  { href: "/photography/", label: "Photography", note: "in preparation" },
  { href: "/commercial/", label: "Commercial", note: "in preparation" },
  { href: "/about/", label: "About & Contact", note: null },
] as const;

const NOTES: Record<string, string> = {
  "/heritage/": `${places.length} places · ${recordCount} records · ${exhibitions.length} exhibitions`,
  "/research/": `${papers.length} papers, each with a DOI`,
  "/about/": "the line connecting all of it",
};

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-serif text-2xl leading-snug text-balance sm:text-3xl">
        I make records of things that may not be here tomorrow.
      </p>
      <p className="mt-6 max-w-xl text-[17px] leading-[1.75] text-neutral-600 dark:text-neutral-400">
        A photograph holds a moment. Enough photographs hold an object. That is
        not a metaphor — it is the method: hundreds of frames become a
        measurable building, and a building nobody is looking after becomes a
        record that outlasts it.
      </p>

      <nav aria-label="Sections" className="mt-16">
        <ul className="flex flex-col">
          {DOORS.map((door) => (
            <li
              key={door.href}
              className="border-t border-neutral-200 last:border-b dark:border-neutral-800"
            >
              <Link
                href={door.href}
                className="flex flex-wrap items-baseline gap-x-4 py-4 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <span className="text-lg">{door.label}</span>
                <span className="font-mono text-xs text-neutral-500">
                  {door.note ?? NOTES[door.href]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

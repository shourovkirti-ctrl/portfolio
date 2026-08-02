import Link from "next/link";
import { TABS } from "@/lib/site";

/**
 * Placeholder home page.
 *
 * The real one is a single continuous scroll — coin, sculpture, room,
 * building, hill, then the map of Bangladesh — and it lands in phase 3,
 * once the Gaussian splats for each rung exist. Until then this is a plain
 * door into the tabs. See docs/DESIGN_PLAN.md §4.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-serif text-2xl leading-snug text-balance sm:text-3xl">
        I make records of things that may not be here tomorrow.
      </p>

      <nav aria-label="Sections" className="mt-16">
        <ul className="flex flex-col gap-3">
          {TABS.filter((tab) => tab.href !== "/").map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className="text-lg underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

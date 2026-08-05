import type { Metadata } from "next";
import Link from "next/link";
import { featuredPlaces, places } from "@/lib/content";
import { PlaceBrowser } from "@/components/heritage/PlaceBrowser";
import { HeritageToggle } from "@/components/heritage/HeritageToggle";

export const metadata: Metadata = {
  title: "Heritage",
  description:
    "Places in Bangladesh recorded in three dimensions — 360° tours, " +
    "photogrammetric meshes and Gaussian splats, held place by place.",
};

const recordCount = places.reduce((n, place) => n + place.formats.length, 0);

/**
 * The Heritage landing.
 *
 * Map and featured strip together, because they serve different visitors:
 * the map serves browsing, the strip serves "show me the best". Without the
 * strip the strongest work sits three clicks deep and nobody finds it.
 * See docs/DESIGN_PLAN.md §5.
 */
export default function HeritagePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <HeritageToggle current="places" />

      <h1 className="mt-8 font-serif text-3xl leading-tight text-balance sm:text-4xl">
        Places outlive us. Exhibitions do not.
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        A mosque stands for five hundred years; an exhibition runs for a month
        and is gone. Both are recorded here. This is the first thread —{" "}
        {places.length} places, {recordCount} separate records.
      </p>

      <section aria-labelledby="featured" className="mt-14">
        <h2
          id="featured"
          className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
        >
          Start here
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredPlaces.map((place) => (
            <li key={place.slug}>
              <Link
                href={`/heritage/places/${place.slug}/`}
                className="block h-full rounded border border-neutral-200 p-4 hover:border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <span className="font-mono text-[11px] tracking-widest text-neutral-500 uppercase">
                  {place.district.en} · {place.formats.length} formats
                </span>
                <span className="mt-2 block font-serif text-lg leading-snug">
                  {place.name.en}
                </span>
                <span className="mt-2 block text-sm text-neutral-600 dark:text-neutral-400">
                  {place.summary.en.split(". ")[0]}.
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="map" className="mt-16">
        <h2
          id="map"
          className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
        >
          The map
        </h2>
        <div className="mt-6">
          <PlaceBrowser places={places} />
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlace, papersAbout, places } from "@/lib/content";
import { PlacePanel } from "@/components/heritage/PlacePanel";
import { HeritageToggle } from "@/components/heritage/HeritageToggle";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return places.map((place) => ({ slug: place.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const place = getPlace((await params).slug);
  if (!place) return {};
  return {
    title: place.name.en,
    description: place.summary.en,
  };
}

/**
 * A place, and everything held for it.
 *
 * The panel on the landing page and this page render the same component —
 * the panel is the preview, this is the address. Once the 3D work lands in
 * later phases it mounts here, beneath a text layer that already says
 * everything a crawler or a screen reader needs.
 */
export default async function PlacePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const place = getPlace((await params).slug);
  if (!place) notFound();

  const papers = papersAbout(place.slug);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <HeritageToggle current="places" />

      <div className="mt-10">
        <PlacePanel place={place} headingLevel="h2" />
      </div>

      {papers.length > 0 && (
        <section aria-labelledby="writing" className="mt-12">
          <h2
            id="writing"
            className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
          >
            Written about this place
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {papers.map((paper) => (
              <li key={paper.slug}>
                <Link
                  href={`/research/${paper.slug}/`}
                  className="text-[15px] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {paper.shortTitle}
                </Link>
                <span className="ml-2 font-mono text-xs text-neutral-500">
                  {paper.kind} · DOI {paper.doi}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12">
        <Link
          href="/heritage/"
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:text-neutral-50"
        >
          ← All places
        </Link>
      </p>
    </div>
  );
}

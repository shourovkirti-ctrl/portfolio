import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exhibitions, getExhibition } from "@/lib/content";
import { HeritageToggle } from "@/components/heritage/HeritageToggle";
import { formatDate, formatRun } from "@/lib/dates";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return exhibitions.map((exhibition) => ({ slug: exhibition.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const exhibition = getExhibition((await params).slug);
  if (!exhibition) return {};
  return { title: exhibition.name.en, description: exhibition.summary };
}

/**
 * One exhibition.
 *
 * A repeatable template rather than a bespoke page: name, institution,
 * dates, one paragraph, the tour, the counts, and the closing line stating
 * that it has ended and survives only here. The thread grows by one or two a
 * year — next year's addition should take minutes, not a redesign.
 */
export default async function ExhibitionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const exhibition = getExhibition((await params).slug);
  if (!exhibition) notFound();

  const counts = exhibition.counts
    ? [
        exhibition.counts.works && `${exhibition.counts.works} works`,
        exhibition.counts.halls && `${exhibition.counts.halls} halls`,
        exhibition.counts.panoramas &&
          `${exhibition.counts.panoramas} panoramas`,
      ].filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <HeritageToggle current="exhibitions" />

      <p className="mt-10 font-mono text-xs tracking-widest text-neutral-500 uppercase">
        {formatRun(exhibition.startDate, exhibition.endDate) ??
          "Dates not recorded"}
      </p>
      <h1 className="mt-3 font-serif text-3xl leading-tight text-balance">
        {exhibition.name.en}
      </h1>
      <p lang="bn" className="mt-2 text-neutral-500">
        {exhibition.name.bn}
      </p>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-xs text-neutral-500">
        <dt>Institution</dt>
        <dd className="text-neutral-700 dark:text-neutral-300">
          {exhibition.institution.en}
        </dd>
        {exhibition.venue && (
          <>
            <dt>Venue</dt>
            <dd className="text-neutral-700 dark:text-neutral-300">
              {exhibition.venue.en}
            </dd>
          </>
        )}
        {exhibition.artist && (
          <>
            <dt>Artist</dt>
            <dd className="text-neutral-700 dark:text-neutral-300">
              {exhibition.artist.en} · <span lang="bn">{exhibition.artist.bn}</span>
            </dd>
          </>
        )}
        {counts.length > 0 && (
          <>
            <dt>Scale</dt>
            <dd className="text-neutral-700 dark:text-neutral-300">
              {counts.join(" · ")}
            </dd>
          </>
        )}
      </dl>

      <p className="mt-8 text-[17px] leading-relaxed">{exhibition.summary}</p>

      {exhibition.contribution && (
        <section aria-labelledby="contribution" className="mt-10">
          <h2
            id="contribution"
            className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
          >
            What I built
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed">
            {exhibition.contribution}
          </p>
        </section>
      )}

      <section aria-labelledby="record" className="mt-10">
        <h2
          id="record"
          className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
        >
          The record
        </h2>
        {exhibition.tourUrl ? (
          <p className="mt-3">
            <a
              href={exhibition.tourUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[15px] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Open the 360° tour ↗
            </a>
          </p>
        ) : (
          <p className="mt-3 text-[15px] text-neutral-600 dark:text-neutral-400">
            The tour is held but not yet published on this site.
          </p>
        )}
      </section>

      {(exhibition.evidence.length > 0 || exhibition.evidenceNote) && (
        <section aria-labelledby="evidence" className="mt-10">
          <h2
            id="evidence"
            className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
          >
            Checkable from outside this site
          </h2>
          {exhibition.evidence.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {exhibition.evidence.map((item) => (
                <li key={item.label} className="text-[15px]">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {item.label} ↗
                    </a>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          )}
          {exhibition.evidenceNote && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {exhibition.evidenceNote}
            </p>
          )}
        </section>
      )}

      <p className="mt-12 border-t border-neutral-200 pt-6 text-[15px] leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        {exhibition.endDate
          ? `This exhibition ended on ${formatDate(exhibition.endDate)}. It survives only in this archive.`
          : "This exhibition has ended. It survives only in this archive."}
      </p>

      <p className="mt-8">
        <Link
          href="/heritage/exhibitions/"
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:text-neutral-50"
        >
          ← All exhibitions
        </Link>
      </p>
    </div>
  );
}

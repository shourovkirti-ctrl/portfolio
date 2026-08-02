import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaper, getPlace, getSeries, papers } from "@/lib/content";
import { ModelPlaceholder } from "@/components/ModelPlaceholder";
import { SeriesReader } from "@/components/research/SeriesReader";
import { formatDate } from "@/lib/dates";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return papers.map((paper) => ({ slug: paper.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const paper = getPaper((await params).slug);
  if (!paper) return {};
  return { title: paper.shortTitle, description: paper.summary };
}

const KIND_LABEL = {
  preprint: "Preprint",
  report: "Report",
  "peer-reviewed": "Peer-reviewed",
} as const;

/**
 * One subject, three depths: the model, the series, the paper.
 *
 * The order is deliberate and is the whole argument of the tab. The model
 * takes ten seconds and needs nothing of the reader; the series takes ten
 * minutes; the paper takes an afternoon. Everything a journal can give is at
 * the bottom, and the thing no journal can give is at the top.
 */
export default async function PaperPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const paper = getPaper((await params).slug);
  if (!paper) notFound();

  const place = paper.relatedPlace ? getPlace(paper.relatedPlace) : undefined;
  const seriesEn = paper.series ? getSeries(paper.series, "en") : undefined;
  const seriesBn = paper.series ? getSeries(paper.series, "bn") : undefined;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
        {KIND_LABEL[paper.kind]} · {formatDate(paper.publishedAt)}
      </p>
      <h1 className="mt-3 font-serif text-3xl leading-tight text-balance">
        {paper.shortTitle}
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed">{paper.summary}</p>

      {/* Depth 1 — the object. */}
      <div className="mt-10">
        <ModelPlaceholder
          label={paper.subjectLabel}
          href={paper.subjectModelUrl}
        />
      </div>

      {paper.figures.length > 0 && (
        <section aria-labelledby="figures" className="mt-10">
          <h2
            id="figures"
            className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
          >
            The survey in numbers
          </h2>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {paper.figures.map((figure) => (
              <div key={figure.label} className="contents">
                <dt className="font-mono text-xs text-neutral-500">
                  {figure.label}
                </dt>
                <dd className="tabular-nums">{figure.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {place && (
        <p className="mt-8 text-[15px]">
          The place:{" "}
          <Link
            href={`/heritage/places/${place.slug}/`}
            className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {place.name.en}, {place.district.en}
          </Link>
        </p>
      )}

      {/* Depth 2 — the series. */}
      {seriesEn && seriesBn && (
        <SeriesReader
          en={seriesEn}
          bn={seriesBn}
          title={`The story, in ${seriesEn.length} parts`}
        />
      )}

      {/* Depth 3 — the paper itself. */}
      <section
        aria-labelledby="paper"
        className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800"
      >
        <h2
          id="paper"
          className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
        >
          The paper
        </h2>
        <p className="mt-4 font-serif text-lg leading-snug text-balance">
          {paper.title}
        </p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-xs text-neutral-500">
          <dt>Author</dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            Khondoker Zobaed Hassan — Independent Cultural Heritage Researcher,
            Bangladesh
          </dd>
          <dt>Status</dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {KIND_LABEL[paper.kind]}
            {paper.kind !== "peer-reviewed" && " — not peer reviewed"}
          </dd>
          <dt>DOI</dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {paper.doi}
          </dd>
          <dt>Licence</dt>
          <dd className="text-neutral-700 dark:text-neutral-300">
            {paper.licence}
          </dd>
        </dl>
        <p className="mt-5">
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[15px] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Read the full paper on Zenodo ↗
          </a>
        </p>
      </section>

      <p className="mt-12">
        <Link
          href="/research/"
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:text-neutral-50"
        >
          ← All research
        </Link>
      </p>
    </div>
  );
}

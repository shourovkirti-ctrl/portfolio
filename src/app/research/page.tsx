import type { Metadata } from "next";
import Link from "next/link";
import { papers } from "@/lib/content";
import { formatDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Research & Writing",
  description:
    "Three papers on the photogrammetric documentation of heritage in " +
    "Bangladesh and Cambodia, each with a DOI, and the bilingual series " +
    "written alongside them.",
};

const KIND_LABEL = {
  preprint: "Preprint",
  report: "Report",
  "peer-reviewed": "Peer-reviewed",
} as const;

/**
 * The Research & Writing index.
 *
 * There are three papers, so this is a list and not an archive UI. The
 * writing itself lives with the object it is about; this page only points
 * at it. See docs/DESIGN_PLAN.md §8.
 */
export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl leading-tight text-balance sm:text-4xl">
        A paper can describe damage to an object. Here you can turn the object
        over and find it.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        Each subject sits at three depths on one page: the model, a five-part
        series written for anyone, and the full paper with its DOI. Nobody has
        to enter through the wrong door.
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">
        Two of the three are preprints and are described as preprints. Nothing
        here has been through peer review, and nothing will be called
        peer-reviewed until it has.
      </p>

      <ul className="mt-14 flex flex-col">
        {papers.map((paper) => (
          <li
            key={paper.slug}
            className="border-t border-neutral-200 py-7 dark:border-neutral-800"
          >
            <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
              {KIND_LABEL[paper.kind]} · {formatDate(paper.publishedAt)}
            </p>
            <h2 className="mt-2 font-serif text-2xl leading-snug text-balance">
              <Link
                href={`/research/${paper.slug}/`}
                className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {paper.shortTitle}
              </Link>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {paper.summary}
            </p>
            <p className="mt-3 font-mono text-xs text-neutral-500">
              DOI {paper.doi}
              {paper.series && " · five-part series, English and বাংলা"}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-10 font-mono text-xs leading-relaxed text-neutral-500">
        ORCID 0009-0005-4498-0287 · all three deposited on Zenodo under CC BY
        4.0
      </p>
    </div>
  );
}

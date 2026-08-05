import type { Metadata } from "next";
import Link from "next/link";
import { exhibitions } from "@/lib/content";
import { HeritageToggle } from "@/components/heritage/HeritageToggle";
import { formatRun } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Exhibitions",
  description:
    "Exhibitions recorded in three dimensions — national sculpture and " +
    "poster shows at the Bangladesh Shilpakala Academy, and others that " +
    "have since closed.",
};

/**
 * The exhibitions thread.
 *
 * A chronological list, because this thread grows by one or two a year and
 * the sequence is the story: the same institution coming back. Each entry is
 * the same template, so next year's addition takes minutes.
 */
export default function ExhibitionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <HeritageToggle current="exhibitions" />

      <h1 className="mt-8 font-serif text-3xl leading-tight text-balance sm:text-4xl">
        Exhibitions do not outlive us.
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        Each of these ran for a few weeks and then came down. The works went
        back to the artists who lent them, and the rooms were rehung. What is
        below is what remains.
      </p>

      <ul className="mt-14 flex flex-col">
        {exhibitions.map((exhibition) => (
          <li
            key={exhibition.slug}
            className="border-t border-neutral-200 py-6 dark:border-neutral-800"
          >
            <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
              {formatRun(exhibition.startDate, exhibition.endDate) ??
                "Dates not recorded"}
            </p>
            <h2 className="mt-2 font-serif text-2xl leading-snug text-balance">
              <Link
                href={`/heritage/exhibitions/${exhibition.slug}/`}
                className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {exhibition.name.en}
              </Link>
            </h2>
            <p lang="bn" className="mt-1 text-sm text-neutral-500">
              {exhibition.name.bn}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {exhibition.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

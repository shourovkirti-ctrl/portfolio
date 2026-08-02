"use client";

import { useState } from "react";
import type { Language, SeriesPart } from "@/lib/content/schema";

/**
 * The five-part narrative series — depth 2 of the three depths on a paper
 * page. A casual visitor reads part one and leaves satisfied; a researcher
 * scrolls past all of it to the PDF.
 *
 * Both languages are rendered into the HTML and one is hidden, rather than
 * swapped in by script. On a static export that keeps both versions
 * crawlable and means the toggle cannot leave a reader with a blank page if
 * JavaScript never arrives — the English is simply already there.
 */
export function SeriesReader({
  en,
  bn,
  title,
}: {
  en: SeriesPart[];
  bn: SeriesPart[];
  title: string;
}) {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <section aria-labelledby="series" className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <h2
          id="series"
          className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
        >
          {title}
        </h2>
        <div role="group" aria-label="Language" className="flex gap-4">
          {(
            [
              ["en", "English"],
              ["bn", "বাংলা"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              lang={value}
              aria-pressed={language === value}
              onClick={() => setLanguage(value)}
              className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline aria-pressed:text-neutral-950 aria-pressed:underline focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:text-neutral-50 dark:aria-pressed:text-neutral-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {(
        [
          ["en", en],
          ["bn", bn],
        ] as const
      ).map(([value, parts]) => (
        <div key={value} lang={value} hidden={language !== value}>
          {parts.map((part) => (
            <article
              key={part.part}
              className="border-b border-neutral-200 py-10 last:border-b-0 dark:border-neutral-800"
            >
              <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
                {value === "bn" ? "পর্ব" : "Part"} {part.part}
              </p>
              <h3 className="mt-2 font-serif text-2xl leading-snug text-balance">
                {part.title}
              </h3>
              {part.standfirst && (
                <p className="mt-2 text-sm text-neutral-500">
                  {part.standfirst}
                </p>
              )}
              <div className="mt-5 flex flex-col gap-4">
                {part.blocks.map((block, index) =>
                  block.type === "heading" ? (
                    <h4
                      key={index}
                      className="mt-2 font-medium text-[15px] tracking-tight"
                    >
                      {block.text}
                    </h4>
                  ) : (
                    <p
                      key={index}
                      className="text-[17px] leading-[1.75] text-neutral-800 dark:text-neutral-200"
                    >
                      {block.text}
                    </p>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}

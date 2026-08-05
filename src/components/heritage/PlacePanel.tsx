import Link from "next/link";
import type { Place, PlaceFormat } from "@/lib/content/schema";
import { formatDate } from "@/lib/dates";

/**
 * What is held for a place.
 *
 * Clicking a pin must not drop the visitor into a heavy 3D scene — they may
 * only be checking what is there. So this is a light panel: name, district,
 * period, one line, and a card for every format. A place with three formats
 * shows three cards; a place with one shows one, and the map's pin weight
 * says the same thing before the panel is even opened.
 *
 * Formats that exist but are not on the site yet are shown as held rather
 * than hidden. Hiding them would make the archive look smaller than it is;
 * pretending they were live would be a claim the site cannot support.
 */

const FORMAT_LABEL: Record<PlaceFormat["kind"], string> = {
  tour: "360° tour",
  mesh: "Mesh",
  splat: "Gaussian splat",
  photographs: "Photographs",
  comparison: "Comparison",
  paper: "Paper",
};

function FormatCard({ format }: { format: PlaceFormat }) {
  const counts = format.counts
    ? [
        format.counts.panoramas && `${format.counts.panoramas} panoramas`,
        format.counts.hotspots &&
          `${format.counts.hotspots.toLocaleString("en-GB")} hotspots`,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  const body = (
    <>
      <span className="font-mono text-[11px] tracking-widest text-neutral-500 uppercase">
        {FORMAT_LABEL[format.kind]}
        {format.status === "pending" && " · held, not yet published"}
      </span>
      <span className="mt-1 block text-[15px]">{format.label.en}</span>
      {counts && (
        <span className="mt-1 block font-mono text-xs text-neutral-500">
          {counts}
        </span>
      )}
      {format.capturedAt && (
        <span className="mt-1 block font-mono text-xs text-neutral-500">
          captured {formatDate(format.capturedAt)}
        </span>
      )}
      {format.note && (
        <span className="mt-2 block text-sm text-neutral-600 dark:text-neutral-400">
          {format.note}
        </span>
      )}
    </>
  );

  const className =
    "block rounded border border-neutral-200 p-3 dark:border-neutral-800";

  if (format.href) {
    return (
      <a
        href={format.href}
        target="_blank"
        rel="noreferrer"
        className={`${className} hover:border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:border-neutral-600`}
      >
        {body}
        <span className="mt-2 block text-sm underline underline-offset-4">
          Open ↗
        </span>
      </a>
    );
  }

  return <div className={`${className} opacity-70`}>{body}</div>;
}

export function PlacePanel({
  place,
  headingLevel = "h3",
}: {
  place: Place;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <div>
      <Heading className="font-serif text-2xl leading-tight text-balance">
        {place.name.en}
      </Heading>
      <p className="mt-1 font-mono text-xs tracking-widest text-neutral-500 uppercase">
        {place.district.en}
        {place.period && ` · ${place.period}`}
      </p>
      <p lang="bn" className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {place.name.bn} · {place.district.bn}
      </p>

      <p className="mt-4 text-[15px] leading-relaxed">{place.summary.en}</p>

      <ul className="mt-5 flex flex-col gap-2">
        {place.formats.map((format, index) => (
          <li key={`${format.kind}-${index}`}>
            <FormatCard format={format} />
          </li>
        ))}
      </ul>

      <p className="mt-4">
        <Link
          href={`/heritage/places/${place.slug}/`}
          className="text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Everything held for {place.name.en} →
        </Link>
      </p>
    </div>
  );
}

/**
 * Date formatting.
 *
 * Dates arrive as plain `YYYY-MM-DD` strings and are formatted in UTC. Doing
 * it any other way would let the build machine's timezone shift a date by a
 * day — which on this site would silently change a capture date or the day
 * an exhibition closed, and those are the claims the whole thing rests on.
 */

const FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const FORMAT_NO_YEAR = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

/**
 * A run of dates: "21 December 2024 – 19 January 2025", collapsing the year
 * when both ends share one. Returns null when no start date was recorded —
 * an exhibition page states plainly that dates are unknown rather than
 * inventing a plausible range.
 */
export function formatRun(start?: string, end?: string): string | null {
  if (!start) return null;
  if (!end) return formatDate(start);

  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const from = sameYear
    ? FORMAT_NO_YEAR.format(new Date(`${start}T00:00:00Z`))
    : formatDate(start);

  return `${from} – ${formatDate(end)}`;
}

/** "closed nineteen months ago" is a claim with a shelf life; this is not. */
export function year(iso: string): string {
  return iso.slice(0, 4);
}

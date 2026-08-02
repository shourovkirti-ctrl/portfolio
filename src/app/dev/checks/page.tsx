import type { Metadata } from "next";
import { ChecksRunner } from "./ChecksRunner";
import { exhibitions, papers, places } from "@/lib/content";

export const metadata: Metadata = {
  title: "Checks",
  robots: { index: false, follow: false },
};

/**
 * Instrumented test route.
 *
 * Everything here reports as plain text on purpose. Verifying 3D work by
 * screenshot is unreliable — the browser pane has to be visible to composite
 * a frame — so load, parse, dedup, memory and frame timing are printed
 * instead, and a failure is a line beginning with ✗.
 *
 * This checks that things are *correct*. Whether they *look* right is a
 * separate judgement and belongs to a person. See docs/TECHNICAL_PLAN.md §4.
 */
/**
 * Content assertions, run at build rather than in the browser.
 *
 * These are things that can only be wrong once — a place whose coordinates
 * put it in India, a paper pointing at a place that does not exist — and
 * they belong in the prerendered text so a failure is visible without
 * JavaScript running at all.
 */
function contentChecks(): { ok: boolean; name: string; detail: string }[] {
  const out: { ok: boolean; name: string; detail: string }[] = [];
  const add = (ok: boolean, name: string, detail: string) =>
    out.push({ ok, name, detail });

  const slugs = new Set(places.map((place) => place.slug));
  const orphaned = papers.filter(
    (paper) => paper.relatedPlace && !slugs.has(paper.relatedPlace),
  );
  add(
    orphaned.length === 0,
    "paper → place",
    orphaned.length === 0
      ? `${papers.length} papers, every relatedPlace resolves`
      : `unresolved: ${orphaned.map((p) => p.relatedPlace).join(", ")}`,
  );

  // Two pins on the same coordinates means one of them was copied and not
  // corrected — invisible on the page, obvious on the map.
  const positions = new Map<string, string>();
  const collisions: string[] = [];
  for (const place of places) {
    const key = `${place.lat.toFixed(3)},${place.lng.toFixed(3)}`;
    const existing = positions.get(key);
    if (existing) collisions.push(`${existing} / ${place.slug}`);
    else positions.set(key, place.slug);
  }
  add(
    collisions.length === 0,
    "pin positions",
    collisions.length === 0
      ? `${places.length} places, no two on the same point`
      : `overlapping: ${collisions.join(", ")}`,
  );

  const records = places.reduce((n, place) => n + place.formats.length, 0);
  const live = places.reduce(
    (n, place) =>
      n + place.formats.filter((format) => format.status === "live").length,
    0,
  );
  add(
    true,
    "records",
    `${records} formats across ${places.length} places · ${live} live, ${records - live} held`,
  );

  const undated = exhibitions.filter((e) => !e.startDate).length;
  add(
    true,
    "exhibitions",
    `${exhibitions.length} recorded · ${undated} with no dates on file`,
  );

  return out;
}

export default function ChecksPage() {
  const content = contentChecks();
  const failures = content.filter((check) => !check.ok).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-mono text-sm tracking-widest text-neutral-500 uppercase">
        Checks
      </h1>

      <pre className="mt-6 overflow-x-auto font-mono text-sm leading-relaxed">
        {content
          .map(
            (check) =>
              `${check.ok ? "✓" : "✗"} ${check.name.padEnd(18)} ${check.detail}`,
          )
          .join("\n")}
        {"\n\n"}
        {failures === 0
          ? `OK — ${content.length} content checks passed.`
          : `FAILED — ${failures} of ${content.length} content checks.`}
      </pre>

      <ChecksRunner />
    </div>
  );
}

"use client";

import { projectRounded, VIEWBOX } from "@/lib/map/projection";
import { OUTLINE_PATH } from "@/lib/map/outline";
import type { Place } from "@/lib/content/schema";

/**
 * The map of Bangladesh, with a pin per place.
 *
 * Custom SVG rather than Google Maps or Mapbox: those are heavy, generic,
 * and impose their own styling on a page that has its own. See
 * docs/DESIGN_PLAN.md §5.
 *
 * The map is never the only way in. It is paired with a list that carries
 * the same places and the same hover state, because a map-only interface
 * cannot be used by keyboard or screen reader — so this SVG is marked
 * `aria-hidden` and every pin is a plain `<circle>` with no tab stop. The
 * list beside it does the accessible work, and hovering either highlights
 * both.
 */

/** Pin radius by how many formats a place holds. One format, one small pin. */
function radiusFor(formats: number): number {
  return 4 + Math.min(formats, 4) * 1.9;
}

export function BangladeshMap({
  places,
  activeSlug,
  onHover,
  onSelect,
}: {
  places: Place[];
  activeSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={OUTLINE_PATH}
        className="fill-neutral-100 stroke-neutral-300 dark:fill-neutral-900 dark:stroke-neutral-700"
        strokeWidth={1.5}
      />

      {places.map((place) => {
        const { x, y } = projectRounded(place.lng, place.lat);
        const active = place.slug === activeSlug;
        const r = radiusFor(place.formats.length);

        return (
          <g
            key={place.slug}
            onPointerEnter={() => onHover(place.slug)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onSelect(place.slug)}
            className="cursor-pointer"
          >
            {/* A generous invisible target — the visible pin is small. */}
            <circle cx={x} cy={y} r={Math.max(r + 8, 14)} fill="transparent" />
            {active && (
              <circle
                cx={x}
                cy={y}
                r={r + 5}
                className="fill-none stroke-neutral-950 dark:stroke-neutral-50"
                strokeWidth={1}
                opacity={0.5}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              className={
                active
                  ? "fill-neutral-950 dark:fill-neutral-50"
                  : "fill-neutral-500/70 dark:fill-neutral-400/70"
              }
            />
          </g>
        );
      })}
    </svg>
  );
}

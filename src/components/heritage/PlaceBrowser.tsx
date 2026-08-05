"use client";

import { useMemo, useState } from "react";
import { BangladeshMap } from "./BangladeshMap";
import { PlacePanel } from "./PlacePanel";
import type { Place, PlaceKind } from "@/lib/content/schema";

/**
 * Map and list, sharing one selection.
 *
 * The list is not a fallback for the map — it is the accessible primary, and
 * the map is the browsable view of the same data. Hovering either highlights
 * both; selecting either opens the panel. On a narrow screen the map becomes
 * a header and the list carries the tab, which is why the layout stacks
 * rather than sitting them side by side at every width.
 */

const FILTERS: { value: PlaceKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "archaeological", label: "Archaeological" },
  { value: "mosque", label: "Mosques" },
  { value: "zamindar-palace", label: "Zamindar palaces" },
  { value: "national-memory", label: "National memory" },
  { value: "museum", label: "Museums" },
  { value: "literary", label: "Literary" },
  { value: "civic", label: "Civic" },
  { value: "nature", label: "Nature" },
];

export function PlaceBrowser({ places }: { places: Place[] }) {
  const [filter, setFilter] = useState<PlaceKind | "all">("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? places : places.filter((p) => p.kind === filter)),
    [places, filter],
  );

  const available = useMemo(
    () => new Set(places.map((place) => place.kind)),
    [places],
  );

  const active = hovered ?? selected;
  const openPlace = visible.find((place) => place.slug === selected) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span
          id="place-filter-label"
          className="font-mono text-xs tracking-widest text-neutral-500 uppercase"
        >
          Filter
        </span>
        <div
          role="group"
          aria-labelledby="place-filter-label"
          className="flex flex-wrap gap-x-4 gap-y-1"
        >
          {FILTERS.filter(
            (option) =>
              option.value === "all" ||
              available.has(option.value as PlaceKind),
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className="text-sm text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline aria-pressed:text-neutral-950 aria-pressed:underline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-neutral-400 dark:hover:text-neutral-50 dark:aria-pressed:text-neutral-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="order-2 md:order-1">
          <div className="mx-auto max-w-[340px] md:max-w-none">
            <BangladeshMap
              places={visible}
              activeSlug={active}
              onHover={setHovered}
              onSelect={setSelected}
            />
          </div>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-neutral-500">
            Pin weight is the number of formats held for a place, not its
            importance. The outline is placeholder geometry and will be
            replaced with surveyed boundary data.
          </p>
        </div>

        <div className="order-1 md:order-2">
          <ul className="flex flex-col">
            {visible.map((place) => (
              <li key={place.slug}>
                <button
                  type="button"
                  onPointerEnter={() => setHovered(place.slug)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(place.slug)}
                  onBlur={() => setHovered(null)}
                  onClick={() =>
                    setSelected(selected === place.slug ? null : place.slug)
                  }
                  aria-expanded={selected === place.slug}
                  className={`flex w-full items-baseline gap-3 border-b border-neutral-200 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-neutral-800 ${
                    active === place.slug
                      ? "text-neutral-950 dark:text-neutral-50"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <span className="flex-1 text-[15px]">{place.name.en}</span>
                  <span className="font-mono text-xs text-neutral-500">
                    {place.district.en}
                  </span>
                  <span
                    className="font-mono text-xs text-neutral-500 tabular-nums"
                    title={`${place.formats.length} formats held`}
                  >
                    {place.formats.length}
                  </span>
                </button>

                {selected === place.slug && (
                  <div className="border-b border-neutral-200 py-6 dark:border-neutral-800">
                    <PlacePanel place={place} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          {visible.length === 0 && (
            <p className="text-sm text-neutral-500">
              Nothing under that filter yet.
            </p>
          )}

          <p className="mt-4 font-mono text-[11px] text-neutral-500">
            {visible.length} places ·{" "}
            {visible.reduce((n, place) => n + place.formats.length, 0)} records
            {openPlace ? "" : " · select a place to see what is held"}
          </p>
        </div>
      </div>
    </div>
  );
}

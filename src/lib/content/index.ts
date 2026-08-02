import placesJson from "../../../content/places.json";
import exhibitionsJson from "../../../content/exhibitions.json";
import papersJson from "../../../content/papers.json";
import ranirSnanghatEn from "../../../content/series/ranir-snanghat.en.json";
import ranirSnanghatBn from "../../../content/series/ranir-snanghat.bn.json";
import vishnuSteleEn from "../../../content/series/vishnu-stele.en.json";
import vishnuSteleBn from "../../../content/series/vishnu-stele.bn.json";
import {
  Exhibition,
  Paper,
  Place,
  Series,
  type Language,
} from "./schema";

/**
 * Every collection, parsed once.
 *
 * Content is imported at build time and never fetched at runtime — the site
 * is a static export, so a page either has its text in the HTML or the text
 * does not exist for a search engine or a screen reader. Parsing here rather
 * than trusting the JSON means a schema change that content has not caught
 * up with fails the build, in the same way scripts/validate-content.mjs does
 * before it.
 */

export const places: Place[] = Place.array()
  .parse(placesJson)
  .sort((a, b) => a.name.en.localeCompare(b.name.en));

export const exhibitions: Exhibition[] = Exhibition.array()
  .parse(exhibitionsJson)
  // Most recent first, and those without a date last — an exhibition whose
  // dates were never recorded should not be guessed into the sequence.
  .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));

export const papers: Paper[] = Paper.array().parse(papersJson);

const SERIES = {
  "ranir-snanghat": {
    en: Series.parse(ranirSnanghatEn),
    bn: Series.parse(ranirSnanghatBn),
  },
  "vishnu-stele": {
    en: Series.parse(vishnuSteleEn),
    bn: Series.parse(vishnuSteleBn),
  },
} as const;

export function getSeries(slug: string, language: Language) {
  return SERIES[slug as keyof typeof SERIES]?.[language];
}

export function getPlace(slug: string): Place | undefined {
  return places.find((place) => place.slug === slug);
}

export function getExhibition(slug: string): Exhibition | undefined {
  return exhibitions.find((exhibition) => exhibition.slug === slug);
}

export function getPaper(slug: string): Paper | undefined {
  return papers.find((paper) => paper.slug === slug);
}

/** Papers written about a given place, for that place's panel. */
export function papersAbout(placeSlug: string): Paper[] {
  return papers.filter((paper) => paper.relatedPlace === placeSlug);
}

/**
 * How deeply a place is documented. Pin weight on the map encodes this, so
 * the map says not only where but how much — see docs/DESIGN_PLAN.md §5.
 */
export function documentationDepth(place: Place): number {
  return place.formats.length;
}

/** The strip on the Heritage landing, in the order it should read. */
export const featuredPlaces: Place[] = places
  .filter((place) => place.featured)
  .sort((a, b) => documentationDepth(b) - documentationDepth(a));

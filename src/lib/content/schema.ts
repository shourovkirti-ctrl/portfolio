import { z } from "zod";

/**
 * Content schemas.
 *
 * These run at build time (see scripts/validate-content.mjs). A malformed
 * record fails the build rather than rendering broken text to a visitor —
 * which matters most for the sculpture catalogue, where a few hundred
 * hand-entered rows guarantee some typos.
 *
 * Bilingual rule (docs/DESIGN_PLAN.md §10): structured records carry both
 * languages as fields, because one object with two labels is still one
 * object. Long-form prose lives in separate per-language MDX files instead.
 */

/**
 * The two languages.
 *
 * The interface is English; long-form content is bilingual with a per-article
 * toggle. Bengali goes where it matters — the stories about Bangladeshi
 * heritage, written for Bangladeshi readers — rather than onto navigation
 * labels. See docs/DESIGN_PLAN.md §10.
 */
export const Language = z.enum(["en", "bn"]);
export type Language = z.infer<typeof Language>;

/** A label that exists in both languages. */
export const Bilingual = z.object({
  bn: z.string().min(1),
  en: z.string().min(1),
});
export type Bilingual = z.infer<typeof Bilingual>;

/** An id in the asset registry. Pages reference these, never file paths. */
export const AssetId = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9-]+)?$/, {
    message: "asset id must be lowercase kebab-case, optionally id:variant",
  });

/**
 * A position inside a 360° tour: which panorama, and where to look.
 * 3DVista accepts these directly as URL parameters, so a sculpture can link
 * to the exact spot it stood in.
 */
export const TourPosition = z.object({
  tour: z.string().min(1),
  panorama: z.string().min(1),
  yaw: z.number().min(-360).max(360),
  pitch: z.number().min(-90).max(90),
});

export const Material = z.enum([
  "bronze",
  "wood",
  "stone",
  "fibre",
  "terracotta",
  "metal",
  "mixed",
]);

/** One work from the 6th National Sculpture Exhibition, 2024. */
export const Sculpture = z.object({
  /** Catalogue number as printed in the exhibition catalogue. */
  id: z.number().int().positive(),
  title: Bilingual,
  artist: Bilingual,
  /** Year of birth, where the catalogue records it. */
  artistBorn: z.number().int().min(1900).max(2020).optional(),
  material: Material,
  /** As printed, e.g. "91 × 91 × 40 cm". Free text because the catalogue is. */
  dimensions: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  asset: AssetId.optional(),
  tour: TourPosition.optional(),
});
export type Sculpture = z.infer<typeof Sculpture>;

/** What we hold for a place, beyond the tour itself. */
export const PlaceFormat = z.object({
  kind: z.enum(["tour", "mesh", "splat", "photographs", "comparison", "paper"]),
  label: Bilingual,
  /** External tours and papers link out; models resolve through the registry. */
  href: z.string().url().optional(),
  asset: AssetId.optional(),
  capturedAt: z.string().date().optional(),
  /** Panorama and hotspot counts, where a tour's scale is worth stating. */
  counts: z
    .object({
      panoramas: z.number().int().positive().optional(),
      hotspots: z.number().int().positive().optional(),
    })
    .optional(),
  /** One line, only where the format needs explaining. */
  note: z.string().max(240).optional(),
  /**
   * `pending` means the record exists but is not on this site yet — the
   * capture is held, the asset pipeline has not run. The panel shows it as
   * held-not-published rather than pretending it is missing, because the
   * count of formats is what pin weight encodes.
   */
  status: z.enum(["live", "pending"]).default("live"),
});
export type PlaceFormat = z.infer<typeof PlaceFormat>;

/** Filters the map offers. Kept small; a filter per place is not a filter. */
export const PlaceKind = z.enum([
  "archaeological",
  "mosque",
  "zamindar-palace",
  "literary",
  "national-memory",
  "nature",
  "museum",
  "civic",
]);
export type PlaceKind = z.infer<typeof PlaceKind>;

/** A pin on the map. */
export const Place = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: Bilingual,
  district: Bilingual,
  /**
   * Real coordinates, not viewBox units.
   *
   * The plan originally stored positions in the map's own coordinate space,
   * which would have pinned every place to one particular drawing of the
   * country — redrawing the SVG would silently move all twenty-odd pins off
   * their sites. Latitude and longitude are the verifiable fact; the map
   * projects them (src/lib/map/projection.ts), so the outline can be
   * replaced without touching content.
   */
  lat: z.number().min(20).max(27),
  lng: z.number().min(87).max(93),
  kind: PlaceKind,
  period: z.string().optional(),
  summary: Bilingual,
  formats: z.array(PlaceFormat).min(1),
  /** Shown in the featured strip on the Heritage landing. */
  featured: z.boolean().default(false),
});
export type Place = z.infer<typeof Place>;

/** An exhibition — always past, always over. */
export const Exhibition = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: Bilingual,
  institution: Bilingual,
  venue: Bilingual.optional(),
  /**
   * Only recorded when known. An exhibition page states that it has ended
   * and survives only in the archive, so a guessed date would be a claim
   * the site cannot support — leave it out instead.
   */
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  /** Named artist, where the exhibition was one person's work. */
  artist: Bilingual.optional(),
  tourUrl: z.string().url().optional(),
  counts: z
    .object({
      panoramas: z.number().int().positive().optional(),
      works: z.number().int().positive().optional(),
      halls: z.number().int().positive().optional(),
    })
    .optional(),
  /** One paragraph on what it was. English only until the Bengali is written. */
  summary: z.string().min(1),
  /** What he built for it, in the exhibition's own terms. */
  contribution: z.string().optional(),
  /**
   * Where the claim can be checked from outside this site. The site's whole
   * argument is verifiability, so an exhibition with no external evidence
   * says so rather than quietly reading like the others.
   */
  evidence: z
    .array(
      z.object({
        label: z.string().min(1),
        /**
         * Omitted where the source is real but has no stable URL to hand.
         * A citation without a link is honest; a guessed link is not, and on
         * a site whose whole argument is verifiability a dead or invented
         * href does more damage than no href at all.
         */
        href: z.string().url().optional(),
      }),
    )
    .default([]),
  /** Set when there is nothing external to point at, and say why. */
  evidenceNote: z.string().optional(),
});
export type Exhibition = z.infer<typeof Exhibition>;

export const PhotoSegment = z.enum([
  "portrait",
  "street",
  "nature-and-bird",
  "bird-eye-view",
  "fashion-studio",
]);

/**
 * A photograph. EXIF is read from the file by the asset pipeline, never
 * typed by hand.
 */
export const Photograph = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().optional(),
  segment: PhotoSegment,
  /** Order within its segment. */
  order: z.number().int().nonnegative(),
  asset: AssetId,
  exif: z
    .object({
      camera: z.string().optional(),
      lens: z.string().optional(),
      shutter: z.string().optional(),
      aperture: z.string().optional(),
      iso: z.number().int().positive().optional(),
      focalLength: z.string().optional(),
    })
    .optional(),
  /** Present only where someone else took the photograph. */
  credit: z.string().optional(),
});
export type Photograph = z.infer<typeof Photograph>;

export const Capability = z.enum([
  "3d-animation",
  "product-photography",
  "virtual-tour",
  "arch-viz",
  "product-render",
]);

/** A commercial client. Names are the asset here, so they are required. */
export const Client = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  year: z.number().int().min(2010).max(2100).optional(),
  capabilities: z.array(Capability).min(1),
  /** One line each. Business visitors scan; they do not read. */
  brief: z.string().max(200),
  delivered: z.string().max(200),
  assets: z.array(AssetId).default([]),
  externalUrl: z.string().url().optional(),
});
export type Client = z.infer<typeof Client>;

/** A paper. Preprints are called preprints until they are not. */
export const Paper = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  /** For the index and page heading, where the full title is unreadable. */
  shortTitle: z.string().min(1),
  kind: z.enum(["preprint", "report", "peer-reviewed"]),
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/),
  publishedAt: z.string().date(),
  pdfUrl: z.string().url(),
  licence: z.string().default("CC BY 4.0"),
  /** Plain-language line for the index. Not the paper's own abstract. */
  summary: z.string().min(1),
  /** The object the paper is about, so the reader can rotate it. */
  subjectAsset: AssetId.optional(),
  /**
   * Where the model can be seen today. The site will host its own once the
   * asset pipeline runs; until then this is the honest link.
   */
  subjectModelUrl: z.string().url().optional(),
  /** What the model is, in one line — shown beside the viewer. */
  subjectLabel: z.string().optional(),
  relatedPlace: z.string().optional(),
  /** Slug of the narrative series in content/series/, when one exists. */
  series: z.string().regex(/^[a-z0-9-]+$/).optional(),
  /** Numbers worth stating plainly: image counts, mesh size, resolutions. */
  figures: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
    .default([]),
});
export type Paper = z.infer<typeof Paper>;

/**
 * One part of a narrative series — depth 2 of the three depths on a paper
 * page (docs/DESIGN_PLAN.md §8).
 *
 * Written as .docx and imported by scripts/import-series.mjs, never edited
 * here. Blocks rather than markdown so nothing has to be parsed at runtime
 * and no prose is ever passed through dangerouslySetInnerHTML.
 */
export const SeriesBlock = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("heading"),
    level: z.number().int().min(1).max(6),
    text: z.string().min(1),
  }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
]);
export type SeriesBlock = z.infer<typeof SeriesBlock>;

export const SeriesPart = z.object({
  part: z.number().int().positive(),
  title: z.string().min(1),
  /** The line naming the series and the position in it. */
  standfirst: z.string().optional(),
  blocks: z.array(SeriesBlock).min(1),
});
export type SeriesPart = z.infer<typeof SeriesPart>;

export const Series = z.array(SeriesPart);

export const Collections = {
  sculptures: z.array(Sculpture),
  places: z.array(Place),
  exhibitions: z.array(Exhibition),
  photographs: z.array(Photograph),
  clients: z.array(Client),
  papers: z.array(Paper),
} as const;

export type CollectionName = keyof typeof Collections;

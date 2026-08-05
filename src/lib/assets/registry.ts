import { z } from "zod";
import registryJson from "../../../assets/registry.json";

/**
 * The asset registry.
 *
 * One file, one URL per asset, referenced by id. The point is that the same
 * model is needed in several places — Paharpur appears in the Photography
 * bridge and again in the Heritage comparison — and if each page referenced
 * it by path, the same bytes would sit at two URLs and the browser would
 * download them twice. Ids resolve here instead.
 *
 * Filenames are content-hashed and immutable, so they can be cached forever.
 */

const Lod = z.object({
  url: z.string().min(1),
  bytes: z.number().int().positive(),
  /** Gaussian count for splats, triangle count for meshes. */
  primitives: z.number().int().positive().optional(),
});

/**
 * Where a capture sits and how big it is, measured by the pipeline.
 *
 * Without this a viewer has to guess, and the guess is either inside the
 * terrain or a kilometre from it — for every scene, separately. The centre
 * is a median and the radius comes from a standard deviation rather than
 * the bounding box, because reconstruction always leaves a few stray splats
 * far from the subject and the extremes would frame those instead.
 */
const Frame = z.object({
  center: z.tuple([z.number(), z.number(), z.number()]),
  radius: z.number().positive(),
});

const AssetEntry = z.object({
  type: z.enum(["splat", "mesh", "image", "video", "panorama"]),
  /** lod0 is the light variant, lod1 the full one. Images use lod0 only. */
  lod0: Lod,
  lod1: Lod.optional(),
  /** Shown immediately while the real asset streams. Never a blank screen. */
  poster: z.string().optional(),
  capturedAt: z.string().optional(),
  source: z.string().optional(),
  credit: z.string().optional(),
  frame: Frame.optional(),
});

export const Registry = z.record(z.string(), AssetEntry);

export type AssetEntry = z.infer<typeof AssetEntry>;
export type Lod = z.infer<typeof Lod>;
export type LodName = "lod0" | "lod1";

const registry: Record<string, AssetEntry> = Registry.parse(registryJson);

export class UnknownAssetError extends Error {
  constructor(id: string) {
    super(
      `Unknown asset "${id}". Add it to assets/registry.json — pages must ` +
        `never reference asset paths directly.`,
    );
    this.name = "UnknownAssetError";
  }
}

export function getAsset(id: string): AssetEntry {
  const entry = registry[id];
  if (!entry) throw new UnknownAssetError(id);
  return entry;
}

/**
 * Resolve an id to a concrete variant. Falls back to lod0 when the requested
 * level does not exist, so a caller asking for full detail on an asset that
 * only has one variant still gets something rather than throwing.
 */
export function resolveAsset(id: string, lod: LodName = "lod0"): Lod {
  const entry = getAsset(id);
  return (lod === "lod1" ? entry.lod1 : entry.lod0) ?? entry.lod0;
}

export function assetPoster(id: string): string | undefined {
  return getAsset(id).poster;
}

/**
 * Whether an asset is actually reachable from a deployed build.
 *
 * The pipeline writes processed files to two places: a canonical copy beside
 * the repo that will be uploaded to R2, and a gitignored copy under
 * `public/local/` so the dev server can serve it today. A `/local/` URL in
 * the registry therefore means "processed, but not published yet" — the
 * bytes exist on one machine and nowhere else.
 *
 * Pages check this before mounting a viewer. Rendering one anyway would put
 * "the model could not be loaded" on a live page, which is a broken site
 * rather than an honest one; the text layer alone is the correct output
 * until the bucket exists.
 */
export function isPublished(id: string): boolean {
  return !resolveAsset(id).url.startsWith("/local/");
}

/** Every id, for the build-time checks. */
export function allAssetIds(): string[] {
  return Object.keys(registry);
}

/**
 * Total bytes a route would pull, used by the weight budget check.
 * See docs/TECHNICAL_PLAN.md §6 — budgets fail the build, they do not warn.
 */
export function weightOf(ids: string[], lod: LodName = "lod0"): number {
  const seen = new Set<string>();
  let total = 0;
  for (const id of ids) {
    if (seen.has(id)) continue; // counted once, matching how the browser caches
    seen.add(id);
    total += resolveAsset(id, lod).bytes;
  }
  return total;
}

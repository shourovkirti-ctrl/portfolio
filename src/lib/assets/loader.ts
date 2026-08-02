"use client";

import { resolveAsset, type LodName } from "./registry";

/**
 * Client-side asset loading with deduplication.
 *
 * The browser already caches by URL, which stops the same file being fetched
 * twice. It does not stop the same file being *parsed* twice — two components
 * showing the same model on one page would each decode it onto the GPU. This
 * cache is keyed by id:lod and holds the in-flight promise, so concurrent
 * callers share one fetch and one parse.
 */

type CacheKey = `${string}:${LodName}`;

const inFlight = new Map<CacheKey, Promise<ArrayBuffer>>();
const resolved = new Map<CacheKey, ArrayBuffer>();

/** Counters read by /dev/checks to prove deduplication actually happens. */
const stats = {
  fetches: new Map<CacheKey, number>(),
  hits: new Map<CacheKey, number>(),
};

function bump(map: Map<CacheKey, number>, key: CacheKey) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function loadAsset(
  id: string,
  lod: LodName = "lod0",
): Promise<ArrayBuffer> {
  const key: CacheKey = `${id}:${lod}`;

  const already = resolved.get(key);
  if (already) {
    bump(stats.hits, key);
    return Promise.resolve(already);
  }

  const pending = inFlight.get(key);
  if (pending) {
    bump(stats.hits, key);
    return pending;
  }

  const { url } = resolveAsset(id, lod);
  bump(stats.fetches, key);

  const request = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${id} (${lod}): ${response.status} from ${url}`);
      }
      return response.arrayBuffer();
    })
    .then((buffer) => {
      resolved.set(key, buffer);
      inFlight.delete(key);
      return buffer;
    })
    .catch((error) => {
      // Leave nothing cached on failure, so a retry can genuinely retry.
      inFlight.delete(key);
      throw error;
    });

  inFlight.set(key, request);
  return request;
}

/**
 * Warm the cache for something the visitor is about to need. Used when they
 * reach Bird Eye View in Photography, since the bridge lands on Paharpur —
 * the transition is then instant, and if they continue into Heritage the
 * asset is already there.
 */
export function prefetchAsset(id: string, lod: LodName = "lod0"): void {
  const key: CacheKey = `${id}:${lod}`;
  if (resolved.has(key) || inFlight.has(key)) return;
  void loadAsset(id, lod).catch(() => {
    // A prefetch that fails is not an error the visitor should ever see.
  });
}

export function releaseAsset(id: string, lod: LodName = "lod0"): void {
  resolved.delete(`${id}:${lod}`);
}

export function loaderStats() {
  const rows = new Set([...stats.fetches.keys(), ...stats.hits.keys()]);
  return [...rows].map((key) => ({
    key,
    fetches: stats.fetches.get(key) ?? 0,
    cacheHits: stats.hits.get(key) ?? 0,
    bytes: resolved.get(key)?.byteLength ?? 0,
  }));
}

export function resetLoader() {
  inFlight.clear();
  resolved.clear();
  stats.fetches.clear();
  stats.hits.clear();
}

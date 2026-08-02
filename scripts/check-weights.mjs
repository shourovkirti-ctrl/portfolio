#!/usr/bin/env node
/**
 * Route weight budget.
 *
 * "Optimise later" is unmeasurable; a number is not. Every tab landing must
 * come in under 500 KB on first load, and a 3D experience under 15 MB — see
 * docs/TECHNICAL_PLAN.md §6. Nothing on the site loads a model yet, so today
 * this enforces the first figure only, and the second becomes real when the
 * asset pipeline runs.
 *
 * Reads the static export in out/, so it measures what is actually served
 * rather than what the bundler reported. Run after `next build`:
 *
 *   node scripts/check-weights.mjs
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "out");

/** Bytes. First load = the HTML plus every script and stylesheet it pulls. */
const BUDGET = 500_000;

/** One route per shape — the rest share a template and a bundle. */
const ROUTES = [
  "/",
  "/heritage/",
  "/heritage/exhibitions/",
  "/heritage/exhibitions/sculpture-2024/",
  "/heritage/places/somapura-mahavihara/",
  "/research/",
  "/research/ranir-snanghat/",
  "/photography/",
  "/commercial/",
  "/about/",
];

if (!existsSync(out)) {
  console.error("out/ not found — run `next build` first.");
  process.exit(1);
}

const kb = (n) => `${(n / 1000).toFixed(0)} KB`;

/** Formats that arrive compressed already and are not compressed again. */
const PRECOMPRESSED = new Set([
  ".woff2",
  ".woff",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".mp4",
  ".webm",
  ".ico",
]);

/**
 * What the visitor actually downloads.
 *
 * Cloudflare serves text assets brotli-compressed, so measuring the file on
 * disk would fail a budget that in reality has plenty of room — and, worse,
 * would make a genuine regression invisible under the noise. Compressing
 * here matches what goes over the wire closely enough to hold a budget to.
 */
function transferSize(path) {
  const bytes = statSync(path).size;
  if (PRECOMPRESSED.has(extname(path).toLowerCase())) return bytes;
  return brotliCompressSync(readFileSync(path), {
    params: { [constants.BROTLI_PARAM_QUALITY]: 5 },
  }).length;
}

let failed = false;

for (const route of ROUTES) {
  const htmlPath = join(out, route, "index.html");
  if (!existsSync(htmlPath)) {
    console.error(`  ✗ ${route.padEnd(42)} no index.html in out/`);
    failed = true;
    continue;
  }

  const html = readFileSync(htmlPath, "utf8");
  let total = transferSize(htmlPath);

  // Every asset the document references from our own origin, counted once —
  // the browser caches by URL, so a chunk shared with another route is still
  // one download the first time this route is the entry point.
  const seen = new Set();
  for (const match of html.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)) {
    const url = match[1];
    if (seen.has(url)) continue;
    seen.add(url);
    const assetPath = join(out, decodeURIComponent(url));
    if (existsSync(assetPath)) total += transferSize(assetPath);
  }

  const ok = total <= BUDGET;
  if (!ok) failed = true;
  console.log(
    `  ${ok ? "✓" : "✗"} ${route.padEnd(42)} ${kb(total).padStart(7)}` +
      ` of ${kb(BUDGET)} · ${seen.size} assets`,
  );
}

console.log(
  failed
    ? "\nFAILED — a route is over its first-load budget."
    : "\nOK — every route is inside its first-load budget.",
);
process.exit(failed ? 1 : 0);

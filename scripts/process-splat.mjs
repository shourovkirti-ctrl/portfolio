#!/usr/bin/env node
/**
 * Gaussian splat pipeline: one capture in, two LODs out, registry updated.
 *
 *   node scripts/process-splat.mjs <id> <input.ply>
 *   node scripts/process-splat.mjs matiranga "1_Content/Edited/Matiranga_GS.ply.ply"
 *
 * Polycam exports a float PLY of every Gaussian it solved — Matiranga is
 * 1.73 million splats and 118 MB, which no phone will render and nobody in
 * Dhaka should be asked to download. Two levels come out of it:
 *
 *   lod0   ~80,000 splats   mobile, and the first thing any visitor gets
 *   lod1  ~250,000 splats   desktop, once the light one is already on screen
 *
 * Both are .sog — PlayCanvas's compressed container: a zip of WebP-packed
 * attribute textures, read natively by Spark. SPZ was the obvious first
 * choice and is the format the plan names, but splat-transform writes SPZ v4
 * uncompressed while Spark's reader still expects the gzip-wrapped v2, so a
 * v4 file fails at load with "Invalid gzip header". SOG is also smaller —
 * 1.0 MB against 1.45 MB for the same 80,000 splats.
 *
 * The budgets are not advisory. If an output comes back over its splat count
 * or over its byte ceiling, this exits non-zero rather than writing it.
 *
 * Output goes to two places on purpose:
 *   _portfolio-assets/processed/splats/   the canonical copy, uploaded to R2
 *   public/local/splats/                  gitignored, so `npm run dev` can
 *                                         serve it before R2 exists
 *
 * See docs/TECHNICAL_PLAN.md §1 and §3.
 */

import { execFileSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  statSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Lives beside the repo, never inside it. */
const PROCESSED = resolve(root, "..", "_portfolio-assets", "processed", "splats");
/** Served by the dev server. Gitignored — nothing large goes into git. */
const LOCAL = resolve(root, "public", "local", "splats");

const LODS = [
  { name: "lod0", splats: 80_000, maxBytes: 5_000_000 },
  { name: "lod1", splats: 250_000, maxBytes: 15_000_000 },
];

const args = process.argv.slice(2);

/**
 * Polycam, COLMAP and Metashape all hand over Z-up. `--up y` is the escape
 * hatch for a capture that already arrives in Three's convention.
 */
const upFlag = args.indexOf("--up");
const upAxis = upFlag === -1 ? "z" : args.splice(upFlag, 2)[1];
if (upAxis !== "z" && upAxis !== "y") {
  console.error(`--up must be z or y, got "${upAxis}"`);
  process.exit(1);
}

const [id, inputArg] = args;

if (!id || !inputArg) {
  console.error(
    "usage: node scripts/process-splat.mjs <asset-id> <input.ply> [--up z|y]\n" +
      "  asset-id should match the place slug in content/places.json",
  );
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error(`"${id}" is not a valid asset id — lowercase kebab-case only.`);
  process.exit(1);
}

const input = resolve(root, inputArg);
if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

mkdirSync(PROCESSED, { recursive: true });
mkdirSync(LOCAL, { recursive: true });

const mb = (n) => `${(n / 1e6).toFixed(1)} MB`;

/**
 * Splat count from a PLY header. Read rather than assumed, because the
 * decimation target is only meaningful next to the number it started from.
 */
function plySplatCount(path) {
  const head = Buffer.alloc(4096);
  const fd = readFileSync(path, { flag: "r" }).subarray(0, 4096);
  head.set(fd);
  const text = head.toString("latin1");
  return Number(/element vertex\s+(\d+)/.exec(text)?.[1] ?? 0);
}

/**
 * The installed CLI, run through node directly.
 *
 * Not `npx`: on Windows that is a .cmd shim, and Node refuses to spawn one
 * without a shell — which would then need the paths quoting, and every path
 * here contains a space.
 */
const CLI = resolve(
  root,
  "node_modules",
  "@playcanvas",
  "splat-transform",
  "bin",
  "cli.mjs",
);

function splatTransform(args, capture = false) {
  return execFileSync(process.execPath, [CLI, ...args], {
    stdio: capture ? ["ignore", "pipe", "inherit"] : ["ignore", "inherit", "inherit"],
    encoding: "utf8",
    cwd: root,
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * Splat count and framing, read back from the written file rather than
 * assumed from the target.
 *
 * The framing matters as much as the count. A viewer that has to guess where
 * a capture sits either starts inside the terrain or a kilometre away from
 * it, and the guess would have to be made again for every scene. The centre
 * is the median rather than the midpoint of the bounding box, and the radius
 * comes from the standard deviation rather than the extremes, because a
 * handful of stray splats a hundred metres off — and reconstruction always
 * leaves some — would otherwise push the camera back until the subject is a
 * dot.
 */
function describe(path) {
  const out = splatTransform([path, "null", "--stats", "json", "--quiet"], true);
  const json = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
  if (typeof json.numGaussians !== "number") {
    throw new Error(`no splat count in --stats for ${basename(path)}: ${out}`);
  }

  const data = json.stats?.[0]?.data;
  const round = (n) => Math.round(n * 100) / 100;
  const frame = data
    ? {
        center: [round(data.median[0]), round(data.median[1]), round(data.median[2])],
        radius: round(
          1.6 * Math.hypot(data.stdDev[0], data.stdDev[1], data.stdDev[2]),
        ),
      }
    : undefined;

  return { count: json.numGaussians, frame };
}

const sourceCount = plySplatCount(input);
console.log(
  `${id}\n  source ${basename(input)} — ` +
    `${sourceCount.toLocaleString("en-GB")} splats, ${mb(statSync(input).size)}\n`,
);

// Clear this id's previous outputs, so a stale hash never lingers beside a
// new one and gets served by accident.
for (const dir of [PROCESSED, LOCAL]) {
  for (const file of readdirSync(dir)) {
    if (file.startsWith(`${id}.`)) rmSync(join(dir, file));
  }
}

const entry = { type: "splat", source: "polycam" };
let failed = false;

for (const lod of LODS) {
  const decimated = join(PROCESSED, `${id}.${lod.name}.tmp.ply`);
  const scratch = join(PROCESSED, `${id}.${lod.name}.tmp.sog`);

  // Two passes, because the tool requires --decimate to be the last action
  // and to write a .ply. So: clean and decimate first, then reorder and
  // compress.
  //
  // -N before decimating — a single NaN splat poisons the error metric the
  // adaptive decimator allocates removals by.
  //
  // -r 90,0,0 turns the capture's Z-up into Three.js's Y-up. Baking the
  // correction into the asset, once and offline, is the whole point: every
  // viewer downstream can then assume Y-up rather than each one carrying a
  // per-asset special case.
  //
  // The sign is +90 and not -90: the tool rotates the other way round from
  // the textbook matrix, and -90 lands the terrain upside down — verified
  // against Matiranga, whose ground sits at low Z and hills at high Z.
  splatTransform([
    input,
    "-N",
    ...(upAxis === "z" ? ["-r", "90,0,0"] : []),
    "-d",
    String(lod.splats),
    decimated,
    "--overwrite",
  ]);

  // -m puts the survivors in Morton order, so splats that are near each
  // other in space are near each other in memory. That is what makes the
  // renderer's depth sort cheap once the data is on the GPU.
  splatTransform([decimated, "-m", scratch, "--overwrite"]);
  rmSync(decimated);

  const bytes = statSync(scratch).size;
  const { count, frame } = describe(scratch);

  const hash = createHash("sha256")
    .update(readFileSync(scratch))
    .digest("hex")
    .slice(0, 8);
  const filename = `${id}.${hash}.${lod.name}.sog`;

  copyFileSync(scratch, join(PROCESSED, filename));
  copyFileSync(scratch, join(LOCAL, filename));
  rmSync(scratch);

  const overCount = count > lod.splats * 1.02;
  const overBytes = bytes > lod.maxBytes;
  if (overCount || overBytes) failed = true;

  console.log(
    `  ${overCount || overBytes ? "✗" : "✓"} ${lod.name}  ` +
      `${count.toLocaleString("en-GB").padStart(9)} splats  ${mb(bytes).padStart(8)}  ` +
      `${filename}` +
      (overCount ? `\n      OVER: budget is ${lod.splats.toLocaleString("en-GB")} splats` : "") +
      (overBytes ? `\n      OVER: budget is ${mb(lod.maxBytes)}` : ""),
  );

  entry[lod.name] = {
    url: `/local/splats/${filename}`,
    bytes,
    primitives: count,
  };

  // Framing is a property of the capture, not of a level of detail — both
  // LODs describe the same hillside. Taken from the light one, which is
  // enough to place a camera and cheaper to read back.
  if (lod.name === "lod0" && frame) entry.frame = frame;
}

if (failed) {
  console.error(
    "\nFAILED — an output is over budget. Nothing was written to the registry.",
  );
  process.exit(1);
}

// The registry is generated, never hand-edited. Merging rather than
// rewriting keeps the other ids intact when one capture is reprocessed.
const registryPath = resolve(root, "assets", "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
registry[id] = { ...registry[id], ...entry };
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");

console.log(
  `\nOK — registry updated. URLs point at /local/ and are served by the dev\n` +
    `server only; they become R2 URLs when the bucket exists.`,
);

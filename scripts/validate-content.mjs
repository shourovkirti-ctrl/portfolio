#!/usr/bin/env node
/**
 * Validates every content file and the asset registry against their schemas,
 * then checks that every asset id referenced by content actually exists.
 *
 * Runs before build. A malformed record stops the build rather than
 * rendering broken text to a visitor — which matters most for the sculpture
 * catalogue, where a few hundred hand-entered rows guarantee some typos.
 */

// Run with `node --import tsx scripts/validate-content.mjs` (see npm scripts)
// so the TypeScript schema module can be imported directly.

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const { Collections } = await import(
  pathToFileURL(resolve(root, "src/lib/content/schema.ts")).href
);

const FILES = [
  ["sculptures", "content/sculptures.json"],
  ["places", "content/places.json"],
  ["exhibitions", "content/exhibitions.json"],
  ["photographs", "content/photographs.json"],
  ["clients", "content/clients.json"],
  ["papers", "content/papers.json"],
];

let failed = false;
const referenced = new Set();
const counts = {};

function fail(where, message) {
  failed = true;
  console.error(`  ✗ ${where}\n    ${message}`);
}

// Collect asset ids from anywhere in a record, so a new field carrying an
// asset reference is covered without updating this script.
function collectAssetIds(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach(collectAssetIds);
  for (const [key, value] of Object.entries(node)) {
    if (key === "asset" && typeof value === "string") referenced.add(value);
    else if (key === "assets" && Array.isArray(value))
      value.forEach((v) => typeof v === "string" && referenced.add(v));
    else if (key === "subjectAsset" && typeof value === "string")
      referenced.add(value);
    else collectAssetIds(value);
  }
}

console.log("content");
for (const [name, relative] of FILES) {
  const path = resolve(root, relative);
  if (!existsSync(path)) {
    console.log(`  · ${name} — not created yet`);
    counts[name] = 0;
    continue;
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(relative, `invalid JSON — ${error.message}`);
    continue;
  }
  const result = Collections[name].safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) {
      fail(relative, `${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    continue;
  }
  counts[name] = result.data.length;
  collectAssetIds(result.data);
  console.log(`  ✓ ${name} — ${result.data.length} records`);
}

console.log("\nassets");
const registryPath = resolve(root, "assets/registry.json");
let registryIds = new Set();
if (!existsSync(registryPath)) {
  fail("assets/registry.json", "missing");
} else {
  try {
    const registry = JSON.parse(readFileSync(registryPath, "utf8"));
    registryIds = new Set(Object.keys(registry));
    console.log(`  ✓ registry — ${registryIds.size} assets`);
  } catch (error) {
    fail("assets/registry.json", `invalid JSON — ${error.message}`);
  }
}

const missing = [...referenced].filter((id) => !registryIds.has(id));
if (missing.length) {
  fail(
    "asset references",
    `content references ids that are not in the registry: ${missing.join(", ")}`,
  );
} else if (referenced.size) {
  console.log(`  ✓ all ${referenced.size} referenced ids resolve`);
} else {
  console.log("  · no assets referenced by content yet");
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(
  failed
    ? "\nFAILED — fix the above before building."
    : `\nOK — ${total} records across ${Object.keys(counts).length} collections.`,
);
process.exit(failed ? 1 : 0);

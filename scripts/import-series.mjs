#!/usr/bin/env node
/**
 * Imports the five-part narrative series that accompany each paper.
 *
 * The source is twenty .docx files sitting outside the repo, in the folder
 * where they were written. They are read once and committed as JSON, so the
 * build never depends on that folder existing — a machine that only has the
 * repo can still build the site. Re-run this when a series is edited.
 *
 * Depth 2 of the three depths on a paper page (docs/DESIGN_PLAN.md §8): the
 * paper is for researchers, the series is for the curious reader, and both
 * live on the same page as the object they are about.
 *
 *   node --import tsx scripts/import-series.mjs
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readDocx } from "./lib/docx.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Where the author writes. Not in the repo, and not required to build. */
const SOURCE_ROOT = resolve(root, "..", "Research paper writer");

/**
 * Which folder holds which series. Keyed by paper slug so a series always
 * resolves from the paper it belongs to.
 */
const SERIES = [
  { slug: "ranir-snanghat", folder: "Ranir Snanghat" },
  { slug: "vishnu-stele", folder: "Vishnu Stele" },
];

/** Folder name per language, as the author named them. */
const LANGUAGE_FOLDERS = { en: "English", bn: "বাংলা" };

/**
 * Part number and title out of a filename such as
 * `Part 3 - How We Scanned a Building With 876 Photographs.docx` or
 * `পর্ব 3 - ৮৭৬টি ছবি দিয়ে একটি ভবন যেভাবে স্ক্যান করলাম.docx`.
 */
function parseFilename(name) {
  const match = /^(?:Part|পর্ব)\s*(\d+)\s*[-–—]\s*(.+)\.docx$/u.exec(name);
  if (!match) return null;
  return { part: Number(match[1]), title: match[2].trim() };
}

if (!existsSync(SOURCE_ROOT)) {
  console.error(
    `Source folder not found: ${SOURCE_ROOT}\n` +
      "Nothing to import. The committed JSON under content/series/ is what " +
      "the build uses, so this is only an error if you meant to re-import.",
  );
  process.exit(1);
}

const outDir = resolve(root, "content/series");
mkdirSync(outDir, { recursive: true });

let wrote = 0;
let failed = false;

for (const { slug, folder } of SERIES) {
  for (const [language, languageFolder] of Object.entries(LANGUAGE_FOLDERS)) {
    const dir = join(SOURCE_ROOT, folder, languageFolder);
    if (!existsSync(dir)) {
      console.error(`  ✗ ${slug}.${language} — missing folder ${dir}`);
      failed = true;
      continue;
    }

    const parts = [];
    for (const file of readdirSync(dir).sort()) {
      if (!file.endsWith(".docx") || file.startsWith("~$")) continue;
      const parsed = parseFilename(file);
      if (!parsed) {
        console.error(`  ✗ ${file} — filename does not name a part`);
        failed = true;
        continue;
      }
      const blocks = readDocx(join(dir, file));

      // Each document opens with "Part 3 — <title>" and then a standfirst
      // line naming the series and the position in it. The page renders both
      // from structured fields, so carrying them as body text would print
      // everything twice.
      const body = [...blocks];
      let standfirst;

      if (
        body[0]?.type === "heading" &&
        /^(?:Part|পর্ব)\s*[\d০-৯]+\b/u.test(body[0].text)
      ) {
        body.shift();
      }
      if (body[0]?.type === "paragraph" && body[0].text.includes("·")) {
        standfirst = body.shift().text;
      }

      parts.push({ part: parsed.part, title: parsed.title, standfirst, blocks: body });
    }

    parts.sort((a, b) => a.part - b.part);

    if (parts.length === 0) {
      console.error(`  ✗ ${slug}.${language} — no parts found in ${dir}`);
      failed = true;
      continue;
    }

    const path = join(outDir, `${slug}.${language}.json`);
    writeFileSync(path, `${JSON.stringify(parts, null, 2)}\n`, "utf8");
    wrote += 1;

    const words = parts.reduce(
      (total, p) =>
        total +
        p.blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0),
      0,
    );
    console.log(
      `  ✓ ${slug}.${language} — ${parts.length} parts, ` +
        `${parts.reduce((n, p) => n + p.blocks.length, 0)} blocks, ~${words} words`,
    );
  }
}

console.log(
  failed
    ? "\nFAILED — some series did not import."
    : `\nOK — wrote ${wrote} series files to content/series/.`,
);
process.exit(failed ? 1 : 0);

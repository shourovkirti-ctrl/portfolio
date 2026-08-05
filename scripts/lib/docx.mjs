/**
 * Minimal .docx reader.
 *
 * A .docx is a zip holding `word/document.xml`. We only need paragraphs and
 * their heading level, so rather than take a dependency on a full parser we
 * unzip with the platform's own tooling and pull the runs out with regex.
 *
 * This is deliberately narrow: it handles the twenty narrative-series files
 * in `Research paper writer/`, which are plain prose with headings. If a
 * future document uses tables, footnotes or images, this will silently drop
 * them — so the importer prints a block count for every file it writes, and
 * a suspiciously short one is the signal to look.
 */

import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

/**
 * Reads one entry out of a zip archive.
 *
 * Walks the central directory rather than shelling out: Windows'
 * `Expand-Archive` refuses any extension other than `.zip`, and a docx is
 * small enough that reading the whole file into memory costs nothing.
 */
function readZipEntry(zipPath, entry) {
  const zip = readFileSync(zipPath);

  // End of central directory record — scan back from the end, since it is
  // followed only by an optional comment.
  let eocd = -1;
  for (let i = zip.length - 22; i >= 0; i--) {
    if (zip.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(`${zipPath}: not a zip file`);

  const count = zip.readUInt16LE(eocd + 10);
  let offset = zip.readUInt32LE(eocd + 16);

  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`${zipPath}: corrupt central directory`);
    }
    const method = zip.readUInt16LE(offset + 10);
    const compressedSize = zip.readUInt32LE(offset + 20);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const localOffset = zip.readUInt32LE(offset + 42);
    const name = zip.toString("utf8", offset + 46, offset + 46 + nameLength);

    if (name === entry) {
      // The local header repeats the name and extra fields, and its extra
      // field length can differ from the central one — read it from there.
      const localName = zip.readUInt16LE(localOffset + 26);
      const localExtra = zip.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localName + localExtra;
      const body = zip.subarray(start, start + compressedSize);
      const data = method === 0 ? body : inflateRawSync(body);
      return data.toString("utf8");
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  throw new Error(`${zipPath}: no entry "${entry}"`);
}

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
};

function decode(text) {
  return text
    .replace(/&(?:amp|lt|gt|quot|apos);/g, (m) => ENTITIES[m])
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    );
}

/**
 * Text of one `<w:p>`.
 *
 * Walks `<w:t>`, `<w:tab/>` and `<w:br/>` in document order rather than
 * stripping tags, because a paragraph's text is split across runs wherever
 * Word changed formatting mid-sentence, and everything between those runs
 * has to be discarded rather than flattened into the text.
 */
function paragraphText(xml) {
  let out = "";
  const tokens =
    /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/?>|<w:br\b[^>]*\/?>/g;
  for (const token of xml.matchAll(tokens)) {
    if (token[1] !== undefined) out += decode(token[1]);
    else if (token[0].startsWith("<w:tab")) out += "\t";
    else out += "\n";
  }
  return out.replace(/[ \t]+/g, " ").trim();
}

/**
 * Reads a .docx into blocks: `{ type: "heading" | "paragraph", level?, text }`.
 *
 * Heading level comes from the paragraph style name (`Heading1`, `Title`).
 * Word writes some headings in these files as ordinary paragraphs with every
 * run bold, so that case is detected too — otherwise part titles and section
 * breaks would arrive as body text.
 */
export function readDocx(path) {
  const xml = readZipEntry(path, "word/document.xml");
  const body = xml.match(/<w:body>([\s\S]*)<\/w:body>/)?.[1] ?? "";
  const blocks = [];

  for (const match of body.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)) {
    const inner = match[1];
    const text = paragraphText(inner);
    if (!text) continue;

    const style = inner.match(/<w:pStyle\s+w:val="([^"]+)"/)?.[1] ?? "";
    const headingLevel = /^Heading(\d)$/.exec(style)?.[1];

    if (style === "Title") {
      blocks.push({ type: "heading", level: 1, text });
    } else if (headingLevel) {
      blocks.push({ type: "heading", level: Number(headingLevel), text });
    } else {
      const runs = [...inner.matchAll(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g)];
      const allBold =
        runs.length > 0 && runs.every((r) => /<w:b\b[^>]*\/?>/.test(r[0]));
      // A short, fully bold paragraph is a heading Word never styled as one.
      if (allBold && text.length < 120) {
        blocks.push({ type: "heading", level: 2, text });
      } else {
        blocks.push({ type: "paragraph", text });
      }
    }
  }

  return blocks;
}

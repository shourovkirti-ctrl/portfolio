# Technical Development Plan

Working document for building the portfolio. Written 2 August 2026.

**Division of work**: Claude does all technical development. The human developer reviews PRs and handles hosting/deployment. If the build proves reliable, the human developer may not be needed at all.

Design decisions live in the planning memory (`portfolio_plan.md`). This file covers **how it gets built** — file layout, asset pipeline, testing, and deployment.

---

## 1. Where things live

Three locations, and the split matters.

### 1.1 In the repo (git)

Only what is small, textual, or needed at build time.

```
0_Portfolio/
  src/app/                 routes
  src/components/          UI + 3D components
  src/lib/                 loaders, asset registry, i18n
  content/                 all content (see content model)
  public/
    map/bangladesh.svg     the custom map
    posters/               poster frames, < 300 KB each
    thumbs/                index thumbnails, < 150 KB each
    og/                    social share images
  docs/                    this file, decisions
  scripts/                 asset pipeline, validators, importers
```

**Hard rule: no file over ~2 MB in git.** No splats, no meshes, no full-resolution photographs, no video. GitHub degrades badly past that and the human reviewer cannot review a binary diff.

### 1.2 Local working directory (NOT in git)

Sits beside the repo. This is where raw captures and processed output live on the machine.

```
C:\1 Cluade enviornment\_portfolio-assets\
  source/                  originals — NEVER modified, NEVER overwritten
    splats/                .ply / .spz straight from Polycam
    meshes/                .obj / .glb from Metashape
    photos/                full-resolution originals with EXIF intact
    video/                 1080p pulls from Behance, any original renders
    panoramas/             stills extracted from 360 tours
  processed/               build output, uploaded to the CDN
    splats/                decimated + compressed, per LOD
    meshes/                Draco/Meshopt compressed .glb
    images/                webp/avif at defined widths
    video/                 loops (< 1 MB) and full 1080p
  manifests/               generated registry fragments
```

Separating `source/` from `processed/` is not tidiness — it means a bad conversion is always recoverable. Processing reads from `source/` and writes to `processed/`; it never writes back.

### 1.3 CDN / object storage — Cloudflare R2 (decided)

**Cloudflare R2.** S3-compatible, 10 GB stored free permanently, and critically **no egress fees at any volume** — which is the deciding factor when a single visitor may pull 15–40 MB of splats and video. Egress is where object storage normally becomes expensive; on R2 it is zero.

Estimated total for this site: roughly 600 MB (≈130 MB of compressed sculpture meshes, ≈100 MB of splats, ≈60 MB of images and posters, ≈300 MB of video). That is well inside the free allowance, with room to grow.

Everything in `processed/` is uploaded with **content-hashed, immutable filenames** so it can be cached forever:

```
https://assets.<domain>/splats/paharpur.a1b2c3.lod1.spz
```

**No large binaries are served from the site host** — only from R2.

---

## 2. The asset registry

Single file, single source of URLs. Pages reference **ids**, never paths — this is what prevents the same model being downloaded twice under two names.

`/assets/registry.json`

```json
{
  "paharpur-splat": {
    "type": "splat",
    "lod0": { "url": ".../paharpur.a1b2c3.lod0.spz", "splats": 80000,  "bytes": 4200000 },
    "lod1": { "url": ".../paharpur.a1b2c3.lod1.spz", "splats": 250000, "bytes": 14800000 },
    "poster": "/posters/paharpur.jpg",
    "capturedAt": "2025-11-12",
    "source": "polycam"
  }
}
```

Loader contract:
- `getAsset(id, lod)` returns a URL
- a module-level `Map` caches the **parsed** resource by `id:lod`, so the same model used twice on one page is parsed once
- `prefetch(id, lod)` for known-next assets (e.g. Paharpur when the visitor reaches Bird Eye View)

---

## 3. Asset pipeline

All CLI, all runnable by Claude via Bash, all reproducible from `source/`.

| Asset | Tool | Output |
|---|---|---|
| Gaussian splats | SuperSplat / `splat-transform` | `.spz` (or `.sog`) at 2 LODs — ~250K desktop, ~80K mobile |
| Meshes | `gltf-transform` (Draco + Meshopt) | compressed `.glb`, plus a decimated LOD |
| Photographs | `sharp` | AVIF + WebP at 640/1280/2048; **EXIF read here and written into content JSON** |
| Video | `ffmpeg` | 3–5 s silent loop < 1 MB (WebM + MP4) and full 1080p MP4 |
| Panorama stills | `ffmpeg` / `sharp` | flat frames from 360 tiles for the Venus opening image |

Setup prerequisites to confirm on the machine: `ffmpeg` on PATH, `sharp` via npm, `gltf-transform` via npx.

Each script writes a manifest fragment; `scripts/build-registry.mjs` merges them into `registry.json`. **The registry is generated, never hand-edited.**

Budget enforcement: the pipeline **fails** if any LOD exceeds its splat budget or any loop exceeds 1 MB. Budgets are not advisory.

---

## 4. How the 3D work gets verified

This is the part that needs stating honestly.

### 4.1 What Claude can verify

Programmatically, through the browser tools:

- **Assets load** — network requests, no 404s, actual transferred bytes vs registry
- **Parsing succeeded** — splat/vertex counts read back from the renderer
- **Draw calls and memory** — `renderer.info`, `performance.memory`
- **Frame timing** — a probe that samples `requestAnimationFrame` deltas and reports p50/p95
- **Camera state at checkpoints** — position, quaternion, fov dumped at defined scroll positions
- **Transition correctness** — progress 0→1 is monotonic, endpoints land where intended, no NaN in transforms
- **Console errors and WebGL warnings**
- **Dedup** — assert a given asset id was fetched exactly once and parsed exactly once
- **Text fallbacks** — that every 3D route renders real content with JS/WebGL disabled

### 4.2 What Claude cannot verify

**Whether it looks good.** Screenshots require the browser pane to be displayed and compositing; when it is hidden, capture times out (this already happened during research). Even with a screenshot, judgements about whether a dissolve feels right, whether the light pool reads as intended, or whether the bobbing looks alive rather than mechanical are aesthetic and belong to Shourov.

**Working assumption: Claude verifies correctness and performance; Shourov verifies feel.**

### 4.3 The instrumented test route

`/dev/checks` — dev-only, never shipped. Runs the assertions above and prints results as **plain text**, so they can be read with `get_page_text` rather than needing screenshots.

```
✓ paharpur:lod1  fetched 14.8 MB  parsed 250,113 splats  1 fetch  1 parse
✓ home ladder    5 stages         peak GPU 412 MB        p95 frame 14.2 ms
✗ forgotten-palace  restoration blend NaN at progress 0.62
```

A failing check is a red line in text. That is enough to debug without seeing the screen.

### 4.4 The scrub harness

`/dev/scrub?scene=home&t=0.42` — sets a transition to an exact progress value instead of requiring a real scroll.

This makes transitions testable: step `t` from 0 to 1 in increments, dump state at each step, assert the sequence. It also lets a specific broken frame be reproduced instantly instead of scrolling to find it.

### 4.5 Getting visual judgement to Shourov

When the browser pane is open, capture frames at `t = 0, 0.25, 0.5, 0.75, 1.0` from the scrub harness and send them for review. That is the bridge between numeric verification and aesthetic judgement — Claude confirms it *works*, Shourov confirms it *reads*.

For anything motion-based (bobbing rings, dissolves, the chandelier sweep), stills are not enough. Record a short screen capture, or Shourov opens the dev server locally and looks.

---

## 5. Rendering strategy

- **Static generation** for everything. All ~217 sculpture pages, all place pages, all exhibitions, prerendered at build with real text.
- 3D components are **client-only**, loaded with `next/dynamic` and `ssr: false`, mounted after first paint.
- Every 3D route ships a **server-rendered text layer** underneath — title, artist, material, description. This is simultaneously the accessibility fallback and the SEO content. Not two features; one.
- No client-side data fetching for content. Content is imported at build.

---

## 6. Build and deploy — Cloudflare Pages

**Cloudflare Pages**, not Vercel. Two reasons, both material:

1. **Vercel's free Hobby tier excludes commercial use.** This site lists clients and invites work, which puts it outside those terms; the fallback is $20/month. Cloudflare Pages permits commercial use on the free plan.
2. **Vercel's free bandwidth is capped at 100 GB/month**, then billed per GB. This is a heavy site — a visitor taking the full 3D route pulls 20–40 MB, so a few thousand visitors would exceed it. **Cloudflare Pages has no bandwidth limit on any tier.**

Cloudflare also has network presence in Bangladesh, which matters because most of the audience is there.

**This works because the site is fully static.** `next build` with `output: 'export'` deploys to Pages directly, with no adapter. Static export disables Next's image optimisation API and middleware — neither is needed, since images are already processed by our own `sharp` pipeline.

- `main` = production · `dev` = preview deployments
- Preview URL on every PR — how the reviewer checks changes, and how Shourov judges them visually
- The asset pipeline runs **locally**, not in CI: uploads to R2 are deliberate, and the registry is committed
- CI checks: typecheck, lint, zod content validation, route weight budget

### 6.2 The lockfile must cover Linux

Development happens on Windows; Cloudflare builds on Linux and runs `npm ci`, which refuses to install if the lockfile does not match `package.json` exactly. A plain `npm install` on Windows omits Linux-only optional dependencies — sharp's `@emnapi/*` packages, in this case — and the build then fails with "can only install packages when your package.json and package-lock.json are in sync".

**After adding or upgrading any dependency, regenerate the lockfile for all platforms:**

```
npm run relock      # npm install --package-lock-only --os=linux --cpu=x64
```

This keeps the win32, linux and darwin entries in one lockfile, so `npm ci` works both locally and on the build machine. Verify with `grep -c linux package-lock.json` before pushing.

### 6.1 Domain

**Build on the free `*.pages.dev` URL; buy the domain before launch.**

Changing domain later is technically trivial — Pages lets custom domains be added and removed freely, and static files do not care what host they sit on. The cost of a change is not technical, it is everything that already points at the old address: search indexing, links shared with clients or institutions, the URL written into ORCID or a Zenodo record, and — most importantly here — the ~217 sculpture pages, which are designed so artists can share a link to their own work. Moving those after they have been shared is the one genuinely rude outcome.

None of that cost exists yet, because nothing has been shared. So the free URL is fine through development and review, and the domain gets bought at launch, before anything is publicised.

**The engineering rule that makes this painless: never hardcode the domain.** All internal links are relative; the canonical origin lives in a single environment variable used for `sitemap.xml`, `robots.txt`, canonical tags and Open Graph URLs. Changing hosts is then a one-line change.

**Route weight budgets, enforced in CI:**

| Route | First load |
|---|---|
| any tab landing | < 500 KB |
| a 3D experience | < 15 MB desktop / < 5 MB mobile |

---

## 7. Build order

Follows the v1/v2/v3 phasing, but the foundations come first regardless.

**Phase 0 — foundations**
Asset registry + loader + dedup cache · content schemas and validation · i18n routing · the `/dev/checks` and `/dev/scrub` harnesses · the layout shell and navigation.
*Nothing visible ships, but everything after depends on it.*

**Phase 1 — v1**
Home (simple) · Heritage map + place panels · Research & Writing · About/Contact.
Needs almost nothing from Shourov — the tour links, DOIs and About copy already exist.

**Phase 2 — v2**
Photography (5 segments, the Paharpur bridge) · Commercial (index, client pages, video pipeline) · Paharpur mesh↔splat comparison.
Needs his curation: 40–60 images, client years, Behance asset pull.

**Phase 3 — v3**
Sculpture ring system · A Forgotten Palace · the full scale ladder on Home.
Needs his production: 217 catalogue rows, tour mapping, Blender reconstruction, coin scan.

---

## 8. Open technical items

- Confirm `ffmpeg` availability on the machine
- Create the Cloudflare account, the Pages project and the R2 bucket
- Decide the domain name (needed at launch, not before)
- Paharpur mesh↔splat **registration** — align in CloudCompare/Blender, bake the transform, verify by toggle. Runtime sync is trivial (one camera, two viewports via scissor test); alignment is the real work and it is offline.
- Build the tour-position capture helper (reads panorama + yaw + pitch from `window.tour.player`) — validates on the Venus statue first, then serves the 217 sculptures.

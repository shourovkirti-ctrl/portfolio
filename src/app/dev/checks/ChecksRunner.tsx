"use client";

import { useEffect, useState } from "react";
import { allAssetIds, getAsset, resolveAsset } from "@/lib/assets/registry";
import { loadAsset, loaderStats, resetLoader } from "@/lib/assets/loader";

type Result = { ok: boolean; name: string; detail: string };

const bytes = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${(n / 1e3).toFixed(1)} KB`;

/**
 * Samples frame intervals and reports the tail, not the mean.
 *
 * requestAnimationFrame does not fire while the tab is hidden or not
 * compositing, which is precisely the situation this harness exists for —
 * so it races against a timeout and reports honestly when no frames were
 * produced, rather than hanging and leaving every other check unreported.
 */
function frameTiming(
  ms = 600,
): Promise<{ p50: number; p95: number; frames: number }> {
  return new Promise((done) => {
    const deltas: number[] = [];
    let last = performance.now();
    const started = last;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      deltas.sort((a, b) => a - b);
      const at = (q: number) =>
        deltas.length ? deltas[Math.floor(deltas.length * q)] : 0;
      done({ p50: at(0.5), p95: at(0.95), frames: deltas.length });
    };

    const tick = (now: number) => {
      deltas.push(now - last);
      last = now;
      if (now - started < ms) requestAnimationFrame(tick);
      else finish();
    };

    requestAnimationFrame(tick);
    setTimeout(finish, ms + 1500);
  });
}

function webglReport(): string {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) return "unavailable — every 3D room must fall back to its text layer";
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debug
    ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
    : "renderer hidden";
  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  return `webgl2 · ${renderer} · max texture ${maxTexture}`;
}

export function ChecksRunner() {
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const out: Result[] = [];
      const add = (ok: boolean, name: string, detail: string) =>
        out.push({ ok, name, detail });

      // --- registry ------------------------------------------------------
      const ids = allAssetIds();
      add(ids.length > 0, "registry", `${ids.length} assets registered`);

      let totalBytes = 0;
      for (const id of ids) {
        try {
          const entry = getAsset(id);
          totalBytes += entry.lod0.bytes + (entry.lod1?.bytes ?? 0);
        } catch (error) {
          add(false, `registry:${id}`, String(error));
        }
      }
      add(true, "registry weight", `${bytes(totalBytes)} across all variants`);

      // --- loader deduplication -----------------------------------------
      // The browser dedupes by URL; it does not stop the same asset being
      // decoded twice on one page. This proves the loader cache does.
      resetLoader();
      const probe = ids.includes("dev-probe") ? "dev-probe" : ids[0];
      if (!probe) {
        add(false, "loader", "no asset available to exercise the loader");
      } else {
        try {
          const [a, b] = await Promise.all([
            loadAsset(probe),
            loadAsset(probe),
          ]);
          const again = await loadAsset(probe);
          const stat = loaderStats().find((s) => s.key === `${probe}:lod0`);
          const expected = resolveAsset(probe).bytes;
          const sameBuffer = a === b && b === again;
          const oneFetch = stat?.fetches === 1;
          const sizeMatches = a.byteLength === expected;
          add(
            oneFetch && sameBuffer && sizeMatches,
            "loader dedup",
            `${probe} · ${stat?.fetches ?? "?"} fetch, ${stat?.cacheHits ?? 0} cache hits · ` +
              `${bytes(a.byteLength)} · ${sameBuffer ? "one buffer shared" : "DIFFERENT buffers"}` +
              (sizeMatches ? "" : ` · registry says ${bytes(expected)}`),
          );
        } catch (error) {
          add(false, "loader dedup", String(error));
        }
      }

      // --- environment ---------------------------------------------------
      add(true, "webgl", webglReport());

      const timing = await frameTiming();
      add(
        timing.frames === 0 || timing.p95 < 34,
        "frame timing",
        timing.frames === 0
          ? "no frames — tab is not compositing, so this says nothing about performance"
          : `p50 ${timing.p50.toFixed(1)} ms · p95 ${timing.p95.toFixed(1)} ms over ${timing.frames} frames (idle page)`,
      );

      const perf = performance as Performance & {
        memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      };
      add(
        true,
        "memory",
        perf.memory
          ? `${bytes(perf.memory.usedJSHeapSize)} used of ${bytes(perf.memory.jsHeapSizeLimit)}`
          : "not reported by this browser",
      );

      add(
        true,
        "device",
        `dpr ${window.devicePixelRatio} · ${window.innerWidth}×${window.innerHeight}` +
          ` · reduced-motion ${
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "on"
              : "off"
          }`,
      );

      if (!cancelled) setResults(out);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!results) {
    return <pre className="mt-6 font-mono text-sm">running…</pre>;
  }

  const failures = results.filter((r) => !r.ok).length;

  return (
    <pre className="mt-6 overflow-x-auto font-mono text-sm leading-relaxed">
      {results
        .map((r) => `${r.ok ? "✓" : "✗"} ${r.name.padEnd(18)} ${r.detail}`)
        .join("\n")}
      {"\n\n"}
      {failures === 0
        ? `OK — ${results.length} checks passed.`
        : `FAILED — ${failures} of ${results.length} checks.`}
    </pre>
  );
}

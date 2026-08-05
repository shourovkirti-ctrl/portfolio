"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import { SplatFileType } from "@sparkjsdev/spark";
import { loadAsset } from "@/lib/assets/loader";
import { getAsset, resolveAsset, type LodName } from "@/lib/assets/registry";

/**
 * A Gaussian splat, rendered.
 *
 * Three rules from the plans are structural here rather than optional:
 *
 * 1. **The text underneath is not a fallback.** It is server-rendered by the
 *    caller and stays in the document whatever happens here — it is both the
 *    accessibility equivalent and the only thing a crawler can read off a
 *    WebGL canvas. So this component never renders content, only a canvas,
 *    and it fails quietly.
 * 2. **Never a blank screen.** The canvas carries a caption of its own state
 *    from the first frame: what is loading, how large it is, and — if it
 *    cannot load — that it could not, in words.
 * 3. **Never hijack the visitor.** The camera drifts, slowly, and stops the
 *    moment a pointer touches it. Under `prefers-reduced-motion` it does not
 *    drift at all; the scene is still there and still draggable.
 *
 * Which level of detail loads is decided from the device, not from a
 * viewport width: a phone gets the 80,000-splat version and a desktop the
 * 250,000-splat one. Both come through the shared loader, so an asset used
 * twice on a page is fetched once and decoded once.
 */

type Status =
  | { kind: "idle" }
  | { kind: "loading"; bytes: number }
  | { kind: "ready"; splats: number; bytes: number }
  | { kind: "unsupported" }
  | { kind: "failed"; reason: string };

function pickLod(): LodName {
  if (typeof navigator === "undefined") return "lod0";
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const slow = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  if (coarse || slow || (memory !== undefined && memory <= 4)) return "lod0";
  return "lod1";
}

function hasWebgl2(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const mb = (n: number) => `${(n / 1e6).toFixed(1)} MB`;

export function SplatViewer({
  id,
  className = "aspect-[16/10]",
}: {
  id: string;
  className?: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  /**
   * What this device gets, decided once.
   *
   * Resolved during render rather than in the effect so that "no WebGL" and
   * "downloading 3.4 MB" are the component's first painted state instead of
   * a second render immediately after mount. This component only ever runs
   * in a browser — it is imported with `ssr: false` — so touching navigator
   * and creating a probe canvas here is safe.
   */
  const setup = useMemo(() => {
    if (!hasWebgl2()) return { supported: false as const };
    const lod = pickLod();
    return {
      supported: true as const,
      lod,
      entry: getAsset(id),
      variant: resolveAsset(id, lod),
    };
  }, [id]);

  useEffect(() => {
    const mount = holder.current;
    if (!mount || !setup.supported) return;

    let disposed = false;
    const { lod, entry, variant } = setup;

    // Framing comes from the pipeline's own measurement of the capture, so
    // no scene needs a hand-tuned camera position.
    const frame = entry.frame ?? { center: [0, 0, 0], radius: 5 };
    const center = new THREE.Vector3(...frame.center);
    const distance = frame.radius * 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, frame.radius * 20);
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    mount.appendChild(renderer.domElement);

    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    // Orbit, written out rather than pulled from a controls library: the
    // design rule is that camera moves avoid roll and never zoom the visitor
    // somewhere they cannot get back from, which is a clamp on two angles
    // and nothing else.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let azimuth = Math.PI * 0.25;
    let polar = Math.PI * 0.36;
    let drifting = !reduced.matches;
    let dragging = false;
    let last = { x: 0, y: 0 };

    const place = () => {
      camera.position.set(
        center.x + distance * Math.sin(polar) * Math.cos(azimuth),
        center.y + distance * Math.cos(polar),
        center.z + distance * Math.sin(polar) * Math.sin(azimuth),
      );
      camera.up.set(0, 1, 0); // no roll, ever
      camera.lookAt(center);
    };
    place();

    const canvas = renderer.domElement;
    const onDown = (event: PointerEvent) => {
      dragging = true;
      drifting = false;
      last = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      azimuth -= (event.clientX - last.x) * 0.005;
      polar = Math.min(
        Math.PI * 0.49,
        Math.max(0.15, polar - (event.clientY - last.y) * 0.005),
      );
      last = { x: event.clientX, y: event.clientY };
      place();
    };
    const onUp = (event: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    // Sized from the element itself, immediately and then on every change.
    //
    // ResizeObserver alone is not enough: it does not report an initial size
    // in every environment, and a canvas that never gets sized stays at the
    // 300×150 default — the scene renders, but into a postage stamp stretched
    // across the page. So the size is applied once up front, again on window
    // resize, and again whenever the observer does fire.
    const applySize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    applySize();

    const resize = new ResizeObserver(applySize);
    resize.observe(mount);
    window.addEventListener("resize", applySize);

    // Only render while on screen. A canvas spinning in a scrolled-past
    // section is a phone battery being spent on nothing.
    let onScreen = true;
    const visibility = new IntersectionObserver(
      ([item]) => {
        onScreen = item.isIntersecting;
      },
      { rootMargin: "200px" },
    );
    visibility.observe(mount);

    let mesh: SplatMesh | undefined;
    let raf = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const delta = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (!onScreen) return;
      if (drifting) {
        azimuth += delta * 0.045;
        place();
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    // A test seam, development only.
    //
    // requestAnimationFrame does not fire when the page is not compositing,
    // which is the normal state of an automated browser — so "did anything
    // actually draw" cannot be answered by watching the render loop, and a
    // screenshot needs the very compositing that is missing. This renders one
    // frame synchronously and reads the pixels back before yielding, which
    // answers it in numbers instead. See docs/TECHNICAL_PLAN.md §4.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as Record<string, unknown>).__splatProbe = () => {
        renderer.render(scene, camera);
        const gl = renderer.getContext();
        const w = renderer.domElement.width;
        const h = renderer.domElement.height;
        const pixels = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let lit = 0;
        let sum = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const value = pixels[i] + pixels[i + 1] + pixels[i + 2];
          if (pixels[i + 3] > 8 && value > 24) lit += 1;
          sum += value;
        }
        return {
          width: w,
          height: h,
          litPixels: lit,
          litFraction: lit / (w * h),
          meanChannel: sum / (w * h * 3),
          cameraPosition: camera.position.toArray().map((n) => Math.round(n)),
        };
      };
    }

    loadAsset(id, lod)
      .then((bytes) => {
        if (disposed) return;
        mesh = new SplatMesh({
          fileBytes: bytes,
          // A .sog from the pipeline is a zip of WebP attribute textures —
          // PlayCanvas's SOGS bundle, which Spark calls PCSOGSZIP.
          fileType: SplatFileType.PCSOGSZIP,
          onLoad: () => {
            if (disposed) return;
            setStatus({
              kind: "ready",
              splats: variant.primitives ?? 0,
              bytes: variant.bytes,
            });
          },
        });
        scene.add(mesh);
      })
      .catch((error: unknown) => {
        if (disposed) return;
        setStatus({
          kind: "failed",
          reason: error instanceof Error ? error.message : String(error),
        });
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      window.removeEventListener("resize", applySize);
      visibility.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      mesh?.dispose();
      spark.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [id, setup]);

  // The effect only ever sets a *later* state; the first painted state is
  // derived here, so nothing renders an empty caption for one frame.
  const shown: Status = !setup.supported
    ? { kind: "unsupported" }
    : status.kind === "idle"
      ? { kind: "loading", bytes: setup.variant.bytes }
      : status;

  const caption =
    shown.kind === "loading"
      ? `loading ${mb(shown.bytes)}…`
      : shown.kind === "ready"
        ? `${shown.splats.toLocaleString("en-GB")} gaussians · ${mb(shown.bytes)} · drag to look around`
        : shown.kind === "unsupported"
          ? "this browser has no WebGL2 — the description below is the whole record"
          : shown.kind === "failed"
            ? "the model could not be loaded — the description below is the whole record"
            : "";

  return (
    <div>
      <div
        ref={holder}
        className={`${className} w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-900`}
      />
      <p
        aria-live="polite"
        className="mt-2 font-mono text-[11px] text-neutral-500"
      >
        {caption}
      </p>
    </div>
  );
}

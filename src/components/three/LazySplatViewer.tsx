"use client";

import dynamic from "next/dynamic";

/**
 * The viewer, kept out of everyone else's bundle.
 *
 * Three and Spark are together the largest thing on this site by a wide
 * margin, and no page that does not show a splat should pay for them. The
 * dynamic import with `ssr: false` means they are fetched only when a route
 * that uses this actually renders, and only in the browser — there is no
 * WebGL context on a build machine, and the static export must not try.
 *
 * The placeholder holds the exact space the canvas will take, so nothing on
 * the page moves when it arrives.
 */
export const LazySplatViewer = dynamic(
  () => import("./SplatViewer").then((module) => module.SplatViewer),
  {
    ssr: false,
    loading: () => (
      <div>
        <div className="aspect-[16/10] w-full rounded bg-neutral-100 dark:bg-neutral-900" />
        <p className="mt-2 font-mono text-[11px] text-neutral-500">
          preparing the viewer…
        </p>
      </div>
    ),
  },
);

import type { Metadata } from "next";
import { ChecksRunner } from "./ChecksRunner";

export const metadata: Metadata = {
  title: "Checks",
  robots: { index: false, follow: false },
};

/**
 * Instrumented test route.
 *
 * Everything here reports as plain text on purpose. Verifying 3D work by
 * screenshot is unreliable — the browser pane has to be visible to composite
 * a frame — so load, parse, dedup, memory and frame timing are printed
 * instead, and a failure is a line beginning with ✗.
 *
 * This checks that things are *correct*. Whether they *look* right is a
 * separate judgement and belongs to a person. See docs/TECHNICAL_PLAN.md §4.
 */
export default function ChecksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-mono text-sm tracking-widest text-neutral-500 uppercase">
        Checks
      </h1>
      <ChecksRunner />
    </div>
  );
}

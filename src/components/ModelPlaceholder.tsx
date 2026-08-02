/**
 * Where a 3D model will mount.
 *
 * The asset pipeline has not run, so nothing is being loaded here yet. This
 * is a deliberate hole with a label on it rather than a spinner that never
 * resolves or a stock image standing in for a scan — a site that argues for
 * verifiable records should not decorate the gap where a record will go.
 *
 * When the viewer lands it mounts in this slot with `next/dynamic` and
 * `ssr: false`, and the text beneath stays exactly where it is: it is both
 * the accessibility fallback and the only thing a crawler can read off a
 * WebGL canvas. See docs/TECHNICAL_PLAN.md §5.
 */
export function ModelPlaceholder({
  label,
  href,
  ratio = "aspect-[4/3]",
}: {
  label?: string;
  /** Where the model can be seen today, if anywhere. */
  href?: string;
  ratio?: string;
}) {
  return (
    <figure>
      <div
        className={`${ratio} flex items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900`}
      >
        <span className="font-mono text-[11px] tracking-widest text-neutral-400 uppercase">
          3D model — not yet on this site
        </span>
      </div>
      {(label || href) && (
        <figcaption className="mt-2 font-mono text-xs text-neutral-500">
          {label}
          {href && (
            <>
              {label && " · "}
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                see it where it is hosted ↗
              </a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

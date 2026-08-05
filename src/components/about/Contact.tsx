"use client";

import { useSyncExternalStore } from "react";

/**
 * Email and phone, assembled in the browser.
 *
 * He has chosen to publish his personal mobile, so the number is public by
 * decision rather than by accident. What is avoided here is the harvesting:
 * neither the address nor the number appears as a contiguous string in the
 * served HTML, so a scraper reading the static export finds nothing to take.
 * Anyone with a browser sees both immediately.
 *
 * Before the script runs, each line shows what it is and how to reveal it,
 * rather than an empty space — a visitor with JavaScript off should be told
 * plainly, not left wondering whether the page is broken.
 */

const EMAIL_PARTS = ["shourovkirti", "@", "gmail", ".", "com"];
const PHONE_PARTS = ["+880", " 1783", " 838138"];
const PHONE_DIGITS = "8801783838138";

/**
 * False while rendering on the server and through hydration, true after.
 *
 * The server-rendered HTML and the first client render have to agree, and
 * the whole point is that the HTML does not contain the address — so the
 * value has to flip after hydration rather than during it. `useSyncExternal-
 * Store` with a store that never changes is the way to say that without a
 * setState in an effect.
 */
const NEVER_CHANGES = () => () => {};

export function Contact() {
  const revealed = useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false,
  );

  const email = EMAIL_PARTS.join("");
  const phone = PHONE_PARTS.join("");

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
      <dt className="font-mono text-xs text-neutral-500">Email</dt>
      <dd>
        {revealed ? (
          <a
            href={`mailto:${email}`}
            className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {email}
          </a>
        ) : (
          <span className="text-neutral-500">
            shown once the page loads — JavaScript keeps it away from scrapers
          </span>
        )}
      </dd>

      <dt className="font-mono text-xs text-neutral-500">Phone</dt>
      <dd>
        {revealed ? (
          <>
            <a
              href={`tel:${PHONE_DIGITS}`}
              className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {phone}
            </a>
            <span className="text-neutral-500"> · </span>
            <a
              href={`https://wa.me/${PHONE_DIGITS}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              WhatsApp ↗
            </a>
          </>
        ) : (
          <span className="text-neutral-500">
            shown once the page loads
          </span>
        )}
      </dd>

      <dt className="font-mono text-xs text-neutral-500">WeChat</dt>
      <dd className="font-mono">khondokar_zobaed</dd>
    </dl>
  );
}

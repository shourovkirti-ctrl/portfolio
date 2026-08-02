"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, SITE_NAME } from "@/lib/site";

/**
 * Primary navigation. Deliberately plain — the site's weight is inside the
 * tabs, and a heavy chrome would compete with a scale ladder and a room you
 * have to find a light switch in.
 */
export function SiteNav() {
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-6 gap-y-2 px-6 py-4"
      >
        <Link
          href="/"
          className="mr-auto text-sm font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {SITE_NAME}
        </Link>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {TABS.filter((tab) => tab.href !== "/").map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isCurrent(tab.href) ? "page" : undefined}
                className="text-sm text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline aria-[current=page]:text-neutral-950 aria-[current=page]:underline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-neutral-400 dark:hover:text-neutral-50 dark:aria-[current=page]:text-neutral-50"
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

"use client";

import { useState } from "react";

export function GuestNav({
  primary,
  more,
}: {
  primary: { href: string; label: string }[];
  more: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Wedding"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[color-mix(in_srgb,var(--theme-text)_12%,transparent)] bg-[var(--theme-surface)] md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${primary.length + 1}, minmax(0, 1fr))` }}>
        {primary.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="flex flex-col items-center px-2 py-3 text-[11px] tracking-wide">
              {item.label}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="flex w-full flex-col items-center px-2 py-3 text-[11px] tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-expanded={open}
            aria-controls="wedding-more"
            onClick={() => setOpen((value) => !value)}
          >
            More
          </button>
        </li>
      </ul>
      <ul
        id="wedding-more"
        hidden={!open}
        className="border-t border-[color-mix(in_srgb,var(--theme-text)_12%,transparent)] px-4 py-3"
      >
        {more.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

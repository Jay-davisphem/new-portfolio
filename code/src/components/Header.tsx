"use client";

import type { NavigationItem } from "@/lib/portfolio/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconClose, IconHamburger } from "@/components/icons";

export function Header(props: {
  brand: string;
  navigation: NavigationItem[];
  primaryCta: { label: string; href: string };
}) {
  const [open, setOpen] = useState(false);

  // Close on Esc and lock body scroll.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <header className="pt-6">
      <div className="container-shell">
        <div className="surface flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-semibold tracking-tight">
              {props.brand}
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {props.navigation.map((item) => (
              <Link
                key={`${item.label}:${item.href}`}
                href={item.href}
                className="text-sm font-medium text-(--muted) hover:text-(--foreground)"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link className="btn-primary" href={props.primaryCta.href}>
              {props.primaryCta.label}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="btn-ghost"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconHamburger className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="surface mt-3 px-6 py-5 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-4">
              {props.navigation.map((item) => (
                <Link
                  key={`m:${item.label}:${item.href}`}
                  href={item.href}
                  className="text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link className="btn-primary w-full" href={props.primaryCta.href} onClick={() => setOpen(false)}>
                {props.primaryCta.label}
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}

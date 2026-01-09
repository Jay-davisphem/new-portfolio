import type { FooterColumn, FooterSocial } from "@/lib/portfolio/types";
import Link from "next/link";
import { SocialIcon } from "@/components/icons";

export function Footer(props: {
  columns: FooterColumn[];
  social: FooterSocial[];
  copyright: string;
}) {
  return (
    <footer className="pt-16 pb-10">
      <div className="container-shell">
        <div className="surface px-6 py-10 md:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            {props.columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold tracking-tight">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={`${l.label}:${l.href}`}>
                      <Link
                        href={l.href}
                        className="text-sm text-(--muted) hover:text-(--foreground)"
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-6 border-t border-(--border) pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {props.social.map((s) => (
                <Link
                  key={`${s.type}:${s.href}`}
                  href={s.href}
                  className="grid h-10 w-10 place-items-center rounded-full border border-(--border) bg-(--surface)"
                  aria-label={s.type}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <SocialIcon type={s.type} className="h-5 w-5" />
                </Link>
              ))}
            </div>

            <p className="text-xs text-(--muted)">{props.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

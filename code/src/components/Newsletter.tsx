"use client";

import { useMemo, useState } from "react";

export function Newsletter(props: {
  enabled: boolean;
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const storageKey = "portfolio:newsletterEmails:v1";

  const canSubmit = useMemo(() => {
    const trimmed = email.trim();
    return trimmed.length >= 3 && trimmed.includes("@");
  }, [email]);

  if (!props.enabled) return null;

  return (
    <section className="pt-14 md:pt-18" id="newsletter">
      <div className="container-shell">
        <div className="surface px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{props.title}</h2>
              <p className="mt-2 text-sm leading-6 text-(--muted)">{props.description}</p>
              {status === "success" ? (
                <p className="mt-3 text-sm font-semibold">Saved! I’ll be in touch.</p>
              ) : null}
            </div>

            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                const trimmed = email.trim();

                try {
                  const prev = localStorage.getItem(storageKey);
                  const list = prev ? (JSON.parse(prev) as string[]) : [];
                  const next = Array.from(new Set([...list, trimmed]));
                  localStorage.setItem(storageKey, JSON.stringify(next));
                } catch {
                  // ignore localStorage failures
                }

                setEmail("");
                setStatus("success");
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={props.placeholder}
                className="h-12 w-full rounded-[999px] border border-(--border) bg-(--surface) px-4 text-sm outline-none focus:ring-2 focus:ring-(--accent)/30 sm:w-[320px]"
              />
              <button type="submit" className="btn-primary h-12" disabled={!canSubmit}>
                {props.buttonText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

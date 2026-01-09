"use client";

import { useEffect, useMemo, useState } from "react";
import type { PortfolioData } from "./types";
import {
  fetchPortfolioJson,
  loadFromLocalStorage,
  validateAndCachePortfolio,
  type LoadState,
} from "./loaders";

export function ClientPortfolioBootstrap(props: {
  initialData: PortfolioData;
  initialRawJsonText: string | null;
  children: React.ReactNode;
}) {
  const url = process.env.NEXT_PUBLIC_PORTFOLIO_JSON_URL;

  const initialState = useMemo<LoadState>(() => {
    if (!url) {
      return {
        status: "error",
        data: props.initialData,
        message: "Missing NEXT_PUBLIC_PORTFOLIO_JSON_URL",
      };
    }

    // Prefer cached data instantly.
    const cached = loadFromLocalStorage();
    if (cached.status === "ready") return cached;

    // If server provided valid data, render it (still cache it on mount).
    return { status: "loading", data: props.initialData };
  }, [props.initialData, url]);

  const [, setState] = useState<LoadState>(initialState);

  useEffect(() => {
    if (!url) return;

    // Cache server-fetched JSON once on client (first paint).
    if (props.initialRawJsonText) {
      const cached = validateAndCachePortfolio(props.initialRawJsonText);
      if (cached.status === "ready") {
        queueMicrotask(() => setState(cached));
      }
    }

    // Revalidate in background.
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetchPortfolioJson({ url, signal: controller.signal });
        if (res.status === "not-modified") return;

        const next = validateAndCachePortfolio(res.raw, res.etag);
        if (next.status === "ready") setState(next);
        else setState(next);
      } catch {
        // If we already have cached/initial data, ignore; else show error.
        setState((s) =>
          s.status === "ready"
            ? s
            : { status: "error", data: s.data, message: "Failed to fetch portfolio JSON." },
        );
      }
    })();

    return () => controller.abort();
  }, [props.initialRawJsonText, url]);

  return <>{props.children}</>;
}

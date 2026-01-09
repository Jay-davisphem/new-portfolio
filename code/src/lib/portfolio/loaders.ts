import type { PortfolioData } from "./types";
import { DEFAULT_PORTFOLIO_DATA } from "./defaultData";
import { readPortfolioEtag, readPortfolioJsonRaw, writePortfolioEtag, writePortfolioJsonRaw } from "../storage/localStorage";
import { validatePortfolioData } from "../validation/portfolioValidation";

export type LoadState =
  | { status: "loading"; data: PortfolioData }
  | { status: "ready"; data: PortfolioData }
  | { status: "error"; data: PortfolioData; message: string };

export function safeParseJson(raw: string): unknown {
  return JSON.parse(raw);
}

export function loadFromLocalStorage(): LoadState {
  const cached = readPortfolioJsonRaw();
  if (!cached) return { status: "loading", data: DEFAULT_PORTFOLIO_DATA };

  try {
    const parsed = safeParseJson(cached);
    const validated = validatePortfolioData(parsed);
    if (!validated.ok) {
      return {
        status: "error",
        data: DEFAULT_PORTFOLIO_DATA,
        message: "Cached portfolio data is invalid.\n" + validated.errors.slice(0, 3).join("\n"),
      };
    }
    return { status: "ready", data: validated.value };
  } catch {
    return {
      status: "error",
      data: DEFAULT_PORTFOLIO_DATA,
      message: "Failed to parse cached portfolio JSON.",
    };
  }
}

export async function fetchPortfolioJson(options: {
  url: string;
  signal?: AbortSignal;
}): Promise<{ status: "not-modified" } | { status: "ok"; raw: string; etag?: string }> {
  const etag = readPortfolioEtag();

  const res = await fetch(options.url, {
    method: "GET",
    cache: "no-store",
    headers: etag ? { "If-None-Match": etag } : undefined,
    signal: options.signal,
  });

  if (res.status === 304) return { status: "not-modified" };
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

  const raw = await res.text();
  const nextEtag = res.headers.get("etag") ?? undefined;

  return { status: "ok", raw, etag: nextEtag };
}

export function validateAndCachePortfolio(rawJsonText: string, etag?: string): LoadState {
  try {
    const parsed = safeParseJson(rawJsonText);
    const validated = validatePortfolioData(parsed);
    if (!validated.ok) {
      return {
        status: "error",
        data: DEFAULT_PORTFOLIO_DATA,
        message: "Fetched portfolio JSON is invalid.\n" + validated.errors.slice(0, 4).join("\n"),
      };
    }

    writePortfolioJsonRaw(rawJsonText);
    if (etag) writePortfolioEtag(etag);

    return { status: "ready", data: validated.value };
  } catch {
    return {
      status: "error",
      data: DEFAULT_PORTFOLIO_DATA,
      message: "Fetched portfolio JSON could not be parsed.",
    };
  }
}

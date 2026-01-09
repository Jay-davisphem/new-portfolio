import "server-only";
import type { PortfolioData } from "./types";
import { DEFAULT_PORTFOLIO_DATA } from "./defaultData";
import { validatePortfolioData } from "../validation/portfolioValidation";

export async function fetchPortfolioDataServerSide(): Promise<{
  data: PortfolioData;
  rawJsonText: string | null;
  error?: string;
}> {
  const url = process.env.NEXT_PUBLIC_PORTFOLIO_JSON_URL;

  if (!url) {
    return {
      data: DEFAULT_PORTFOLIO_DATA,
      rawJsonText: null,
      error: "Missing NEXT_PUBLIC_PORTFOLIO_JSON_URL",
    };
  }

  try {
    const res = await fetch(url, {
      // Allow Next to cache/revalidate for SEO; client still stores to localStorage.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return {
        data: DEFAULT_PORTFOLIO_DATA,
        rawJsonText: null,
        error: `Server fetch failed (${res.status})`,
      };
    }

    const rawJsonText = await res.text();
    const parsed = JSON.parse(rawJsonText);
    const validated = validatePortfolioData(parsed);

    if (!validated.ok) {
      return {
        data: DEFAULT_PORTFOLIO_DATA,
        rawJsonText: null,
        error: "Fetched JSON failed validation: " + validated.errors.slice(0, 3).join("; "),
      };
    }

    return { data: validated.value, rawJsonText };
  } catch (e) {
    return {
      data: DEFAULT_PORTFOLIO_DATA,
      rawJsonText: null,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

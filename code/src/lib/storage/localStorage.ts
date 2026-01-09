import { PORTFOLIO_STORAGE_KEYS } from "./keys";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readLocalStorageString(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorageString(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota/security errors
  }
}

export function readPortfolioJsonRaw(): string | null {
  return readLocalStorageString(PORTFOLIO_STORAGE_KEYS.data);
}

export function writePortfolioJsonRaw(raw: string): void {
  writeLocalStorageString(PORTFOLIO_STORAGE_KEYS.data, raw);
  writeLocalStorageString(
    PORTFOLIO_STORAGE_KEYS.lastFetchedAt,
    String(Date.now()),
  );
}

export function readPortfolioEtag(): string | null {
  return readLocalStorageString(PORTFOLIO_STORAGE_KEYS.etag);
}

export function writePortfolioEtag(etag: string): void {
  writeLocalStorageString(PORTFOLIO_STORAGE_KEYS.etag, etag);
}

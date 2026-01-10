import { afterEach, describe, expect, it, vi } from "vitest";

import { PORTFOLIO_STORAGE_KEYS } from "@/lib/storage/keys";
import {
  readLocalStorageString,
  readPortfolioJsonRaw,
  writeLocalStorageString,
  writePortfolioJsonRaw,
} from "@/lib/storage/localStorage";

function mockLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  };

  Object.defineProperty(window, "localStorage", {
    value: localStorage,
    configurable: true,
  });

  return { store };
}

describe("localStorage helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writePortfolioJsonRaw writes to data key and updates lastFetchedAt", () => {
    mockLocalStorage();
    const now = 1736467200000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    writePortfolioJsonRaw("{\"x\":1}");

    expect(readPortfolioJsonRaw()).toBe("{\"x\":1}");
    expect(readLocalStorageString(PORTFOLIO_STORAGE_KEYS.lastFetchedAt)).toBe(String(now));
  });

  it("readLocalStorageString returns null if not present", () => {
    mockLocalStorage();
    expect(readLocalStorageString("missing")).toBeNull();
  });

  it("writeLocalStorageString is resilient to exceptions", () => {
    // Force localStorage.setItem to throw
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      },
      configurable: true,
    });

    expect(() => writeLocalStorageString(PORTFOLIO_STORAGE_KEYS.data, "x")).not.toThrow();
  });
});

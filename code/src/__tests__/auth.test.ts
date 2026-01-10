import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  configureAdminPassphrase,
  getAdminConfigStatus,
  isAdminUnlocked,
  setAdminUnlocked,
  touchAdminActivity,
  verifyAdminPassphrase,
} from "@/lib/admin/auth";

function mockStorage() {
  const ls = new Map<string, string>();
  const ss = new Map<string, string>();

  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (k: string) => (ls.has(k) ? ls.get(k)! : null),
      setItem: (k: string, v: string) => ls.set(k, String(v)),
      removeItem: (k: string) => ls.delete(k),
      clear: () => ls.clear(),
    },
    configurable: true,
  });

  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: (k: string) => (ss.has(k) ? ss.get(k)! : null),
      setItem: (k: string, v: string) => ss.set(k, String(v)),
      removeItem: (k: string) => ss.delete(k),
      clear: () => ss.clear(),
    },
    configurable: true,
  });

  return { ls, ss };
}

describe("admin auth", () => {
  beforeEach(() => {
    mockStorage();
  });

  it("starts as not configured", () => {
    expect(getAdminConfigStatus()).toBe("not-configured");
  });

  it("configure + verify passphrase works", async () => {
    await configureAdminPassphrase("correct horse battery staple");
    expect(getAdminConfigStatus()).toBe("configured");

    const ok = await verifyAdminPassphrase("correct horse battery staple");
    expect(ok.ok).toBe(true);

    const bad = await verifyAdminPassphrase("wrong");
    expect(bad.ok).toBe(false);
  });

  it("unlock state is session-only and expires by timeout", () => {
    mockStorage();

    const now = 1_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    setAdminUnlocked(true);
    expect(isAdminUnlocked({ timeoutMs: 10_000 })).toBe(true);

    // Advance time past timeout
    vi.spyOn(Date, "now").mockReturnValue(now + 10_001);
    expect(isAdminUnlocked({ timeoutMs: 10_000 })).toBe(false);
  });

  it("touchAdminActivity refreshes lastActiveAt", () => {
    const now = 2_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    setAdminUnlocked(true);

    vi.spyOn(Date, "now").mockReturnValue(now + 1234);
    touchAdminActivity();

    // Should be considered unlocked for long timeout
    expect(isAdminUnlocked({ timeoutMs: 60_000 })).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { DEFAULT_PORTFOLIO_DATA } from "@/lib/portfolio/defaultData";
import { validatePortfolioData } from "@/lib/validation/portfolioValidation";
import type { PortfolioData } from "@/lib/portfolio/types";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

describe("validatePortfolioData", () => {
  it("accepts the default portfolio data", () => {
    const res = validatePortfolioData(DEFAULT_PORTFOLIO_DATA);
    expect(res.ok).toBe(true);
  });

  it("rejects when required fields are missing", () => {
    const bad = clone(DEFAULT_PORTFOLIO_DATA) as unknown as PortfolioData;
    // Create an invalid shape intentionally for this test
    (bad.profile as unknown as Record<string, unknown>).name = "";

    const res = validatePortfolioData(bad);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors.join("\n")).toContain("profile.name is required");
    }
  });

  it("allows hash links and mailto/tel hrefs", () => {
    const data = clone(DEFAULT_PORTFOLIO_DATA) as unknown as PortfolioData;

    (data.navigation as unknown as Array<{ label: string; href: string }>) = [
      { label: "Home", href: "#home" },
      { label: "Contact", href: "mailto:test@example.com" },
      { label: "Phone", href: "tel:+1234567890" },
    ];

    (data.footer.columns as unknown as Array<{ title: string; links: Array<{ label: string; href: string }> }>) = [
      {
        title: "Contact",
        links: [
          { label: "Email", href: "mailto:test@example.com" },
          { label: "Call", href: "tel:+1234567890" },
        ],
      },
    ];

    const res = validatePortfolioData(data);
    expect(res.ok).toBe(true);
  });
});

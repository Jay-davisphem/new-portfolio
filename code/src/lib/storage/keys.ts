export const PORTFOLIO_STORAGE_KEYS = {
  data: "portfolio:data:v1",
  etag: "portfolio:etag:v1",
  lastFetchedAt: "portfolio:lastFetchedAt:v1",
  adminHash: "portfolio:admin:hash:v1",
  adminSalt: "portfolio:admin:salt:v1",
} as const;

export type PortfolioStorageKey =
  (typeof PORTFOLIO_STORAGE_KEYS)[keyof typeof PORTFOLIO_STORAGE_KEYS];

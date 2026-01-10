import type { PortfolioData } from "@/lib/portfolio/types";

export type ArrayOp<T> =
  | { type: "add"; value: T }
  | { type: "remove"; index: number }
  | { type: "move"; from: number; to: number }
  | { type: "update"; index: number; value: T };

export function arrayApply<T>(items: T[], op: ArrayOp<T>): T[] {
  if (op.type === "add") return [...items, op.value];
  if (op.type === "remove") return items.filter((_, i) => i !== op.index);
  if (op.type === "update") return items.map((v, i) => (i === op.index ? op.value : v));

  // move
  const from = op.from;
  const to = op.to;
  if (from === to) return items;
  if (from < 0 || from >= items.length) return items;
  if (to < 0 || to >= items.length) return items;

  const next = items.slice();
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

export function updatePortfolio(data: PortfolioData, patch: Partial<PortfolioData>): PortfolioData {
  return { ...data, ...patch };
}

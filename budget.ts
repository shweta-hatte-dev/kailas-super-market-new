import type { Product } from '../types';

export const BUDGET_PRESETS = [300, 500, 1000];

export interface BudgetStatus { remaining: number; over: number; pct: number; state: 'ok' | 'near' | 'over' }

export function budgetStatus(total: number, budget: number): BudgetStatus {
  const remaining = Math.round((budget - total) * 100) / 100;
  const pct = budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : 0;
  const state = remaining < 0 ? 'over' : pct >= 85 ? 'near' : 'ok';
  return { remaining, over: remaining < 0 ? Math.abs(remaining) : 0, pct, state };
}

/** Plain filter: in-stock items that fit what is left of the budget, cheapest first. */
export const fitsBudget = (items: Product[], remaining: number, skipIds: string[] = []): Product[] =>
  items.filter((p) => p.inStock && p.price <= remaining && !skipIds.includes(p.id)).sort((a, b) => a.price - b.price);

export function parseBudget(input: string): number | null {
  const n = Number(input.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 && n <= 1_000_000 ? Math.round(n) : null;
}

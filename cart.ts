import type { CartLine, Product } from '../types';

export const MAX_QTY = 99;
type Getter = (id: string) => Product | undefined;

export function addToCart(lines: CartLine[], id: string, qty = 1): CartLine[] {
  const found = lines.find((l) => l.id === id);
  if (found) return lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
  return [...lines, { id, qty: Math.min(MAX_QTY, Math.max(1, qty)) }];
}

export function setQty(lines: CartLine[], id: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.id !== id);
  return lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, Math.floor(qty)) } : l));
}

export const removeLine = (lines: CartLine[], id: string): CartLine[] => lines.filter((l) => l.id !== id);
export const cartCount = (lines: CartLine[]): number => lines.reduce((n, l) => n + l.qty, 0);

export function cartTotal(lines: CartLine[], get: Getter): number {
  const cents = lines.reduce((sum, l) => sum + Math.round((get(l.id)?.price ?? 0) * 100) * l.qty, 0);
  return cents / 100;
}

export function cartSavings(lines: CartLine[], get: Getter): number {
  const cents = lines.reduce((sum, l) => {
    const p = get(l.id);
    return p?.mrp && p.mrp > p.price ? sum + Math.round((p.mrp - p.price) * 100) * l.qty : sum;
  }, 0);
  return cents / 100;
}

/** Cleans cart data read from localStorage: drops unknown / out-of-stock products and bad quantities. */
export function sanitizeCart(raw: unknown, get: Getter): CartLine[] {
  if (!Array.isArray(raw)) return [];
  let out: CartLine[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const { id, qty } = r as { id?: unknown; qty?: unknown };
    if (typeof id !== 'string' || typeof qty !== 'number' || !Number.isFinite(qty) || qty < 1) continue;
    const p = get(id);
    if (!p || !p.inStock) continue;
    out = addToCart(out, id, Math.floor(qty));
  }
  return out;
}

export const sanitizeIds = (raw: unknown, get: Getter, max = 100): string[] =>
  Array.isArray(raw)
    ? [...new Set(raw.filter((x): x is string => typeof x === 'string' && !!get(x)))].slice(0, max)
    : [];

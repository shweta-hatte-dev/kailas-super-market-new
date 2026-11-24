import type { Category, Product } from '../types';

export const normalise = (s: string): string =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const stem = (t: string) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);

export function scoreProduct(p: Product, tokens: string[], categoryName: string, requireAll: boolean): number {
  const nameWords = normalise(p.name).split(' ');
  const name = nameWords.join(' ');
  const tags = normalise((p.tags ?? []).join(' '));
  const cat = normalise(categoryName);
  const unit = normalise(p.unit);
  let score = 0;
  let matched = 0;
  for (const t of tokens) {
    let s = 0;
    if (nameWords.some((w) => w.startsWith(t))) s = 3;
    else if (name.includes(t)) s = 2;
    else if (tags.includes(t) || cat.includes(t)) s = 1.5;
    else if (unit.includes(t)) s = 0.5;
    if (s > 0) matched++;
    score += s;
  }
  if (requireAll ? matched < tokens.length : matched === 0) return 0;
  return score + (p.popular ? 0.25 : 0);
}

export function searchProducts(
  query: string, products: Product[], categories: Category[], opts: { limit?: number; requireAll?: boolean } = {},
): Product[] {
  const tokens = normalise(query).split(' ').filter(Boolean).map(stem);
  if (!tokens.length) return [];
  const names = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  return products
    .map((p) => ({ p, s: scoreProduct(p, tokens, names[p.category] ?? '', opts.requireAll ?? true) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, opts.limit ?? products.length)
    .map((x) => x.p);
}

export const matchCategories = (query: string, categories: Category[]): Category[] => {
  const q = normalise(query);
  return q.length < 2 ? [] : categories.filter((c) => normalise(c.name).includes(q));
};

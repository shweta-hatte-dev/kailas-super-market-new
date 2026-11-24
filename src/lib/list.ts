import type { Category, ListItem, Product } from '../types';
import { searchProducts } from './search';

export const bestMatch = (text: string, products: Product[], categories: Category[]): Product | undefined =>
  searchProducts(text, products.filter((p) => p.inStock), categories, { limit: 1, requireAll: false })[0];

export function formatShoppingList(items: ListItem[], storeName: string): string {
  const todo = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  const lines = [`Shopping list for ${storeName}`, ''];
  todo.forEach((i) => lines.push(`[ ] ${i.text}`));
  done.forEach((i) => lines.push(`[x] ${i.text}`));
  return lines.join('\n');
}

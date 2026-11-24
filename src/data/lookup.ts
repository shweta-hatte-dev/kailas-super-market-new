import type { Product } from '../types';
import { products } from './products';
import { combos } from './offers';

const map = new Map<string, Product>([...products, ...combos].map((p) => [p.id, p]));
export const getProduct = (id: string): Product | undefined => map.get(id);
export const allProducts = products;

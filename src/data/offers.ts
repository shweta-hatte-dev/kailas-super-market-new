import type { Product } from '../types';
import { products } from './products';

/**
 * SAMPLE OFFERS — these are demonstration content, NOT real current offers.
 * Edit text and product ids freely. Discounts come from `mrp` on each product.
 */
export const heroPromo = {
  title: 'Fresh picks',
  text: 'Fresh vegetables, milk and bread for the day.',
  tab: 'today',
};

export const offerBanners = [
  { id: 'weekly', title: 'Weekly Grocery Deals', text: 'Sample offer text. Edit it in src/data/offers.ts.', cta: 'See weekly deals', tab: 'weekly', tone: 'forest' as const },
  { id: 'fresh', title: 'Fresh Picks', text: 'Fruit, vegetables, milk and bread for today.', cta: 'See fresh picks', tab: 'today', tone: 'sage' as const },
  { id: 'family', title: 'Family Essentials', text: 'Stock up on rice, atta, dal and oil in one go.', cta: 'See family essentials', tab: 'family', tone: 'gold' as const },
  { id: 'special', title: 'Special Offers', text: 'Products marked down from their original price.', cta: 'See special offers', tab: 'savings', tone: 'forest' as const },
];

export const offerTabs = [
  { id: 'today', label: 'Fresh picks', ids: ['tomato', 'banana', 'milk-1l', 'bread-sandwich', 'curd-400g', 'eggs-6'] },
  { id: 'weekly', label: 'Weekly deals', ids: ['rice-basmati-5kg', 'atta-5kg', 'sunflower-oil-1l', 'shampoo-340', 'floor-cleaner-1l', 'digestive'] },
  { id: 'combo', label: 'Combo offers', ids: [] as string[] },
  { id: 'festival', label: 'Festival offers', ids: [] as string[] }, // filled from the active seasonal collection
  { id: 'family', label: 'Family essentials', ids: ['atta-5kg', 'rice-sona-5kg', 'toor-dal-1kg', 'sunflower-oil-1l', 'sugar-1kg', 'salt-1kg'] },
  { id: 'savings', label: 'Special offers', ids: [] as string[] }, // auto: products with the biggest discount
];

/** comboPrice must be lower than the sum of the items. */
export const comboDefs = [
  { id: 'combo-staples', name: 'Monthly staples combo', items: ['atta-5kg', 'rice-sona-5kg', 'toor-dal-1kg', 'sunflower-oil-1l', 'sugar-1kg'], comboPrice: 880 },
  { id: 'combo-breakfast', name: 'Breakfast combo', items: ['milk-1l', 'bread-sandwich', 'eggs-6', 'butter-100g'], comboPrice: 195 },
  { id: 'combo-cleaning', name: 'Home cleaning combo', items: ['detergent-1kg', 'dishwash-500', 'floor-cleaner-1l', 'toilet-cleaner-500'], comboPrice: 475 },
  { id: 'combo-teatime', name: 'Tea-time combo', items: ['tea-500g', 'glucose-biscuit', 'rusk'], comboPrice: 340 },
];

const byId = Object.fromEntries(products.map((p) => [p.id, p]));

/** Combos behave like products so they can go in the cart. */
export const combos: Product[] = comboDefs.map((c) => {
  const parts = c.items.map((id) => byId[id]);
  return {
    id: c.id,
    name: c.name,
    category: 'combo',
    unit: `${parts.length} items`,
    price: c.comboPrice,
    mrp: parts.reduce((s, p) => s + p.price, 0),
    inStock: parts.every((p) => p.inStock),
    bundle: c.items.slice(0, 3),
    includes: parts.map((p) => `${p.name} ${p.unit}`).join(', '),
  };
});

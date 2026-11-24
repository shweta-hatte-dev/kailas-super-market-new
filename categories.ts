import type { Category } from '../types';

/** To rename or reorder categories, edit this list. `cover` = product id whose photo is shown on the card. */
export const categories: Category[] = [
  { slug: 'fruits', name: 'Fruits', blurb: 'Seasonal and everyday fruit', tint: '#F1E7CF', cover: 'apple-shimla' },
  { slug: 'vegetables', name: 'Vegetables', blurb: 'Fresh for every kitchen', tint: '#D5E4D2', cover: 'tomato' },
  { slug: 'dairy', name: 'Dairy', blurb: 'Milk, curd, paneer and more', tint: '#E8F0E6', cover: 'milk-1l' },
  { slug: 'grocery', name: 'Grocery', blurb: 'Rice, atta, dal, oil and spices', tint: '#F2ECDD', cover: 'rice-basmati-5kg' },
  { slug: 'snacks', name: 'Snacks', blurb: 'Biscuits, chips and chocolates', tint: '#F1E7CF', cover: 'glucose-biscuit' },
  { slug: 'beverages', name: 'Beverages', blurb: 'Tea, coffee and cold drinks', tint: '#E8F0E6', cover: 'tea-500g' },
  { slug: 'personal-care', name: 'Personal Care', blurb: 'Soap, shampoo and daily care', tint: '#D5E4D2', cover: 'shampoo-340' },
  { slug: 'home-essentials', name: 'Home Essentials', blurb: 'Cleaning and household basics', tint: '#F2ECDD', cover: 'detergent-1kg' },
];

export const categoryMap: Record<string, Category> = Object.fromEntries(categories.map((c) => [c.slug, c]));

export interface Product {
  id: string;
  name: string;
  category: string; // category slug (see data/categories.ts)
  unit: string; // pack size shown on the card, e.g. "1 kg"
  price: number; // selling price in INR
  mrp?: number; // optional original price; shows a discount when higher than price
  inStock: boolean;
  popular?: boolean; // listed first in "Popular products"
  quick?: boolean; // appears in "Your everyday essentials"
  tags?: string[]; // extra search words (Hindi/Marathi names etc.)
  description?: string;
  badge?: 'Popular' | 'Fresh' | 'Best Seller' | 'New'; // small label on the card
  photoQuery?: string; // search words used by `npm run photos` to find a photo
  image?: string; // optional: full URL or /public path that overrides the bundled photo
  bundle?: string[]; // combo offers: ids of the products inside
  includes?: string; // combo offers: human-readable contents
}

export interface Category {
  slug: string;
  name: string;
  blurb: string;
  tint: string;
  cover: string; // product id whose photo is shown on the category card
}

export interface CartLine { id: string; qty: number }
export interface ListItem { id: string; text: string; done: boolean }

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'discount';
export interface Filters {
  category: string | null;
  query: string;
  sort: SortKey;
  inStockOnly: boolean;
}

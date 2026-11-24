import { describe, expect, it } from 'vitest';
import { products } from '../../data/products';
import { categories } from '../../data/categories';
import { combos, comboDefs, offerTabs } from '../../data/offers';
import { seasons } from '../../data/seasons';
import { store } from '../../config/store';
import type { StoreConfig } from '../../config/store';
import { addToCart, cartCount, cartSavings, cartTotal, sanitizeCart, setQty } from '../cart';
import { buildOrderMessage, buildWhatsAppUrl, normaliseWhatsAppNumber, validateOrder } from '../whatsapp';
import { matchCategories, searchProducts } from '../search';
import { budgetStatus, fitsBudget, parseBudget } from '../budget';
import { bestMatch, formatShoppingList } from '../list';
import { formatINR, percentOff } from '../format';
import { buildJsonLd, buildRobots, buildSeoHead, resolveSiteUrl } from '../seo';
import { directionsUrl, formatAddress, formatHours } from '../contact';

const all = [...products, ...combos];
const get = (id: string) => all.find((p) => p.id === id);

describe('data integrity', () => {
  it('has unique product ids and valid categories', () => {
    const ids = all.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slugs = new Set(categories.map((c) => c.slug));
    products.forEach((p) => expect(slugs.has(p.category), p.id).toBe(true));
    categories.forEach((c) => expect(products.some((p) => p.category === c.slug), c.slug).toBe(true));
  });
  it('references only existing products', () => {
    categories.forEach((c) => {
      expect(get(c.cover), c.cover).toBeTruthy();
      expect(get(c.cover)!.category, c.cover).toBe(c.slug);
    });
    offerTabs.forEach((t) => t.ids.forEach((id) => expect(get(id), id).toBeTruthy()));
    seasons.forEach((s) => s.productIds.forEach((id) => expect(get(id), id).toBeTruthy()));
    comboDefs.forEach((c) => c.items.forEach((id) => expect(get(id), id).toBeTruthy()));
    expect(seasons.some((s) => s.key === store.seasonal.active)).toBe(true);
  });
  it('combos are cheaper than their parts', () => combos.forEach((c) => expect(c.price).toBeLessThan(c.mrp!)));
  it('has a photo search phrase for every product', () => products.forEach((p) => expect(p.photoQuery, p.id).toBeTruthy()));
  it('every category has at least 4 products', () =>
    categories.forEach((c) => expect(products.filter((p) => p.category === c.slug).length).toBeGreaterThanOrEqual(4)));
});

describe('cart', () => {
  it('adds, merges, changes and removes lines', () => {
    let c = addToCart([], 'milk-1l');
    c = addToCart(c, 'milk-1l', 2);
    c = addToCart(c, 'atta-5kg');
    expect(c).toEqual([{ id: 'milk-1l', qty: 3 }, { id: 'atta-5kg', qty: 1 }]);
    expect(cartCount(c)).toBe(4);
    c = setQty(c, 'milk-1l', 5);
    expect(cartCount(c)).toBe(6);
    c = setQty(c, 'milk-1l', 0);
    expect(c).toEqual([{ id: 'atta-5kg', qty: 1 }]);
  });
  it('caps quantity at 99', () => expect(setQty([{ id: 'milk-1l', qty: 1 }], 'milk-1l', 500)[0].qty).toBe(99));
  it('calculates totals and savings', () => {
    const c = [{ id: 'milk-1l', qty: 2 }, { id: 'atta-5kg', qty: 1 }];
    expect(cartTotal(c, get)).toBe(56 * 2 + 245);
    expect(cartSavings(c, get)).toBe(25);
  });
  it('sanitises stored carts', () => {
    const raw = [{ id: 'milk-1l', qty: 2 }, { id: 'gone', qty: 1 }, { id: 'mango-1kg', qty: 1 }, { id: 'milk-1l', qty: 1 }, { id: 'atta-5kg', qty: -3 }, 'junk'];
    expect(sanitizeCart(raw, get)).toEqual([{ id: 'milk-1l', qty: 3 }]);
    expect(sanitizeCart('nope', get)).toEqual([]);
  });
});

describe('format', () => {
  it('formats rupees the Indian way', () => {
    expect(formatINR(1098)).toBe('₹1,098');
    expect(formatINR(150000)).toBe('₹1,50,000');
    expect(formatINR(99.5)).toBe('₹99.50');
  });
  it('computes discounts', () => {
    expect(percentOff(245, 270)).toBe(9);
    expect(percentOff(50)).toBe(0);
  });
});

describe('whatsapp', () => {
  it('normalises numbers', () => {
    expect(normaliseWhatsAppNumber('98765 43210')).toBe('919876543210');
    expect(normaliseWhatsAppNumber('+91 98765-43210')).toBe('919876543210');
    expect(normaliseWhatsAppNumber('')).toBeNull();
    expect(normaliseWhatsAppNumber('12345')).toBeNull();
  });
  it('refuses to build a link without a number', () => expect(buildWhatsAppUrl('', 'hi')).toBeNull());
  it('builds an encoded link', () => expect(buildWhatsAppUrl('9876543210', 'a b\nc')).toBe('https://wa.me/919876543210?text=a%20b%0Ac'));
  it('validates the order form', () => {
    const lines = [{ id: 'milk-1l', qty: 1 }];
    expect(validateOrder({ name: '', mode: 'pickup', address: '', note: '' }, lines).name).toBeTruthy();
    expect(validateOrder({ name: 'Asha', mode: 'delivery', address: '', note: '' }, lines).address).toBeTruthy();
    expect(validateOrder({ name: 'Asha', mode: 'pickup', address: '', note: '' }, lines)).toEqual({});
    expect(validateOrder({ name: 'Asha', mode: 'pickup', address: '', note: '' }, []).cart).toBeTruthy();
  });
  it('writes a complete order message', () => {
    const msg = buildOrderMessage({
      storeName: 'Kailas Super Market',
      customer: { name: ' Asha ', mode: 'delivery', address: '12 Rose Lane', note: 'Ring the bell' },
      lines: [{ id: 'milk-1l', qty: 2 }, { id: 'combo-breakfast', qty: 1 }],
      get, showPrices: true,
    });
    expect(msg).toContain('*Name:* Asha');
    expect(msg).toContain('Home delivery');
    expect(msg).toContain('*Delivery address:* 12 Rose Lane');
    expect(msg).toContain('1. Toned Milk (1 L) x 2 = ₹112');
    expect(msg).toContain('Includes: Toned Milk 1 L');
    expect(msg).toContain('*Total:* ₹307');
    expect(msg).toContain('*Note:* Ring the bell');
  });
  it('omits prices and address when not needed', () => {
    const msg = buildOrderMessage({ storeName: 'S', customer: { name: 'Ravi', mode: 'pickup', address: 'ignored', note: '' }, lines: [{ id: 'milk-1l', qty: 1 }], get, showPrices: false });
    expect(msg).not.toContain('₹');
    expect(msg).not.toContain('ignored');
    expect(msg).toContain('Pickup from store');
  });
});

describe('search', () => {
  const s = (q: string) => searchProducts(q, products, categories).map((p) => p.id);
  it('matches by name, partially', () => {
    expect(s('bas')).toContain('rice-basmati-5kg');
    expect(s('tomatoes')).toContain('tomato');
    expect(s('RICE')[0]).toMatch(/rice/);
  });
  it('matches by category and by Hindi tags', () => {
    expect(s('dairy').length).toBeGreaterThanOrEqual(4);
    expect(s('dahi')).toContain('curd-400g');
    expect(s('chai')).toContain('tea-500g');
  });
  it('requires every word and returns nothing for nonsense', () => {
    expect(s('toor dal')).toContain('toor-dal-1kg');
    expect(s('toor shampoo')).toEqual([]);
    expect(s('zzzzq')).toEqual([]);
    expect(s('   ')).toEqual([]);
  });
  it('finds categories', () => expect(matchCategories('home', categories).map((c) => c.slug)).toEqual(['home-essentials']));
});

describe('budget', () => {
  it('reports remaining, near and over', () => {
    expect(budgetStatus(100, 500)).toMatchObject({ remaining: 400, state: 'ok', over: 0 });
    expect(budgetStatus(450, 500).state).toBe('near');
    expect(budgetStatus(620, 500)).toMatchObject({ over: 120, state: 'over', pct: 100 });
  });
  it('parses custom amounts', () => {
    expect(parseBudget('₹1,250')).toBe(1250);
    expect(parseBudget('abc')).toBeNull();
    expect(parseBudget('0')).toBeNull();
  });
  it('suggests only what fits', () => {
    const r = fitsBudget(products, 40, ['water-1l']);
    expect(r.every((p) => p.price <= 40 && p.inStock && p.id !== 'water-1l')).toBe(true);
  });
});

describe('shopping list', () => {
  it('matches list text to products', () => {
    expect(bestMatch('milk', products, categories)?.id).toBe('milk-1l');
    expect(bestMatch('toor dal 1 kg', products, categories)?.id).toBe('toor-dal-1kg');
    expect(bestMatch('spaceship', products, categories)).toBeUndefined();
    expect(bestMatch('mango', products, categories)).toBeUndefined(); // out of stock is never suggested
  });
  it('formats a copyable list', () => {
    const t = formatShoppingList([{ id: '1', text: 'Milk', done: false }, { id: '2', text: 'Salt', done: true }], 'Kailas Super Market');
    expect(t).toBe('Shopping list for Kailas Super Market\n\n[ ] Milk\n[x] Salt');
  });
});

describe('contact + seo', () => {
  const base: StoreConfig = JSON.parse(JSON.stringify(store));
  it('never invents details', () => {
    expect(formatAddress(base)).toBe('');
    expect(directionsUrl(base)).toBeNull();
    const ld = JSON.parse(buildJsonLd(base, ''));
    expect(ld['@type']).toBe('GroceryStore');
    ['address', 'telephone', 'geo', 'openingHoursSpecification', 'aggregateRating', 'url'].forEach((k) => expect(ld[k]).toBeUndefined());
    expect(buildSeoHead(base, '')).not.toContain('canonical');
    expect(buildRobots('')).not.toContain('Sitemap');
  });
  it('uses configured details', () => {
    const c: StoreConfig = { ...base, phone: '+91 98765 43210', address: { line1: '1 Main Rd', area: 'Dighi', city: 'Pune', state: 'Maharashtra', postalCode: '411015' }, hours: [{ days: ['Monday', 'Tuesday', 'Wednesday'], opens: '08:00', closes: '21:30' }] };
    expect(formatAddress(c)).toBe('1 Main Rd, Dighi, Pune, Maharashtra 411015');
    expect(directionsUrl(c)).toContain('destination=');
    expect(formatHours(c)).toEqual([{ days: 'Mon – Wed', time: '8 AM – 9:30 PM' }]);
    const ld = JSON.parse(buildJsonLd(c, 'https://x.test'));
    expect(ld.address.addressLocality).toBe('Pune');
    expect(ld.openingHoursSpecification[0].closes).toBe('21:30');
    expect(buildSeoHead(c, 'https://x.test')).toContain('rel="canonical" href="https://x.test/"');
  });
  it('detects the Vercel domain', () => {
    expect(resolveSiteUrl(base, { VERCEL_PROJECT_PRODUCTION_URL: 'kailas.vercel.app' })).toBe('https://kailas.vercel.app');
    expect(resolveSiteUrl({ ...base, siteUrl: 'https://kailas.in/' }, {})).toBe('https://kailas.in');
  });
});

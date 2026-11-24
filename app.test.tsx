// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { store } from '../config/store';

let errors: unknown[][] = [];

beforeAll(() => {
  class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
  vi.stubGlobal('IntersectionObserver', IO);
  window.matchMedia = window.matchMedia || ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }) as unknown as MediaQueryList);
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as never;
});

beforeEach(() => {
  localStorage.clear();
  errors = [];
  vi.spyOn(console, 'error').mockImplementation((...a) => { errors.push(a); });
  vi.spyOn(console, 'warn').mockImplementation((...a) => { errors.push(a); });
  store.whatsappNumber = '';
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const open = async (u: ReturnType<typeof userEvent.setup>, name: RegExp) => u.click(screen.getAllByRole('button', { name })[0]);
const shopQ = () => document.getElementById('shop-q') as HTMLInputElement;

describe('whole app', () => {
  it('renders every section with one H1 and no console errors', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Your Everyday Essentials.');
    for (const id of ['home', 'categories', 'essentials', 'shop', 'offers', 'seasonal', 'budget', 'list', 'about', 'location', 'contact']) {
      expect(document.getElementById(id), id).toBeTruthy();
    }
    expect(screen.getAllByRole('article').length).toBeGreaterThanOrEqual(12);
    expect(errors).toEqual([]);
  });

  it('hero shows the real shop photo: direct path, visible, not hidden', () => {
    render(<App />);
    const hero = document.getElementById('home')!;
    const img = hero.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/images/kailas-super-market.jpg');
    expect(img.getAttribute('alt')).toMatch(/Kailas Super Market/);
    expect(img.className).not.toMatch(/opacity-0|hidden/);
    expect(img.getAttribute('loading')).toBe('eager');
    // used again in the store section
    expect(document.getElementById('about')!.querySelector('img')!.getAttribute('src')).toBe('/images/kailas-super-market.jpg');
  });

  it('has no images without alt text', () => {
    render(<App />);
    document.querySelectorAll('img').forEach((i) => expect(i.getAttribute('alt')).toBeTruthy());
    document.querySelectorAll('svg[role="img"]').forEach((s) => expect(s.getAttribute('aria-label')).toBeTruthy());
  });

  it('adds to cart, changes quantity, persists, removes and clears', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getAllByRole('button', { name: 'Add Fresh Tomatoes to cart' })[0]);
    expect(localStorage.getItem('kailas:v1:cart')).toBe('[{"id":"tomato","qty":1}]');
    await u.click(screen.getAllByRole('button', { name: 'Increase Fresh Tomatoes' })[0]);
    expect(JSON.parse(localStorage.getItem('kailas:v1:cart')!)).toEqual([{ id: 'tomato', qty: 2 }]);
    await open(u, /^Cart, 2 items/);
    const dlg = screen.getByRole('dialog', { name: 'Your cart' });
    expect(within(dlg).getAllByText('₹60').length).toBe(2); // line total + subtotal
    await u.click(within(dlg).getByRole('button', { name: 'Decrease Fresh Tomatoes' }));
    expect(within(dlg).getByText(/Subtotal · 1 item/)).toBeTruthy();
    await u.click(within(dlg).getByRole('button', { name: 'Clear cart' }));
    await u.click(within(dlg).getByRole('button', { name: 'Yes, clear cart' }));
    expect(within(dlg).getByText('Your cart is empty')).toBeTruthy();
    expect(localStorage.getItem('kailas:v1:cart')).toBe('[]');
  });

  it('restores a saved cart on load and drops unknown items', () => {
    localStorage.setItem('kailas:v1:cart', JSON.stringify([{ id: 'milk-1l', qty: 3 }, { id: 'ghost', qty: 1 }]));
    render(<App />);
    expect(screen.getAllByRole('button', { name: /^Cart, 3 items/ }).length).toBeGreaterThan(0);
  });

  it('filters by category and by search, with an empty state', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole('button', { name: /^Dairy, \d+ products/ }));
    expect(screen.getByRole('heading', { name: 'Dairy', level: 2 })).toBeTruthy();
    const shop = document.getElementById('shop')!;
    expect(within(shop).getAllByRole('article').every((a) => /Dairy/.test(a.textContent!))).toBe(true);
    await u.click(within(shop).getByRole('button', { name: 'All' }));
    await u.type(shopQ(), 'dahi');
    expect(within(shop).getAllByRole('article')).toHaveLength(1);
    expect(within(shop).getByText('Fresh Curd')).toBeTruthy();
    await u.clear(shopQ());
    await u.type(shopQ(), 'zzzz');
    expect(within(shop).getByText('Nothing matches that yet')).toBeTruthy();
    await u.click(within(shop).getByRole('button', { name: 'Clear search and filters' }));
    expect(within(shop).getAllByRole('article').length).toBeGreaterThan(5);
  });

  it('search overlay suggests, opens details and records recently viewed', async () => {
    const u = userEvent.setup();
    render(<App />);
    await open(u, /^Search products$/);
    const dlg = screen.getByRole('dialog', { name: 'Search products' });
    await u.type(within(dlg).getByLabelText(/Search products or categories/), 'rice');
    await u.click(within(dlg).getByText('Basmati Rice'));
    expect(screen.getByRole('dialog', { name: 'Basmati Rice' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('kailas:v1:recent')!)).toEqual(['rice-basmati-5kg']);
    await u.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.getElementById('recent')).toBeTruthy();
  });

  it('wishlist saves, persists and adds to cart', async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getAllByRole('button', { name: 'Save Toned Milk to wishlist' })[0]);
    expect(JSON.parse(localStorage.getItem('kailas:v1:wishlist')!)).toEqual(['milk-1l']);
    await open(u, /^Wishlist, 1 items/);
    const dlg = screen.getByRole('dialog', { name: 'Your wishlist' });
    await u.click(within(dlg).getByRole('button', { name: /^Add all 1 to cart/ }));
    expect(JSON.parse(localStorage.getItem('kailas:v1:cart')!)).toEqual([{ id: 'milk-1l', qty: 1 }]);
  });

  it('shopping list: add, match to cart, tick, persist', async () => {
    const u = userEvent.setup();
    render(<App />);
    const input = screen.getByLabelText('Add an item to your list');
    await u.type(input, 'toor dal{enter}');
    await u.type(input, 'unobtainium{enter}');
    expect(JSON.parse(localStorage.getItem('kailas:v1:list')!)).toHaveLength(2);
    await u.click(screen.getByRole('button', { name: /^Add matches to cart/ }));
    expect(JSON.parse(localStorage.getItem('kailas:v1:cart')!)).toEqual([{ id: 'toor-dal-1kg', qty: 1 }]);
    await u.click(screen.getByRole('checkbox', { name: 'unobtainium' }));
    expect(screen.getByRole('button', { name: 'Clear completed items' })).toBeTruthy();
  });

  it('budget warns when the cart goes over', async () => {
    const u = userEvent.setup();
    render(<App />);
    const sec = document.getElementById('budget')!;
    await u.click(within(sec).getByRole('button', { name: '₹300' }));
    await u.click(screen.getAllByRole('button', { name: 'Add Basmati Rice to cart' })[0]);
    expect(within(sec).getByRole('alert').textContent).toContain('₹249 over your budget');
    await u.click(within(sec).getByRole('button', { name: 'Remove budget' }));
    expect(within(sec).getByText('No budget set')).toBeTruthy();
  });

  it('WhatsApp checkout is blocked, honestly, until a number is set', async () => {
    const u = userEvent.setup();
    const win = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    await u.click(screen.getAllByRole('button', { name: 'Add Toned Milk to cart' })[0]);
    await open(u, /^Cart, 1 items/);
    const dlg = screen.getByRole('dialog', { name: 'Your cart' });
    expect(within(dlg).getByText(/WhatsApp ordering isn’t switched on yet/)).toBeTruthy();
    expect(within(dlg).queryByRole('button', { name: /Order on WhatsApp/ })).toBeNull();
    expect(win).not.toHaveBeenCalled();
  });

  it('WhatsApp checkout validates, then opens a correct message', async () => {
    store.whatsappNumber = '98765 43210';
    const u = userEvent.setup();
    const win = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    await u.click(screen.getAllByRole('button', { name: 'Add Toned Milk to cart' })[0]);
    await u.click(screen.getAllByRole('button', { name: 'Increase Toned Milk' })[0]);
    await open(u, /^Cart, 2 items/);
    const dlg = screen.getByRole('dialog', { name: 'Your cart' });
    await u.click(within(dlg).getByRole('button', { name: /Order on WhatsApp/ }));
    expect(within(dlg).getByText('Please enter your name.')).toBeTruthy();
    expect(win).not.toHaveBeenCalled();
    await u.click(within(dlg).getByLabelText('Home delivery'));
    await u.type(within(dlg).getByLabelText('Name'), 'Asha');
    await u.click(within(dlg).getByRole('button', { name: /Order on WhatsApp/ }));
    expect(within(dlg).getByText('Please enter your delivery address.')).toBeTruthy();
    await u.type(within(dlg).getByLabelText('Delivery address'), '12 Rose Lane, Pune');
    await u.click(within(dlg).getByRole('button', { name: /Order on WhatsApp/ }));
    expect(win).toHaveBeenCalledTimes(1);
    const url = win.mock.calls[0][0] as string;
    expect(url.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toContain('*Name:* Asha');
    expect(text).toContain('Toned Milk (1 L) x 2 = ₹112');
    expect(text).toContain('*Delivery address:* 12 Rose Lane, Pune');
    expect(within(dlg).getByRole('status').textContent).toContain('Press Send');
    expect(errors).toEqual([]);
  });

  it('unset address/phone never show invented details', () => {
    render(<App />);
    expect(screen.getAllByText(/Address details coming soon/).length).toBeGreaterThan(0);
    expect(document.querySelector('iframe')).toBeNull();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
  });
});

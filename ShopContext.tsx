import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartLine, Filters, ListItem } from '../types';
import { store } from '../config/store';
import { getProduct } from '../data/lookup';
import { addToCart, cartCount, cartSavings, cartTotal, removeLine, sanitizeCart, sanitizeIds, setQty as setLineQty } from '../lib/cart';
import type { Customer } from '../lib/whatsapp';

const K = { cart: 'kailas:v1:cart', wish: 'kailas:v1:wishlist', list: 'kailas:v1:list', recent: 'kailas:v1:recent', budget: 'kailas:v1:budget', customer: 'kailas:v1:customer' };

function usePersistent<T>(key: string, initial: T, revive: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); if (raw !== null) return revive(JSON.parse(raw)); } catch { /* ignore */ }
    return initial;
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ } }, [key, value]);
  return [value, setValue] as const;
}

export const defaultFilters: Filters = { category: null, query: '', sort: 'featured', inStockOnly: false };
const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()));
const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });

export interface Toast { id: string; message: string; action?: { label: string; run: () => void } }

interface Shop {
  cart: CartLine[]; cartCount: number; cartTotal: number; cartSavings: number; qtyOf: (id: string) => number;
  add: (id: string, qty?: number) => void; setQty: (id: string, qty: number) => void; remove: (id: string) => void; clearCart: () => void;
  wishlist: string[]; isWished: (id: string) => boolean; toggleWish: (id: string) => void;
  list: ListItem[]; addListItem: (text: string) => void; toggleListItem: (id: string) => void; removeListItem: (id: string) => void; clearDoneItems: () => void;
  recent: string[]; clearRecent: () => void;
  budget: number | null; setBudget: (n: number | null) => void;
  customer: Customer; setCustomer: (c: Partial<Customer>) => void;
  filters: Filters; setFilters: (f: Partial<Filters>) => void; goToShop: (f?: Partial<Filters>) => void;
  cartOpen: boolean; wishOpen: boolean; searchOpen: boolean; quickView: string | null;
  openCart: () => void; openWish: () => void; openSearch: () => void; openQuickView: (id: string) => void; closeAll: () => void;
  toasts: Toast[]; toast: (message: string, opts?: { id?: string; action?: Toast['action'] }) => void; dismissToast: (id: string) => void;
}

const Ctx = createContext<Shop | null>(null);
export const useShop = (): Shop => { const c = useContext(Ctx); if (!c) throw new Error('useShop outside provider'); return c; };

const defaultCustomer: Customer = { name: '', mode: store.delivery.pickup ? 'pickup' : 'delivery', address: '', note: '' };

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = usePersistent<CartLine[]>(K.cart, [], (r) => sanitizeCart(r, getProduct));
  const [wishlist, setWishlist] = usePersistent<string[]>(K.wish, [], (r) => sanitizeIds(r, getProduct));
  const [recent, setRecent] = usePersistent<string[]>(K.recent, [], (r) => sanitizeIds(r, getProduct, 8));
  const [list, setList] = usePersistent<ListItem[]>(K.list, [], (r) =>
    Array.isArray(r) ? r.filter((i): i is ListItem => !!i && typeof i.id === 'string' && typeof i.text === 'string').map((i) => ({ id: i.id, text: i.text.slice(0, 80), done: !!i.done })).slice(0, 100) : []);
  const [budget, setBudgetState] = usePersistent<number | null>(K.budget, null, (r) => (typeof r === 'number' && r > 0 ? r : null));
  const [customer, setCustomerState] = usePersistent<Customer>(K.customer, defaultCustomer, (r) => {
    const c = (r ?? {}) as Partial<Customer>;
    const mode = c.mode === 'delivery' && store.delivery.homeDelivery ? 'delivery' : store.delivery.pickup ? 'pickup' : 'delivery';
    return { name: String(c.name ?? '').slice(0, 60), mode, address: String(c.address ?? '').slice(0, 300), note: '' };
  });

  const [filters, setFiltersState] = useState<Filters>(defaultFilters);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => { setToasts((t) => t.filter((x) => x.id !== id)); const h = timers.current.get(id); if (h) window.clearTimeout(h); timers.current.delete(id); }, []);
  const toast = useCallback((message: string, opts: { id?: string; action?: Toast['action'] } = {}) => {
    const id = opts.id ?? uid();
    setToasts((t) => [...t.filter((x) => x.id !== id), { id, message, action: opts.action }].slice(-3));
    const old = timers.current.get(id); if (old) window.clearTimeout(old);
    timers.current.set(id, window.setTimeout(() => dismissToast(id), 3200));
  }, [dismissToast]);

  const closeAll = useCallback(() => { setCartOpen(false); setWishOpen(false); setSearchOpen(false); setQuickView(null); }, []);
  const openCart = useCallback(() => { setWishOpen(false); setSearchOpen(false); setQuickView(null); setCartOpen(true); }, []);
  const openWish = useCallback(() => { setCartOpen(false); setSearchOpen(false); setQuickView(null); setWishOpen(true); }, []);
  const openSearch = useCallback(() => { setCartOpen(false); setWishOpen(false); setQuickView(null); setSearchOpen(true); }, []);
  const openQuickView = useCallback((id: string) => {
    if (!getProduct(id)) return;
    setSearchOpen(false); setQuickView(id);
    setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8));
  }, [setRecent]);

  const add = useCallback((id: string, qty = 1) => {
    const p = getProduct(id);
    if (!p || !p.inStock) return;
    setCart((c) => addToCart(c, id, qty));
    toast(`${p.name} added to cart`, { id: 'cart', action: { label: 'View cart', run: openCart } });
  }, [setCart, toast, openCart]);
  const setQty = useCallback((id: string, qty: number) => setCart((c) => setLineQty(c, id, qty)), [setCart]);
  const remove = useCallback((id: string) => setCart((c) => removeLine(c, id)), [setCart]);
  const clearCart = useCallback(() => setCart([]), [setCart]);

  const toggleWish = useCallback((id: string) => {
    const p = getProduct(id); if (!p) return;
    setWishlist((w) => { const has = w.includes(id); toast(has ? `${p.name} removed from wishlist` : `${p.name} saved to wishlist`, { id: 'wish' }); return has ? w.filter((x) => x !== id) : [id, ...w]; });
  }, [setWishlist, toast]);

  const addListItem = useCallback((text: string) => { const t = text.trim().slice(0, 80); if (t) setList((l) => [...l, { id: uid(), text: t, done: false }]); }, [setList]);
  const toggleListItem = useCallback((id: string) => setList((l) => l.map((i) => (i.id === id ? { ...i, done: !i.done } : i))), [setList]);
  const removeListItem = useCallback((id: string) => setList((l) => l.filter((i) => i.id !== id)), [setList]);
  const clearDoneItems = useCallback(() => setList((l) => l.filter((i) => !i.done)), [setList]);

  const setFilters = useCallback((f: Partial<Filters>) => setFiltersState((cur) => ({ ...cur, ...f })), []);
  const goToShop = useCallback((f: Partial<Filters> = {}) => {
    setFiltersState({ ...defaultFilters, ...f });
    closeAll();
    window.setTimeout(() => scrollToId('shop'), 60);
  }, [closeAll]);

  const value = useMemo<Shop>(() => ({
    cart, cartCount: cartCount(cart), cartTotal: cartTotal(cart, getProduct), cartSavings: cartSavings(cart, getProduct),
    qtyOf: (id) => cart.find((l) => l.id === id)?.qty ?? 0,
    add, setQty, remove, clearCart,
    wishlist, isWished: (id) => wishlist.includes(id), toggleWish,
    list, addListItem, toggleListItem, removeListItem, clearDoneItems,
    recent, clearRecent: () => setRecent([]),
    budget, setBudget: setBudgetState,
    customer, setCustomer: (c) => setCustomerState((cur) => ({ ...cur, ...c })),
    filters, setFilters, goToShop,
    cartOpen, wishOpen, searchOpen, quickView, openCart, openWish, openSearch, openQuickView, closeAll,
    toasts, toast, dismissToast,
  }), [cart, wishlist, list, recent, budget, customer, filters, cartOpen, wishOpen, searchOpen, quickView, toasts,
    add, setQty, remove, clearCart, toggleWish, addListItem, toggleListItem, removeListItem, clearDoneItems, setRecent,
    setBudgetState, setCustomerState, setFilters, goToShop, openCart, openWish, openSearch, openQuickView, closeAll, toast, dismissToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

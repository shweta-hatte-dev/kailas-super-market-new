import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SearchX, X } from 'lucide-react';
import { categories } from '../data/categories';
import { allProducts } from '../data/lookup';
import { matchCategories, searchProducts } from '../lib/search';
import { useShop } from '../context/ShopContext';
import { ProductVisual, productTint } from './ProductCard';
import { Price } from './ui';

function Panel() {
  const { closeAll, goToShop, openQuickView } = useShop();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const hits = useMemo(() => searchProducts(q, allProducts, categories, { limit: 6 }), [q]);
  const cats = useMemo(() => matchCategories(q, categories), [q]);
  const total = useMemo(() => searchProducts(q, allProducts, categories).length, [q]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    input.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeAll(); return; }
      if (e.key !== 'Tab' || !root.current) return;
      const f = root.current.querySelectorAll<HTMLElement>('button:not([disabled]),input,a[href]');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [closeAll]);

  const typed = q.trim().length > 0;
  return (
    <div className="fixed inset-0 z-[60]">
      <motion.div className="absolute inset-0 bg-forest/45" onClick={closeAll} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div ref={root} role="dialog" aria-modal="true" aria-label="Search products"
        className="relative mx-auto max-h-[100dvh] w-full max-w-2xl overflow-y-auto bg-cream sm:mt-16 sm:max-h-[80vh] sm:rounded-xl"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
        <form role="search" className="sticky top-0 z-10 flex items-center gap-2 border-b border-forest/10 bg-cream p-3"
          onSubmit={(e) => { e.preventDefault(); if (typed) goToShop({ query: q.trim() }); }}>
          <Search size={20} className="ml-2 shrink-0 text-forest" aria-hidden="true" />
          <label htmlFor="overlay-q" className="sr-only">Search products or categories</label>
          <input id="overlay-q" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rice, dal, milk, soap…" autoComplete="off" enterKeyHint="search" className="min-h-[48px] min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink/50" />
          {typed && <button type="button" onClick={() => { setQ(''); input.current?.focus(); }} className="btn !min-h-[44px] px-3 text-forest underline">Clear</button>}
          <button type="button" onClick={closeAll} aria-label="Close search" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-forest hover:bg-forest/10"><X size={22} /></button>
        </form>
        <div className="p-3 sm:p-4" aria-live="polite">
          {!typed && (
            <div>
              <p className="mb-3 text-[15px] text-ink/75">Search by product or category, or jump to an aisle.</p>
              <div className="flex flex-wrap gap-2">{categories.slice(0, 8).map((c) => <button key={c.slug} type="button" className="chip" onClick={() => goToShop({ category: c.slug })}>{c.name}</button>)}</div>
            </div>
          )}
          {typed && cats.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{cats.map((c) => <button key={c.slug} type="button" className="chip" onClick={() => goToShop({ category: c.slug })}>Browse {c.name}</button>)}</div>}
          {typed && hits.length > 0 && (
            <>
              <ul>
                {hits.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => openQuickView(p.id)} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-forest/5">
                      <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-lg" style={{ background: productTint(p) }}><ProductVisual p={p} /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[16px] font-semibold">{p.name}</span><span className="text-sm text-ink/65">{p.unit}{!p.inStock && ' · Out of stock'}</span></span>
                      <Price price={p.price} />
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => goToShop({ query: q.trim() })} className="btn btn-primary mt-3 w-full">See all {total} {total === 1 ? 'result' : 'results'}</button>
            </>
          )}
          {typed && hits.length === 0 && cats.length === 0 && (
            <div className="py-10 text-center" role="status">
              <SearchX size={34} className="mx-auto text-forest" aria-hidden="true" />
              <p className="mt-2 text-xl font-semibold text-forest">No products match “{q.trim()}”</p>
              <p className="mx-auto mt-1 max-w-xs text-ink/70">Try a shorter word or browse a category.</p>
              <button type="button" onClick={() => { setQ(''); input.current?.focus(); }} className="btn btn-outline mt-4">Clear search</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function SearchOverlay() {
  const { searchOpen } = useShop();
  return <AnimatePresence>{searchOpen && <Panel key="search" />}</AnimatePresence>;
}

import { useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import { categories, categoryMap } from '../data/categories';
import { allProducts } from '../data/lookup';
import { percentOff } from '../lib/format';
import { searchProducts } from '../lib/search';
import { useShop, defaultFilters } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { DemoNotice, SectionHead } from './ui';

const PAGE = 12;

export function ShopSection() {
  const { filters, setFilters, goToShop } = useShop();
  const [shown, setShown] = useState(PAGE);
  const { category, query, sort, inStockOnly } = filters;

  const results = useMemo(() => {
    let list = query.trim() ? searchProducts(query, allProducts, categories) : [...allProducts];
    if (category) list = list.filter((p) => p.category === category);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'discount') list.sort((a, b) => percentOff(b.price, b.mrp) - percentOff(a.price, a.mrp));
    else if (!query.trim()) list.sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
    return list;
  }, [category, query, sort, inStockOnly]);

  const filtered = !!(category || query.trim() || inStockOnly);
  const title = query.trim() ? `Results for “${query.trim()}”` : category ? categoryMap[category].name : 'Popular products';
  const visible = results.slice(0, shown);
  const reset = () => { setFilters(defaultFilters); setShown(PAGE); };
  const change = (f: Parameters<typeof setFilters>[0]) => { setFilters(f); setShown(PAGE); };

  return (
    <section id="shop" aria-labelledby="shop-title" className="py-14 sm:py-20">
      <div className="container-x">
        <SectionHead id="shop-title" title={title} text={filtered ? `${results.length} ${results.length === 1 ? 'product' : 'products'} found` : 'Everyday favourites from across the store.'} />
        <DemoNotice className="-mt-4 mb-5" />

        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="relative">
            <label htmlFor="shop-q" className="sr-only">Search products</label>
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest" aria-hidden="true" />
            <input id="shop-q" type="search" value={query} onChange={(e) => change({ query: e.target.value })} placeholder="Search by product or category" className="field pl-10 pr-11" autoComplete="off" />
            {query && <button type="button" onClick={() => change({ query: '' })} aria-label="Clear search" className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-forest"><X size={18} /></button>}
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="shop-sort" className="sr-only">Sort products</label>
            <select id="shop-sort" value={sort} onChange={(e) => change({ sort: e.target.value as typeof sort })} className="field !w-auto min-h-[44px]">
              <option value="featured">Popular first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="discount">Biggest discount</option>
            </select>
          </div>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-[15px] font-medium text-forest">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => change({ inStockOnly: e.target.checked })} className="h-5 w-5 accent-[#173F2B]" /> Available only
          </label>
        </div>

        <div className="scroll-row -mx-4 mb-7 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
          <button type="button" className="chip" aria-pressed={!category} onClick={() => change({ category: null })}>All</button>
          {categories.map((c) => <button key={c.slug} type="button" className="chip" aria-pressed={category === c.slug} onClick={() => change({ category: c.slug })}>{c.name}</button>)}
        </div>

        {results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-forest/30 bg-white px-6 py-14 text-center" role="status">
            <SearchX size={36} className="mx-auto text-forest" aria-hidden="true" />
            <h3 className="mt-3 text-2xl">Nothing matches that yet</h3>
            <p className="mx-auto mt-1 max-w-md text-ink/75">Try a shorter word, check the spelling, or browse a category. You can also ask the store on WhatsApp.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={reset} className="btn btn-primary">Clear search and filters</button>
              <button type="button" onClick={() => goToShop({ category: 'fruits-vegetables' })} className="btn btn-outline">Browse fruits & vegetables</button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
            </div>
            {shown < results.length && (
              <div className="mt-8 text-center">
                <button type="button" className="btn btn-outline px-8" onClick={() => setShown((n) => n + PAGE)}>Show more ({results.length - shown} left)</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

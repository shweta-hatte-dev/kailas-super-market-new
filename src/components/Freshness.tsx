import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { allProducts } from '../data/lookup';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

const groups = [{ slug: 'fruits', label: 'Fresh fruits' }, { slug: 'vegetables', label: 'Fresh vegetables' }];

export function Freshness() {
  const { goToShop } = useShop();
  const [active, setActive] = useState(groups[0].slug);
  const items = allProducts.filter((p) => p.category === active);
  return (
    <section id="fresh" aria-labelledby="fresh-title" className="py-6 sm:py-10">
      <div className="container-x">
        <div className="on-dark overflow-hidden rounded-2xl bg-forest p-5 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-xl">
              <h2 id="fresh-title" className="text-4xl leading-tight !text-cream sm:text-5xl">Freshness you can see.</h2>
              <p className="mt-3 text-lg text-cream/85">Fruit and vegetables for your kitchen, picked from the shelf and ready to add to your cart.</p>
            </div>
            <button type="button" onClick={() => goToShop({ category: active })} className="btn btn-gold">Shop all {groups.find((g) => g.slug === active)!.label.toLowerCase()} <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
          <div role="tablist" aria-label="Fresh produce" className="mt-6 flex gap-2">
            {groups.map((g) => (
              <button key={g.slug} role="tab" aria-selected={active === g.slug} aria-controls="fresh-list" id={`fresh-tab-${g.slug}`} onClick={() => setActive(g.slug)}
                className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-[15px] font-semibold transition-colors ${active === g.slug ? 'bg-cream text-forest' : 'border border-cream/40 text-cream hover:bg-cream/10'}`}>{g.label}</button>
            ))}
          </div>
          <div id="fresh-list" role="tabpanel" aria-labelledby={`fresh-tab-${active}`} className="scroll-row -mx-5 mt-6 px-5 sm:mx-0 sm:px-0">
            {items.map((p, i) => <div key={p.id} className="w-[210px] shrink-0 sm:w-[240px]"><ProductCard p={p} index={i} /></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

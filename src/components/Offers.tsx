import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { store } from '../config/store';
import { combos, offerBanners, offerTabs } from '../data/offers';
import { seasons } from '../data/seasons';
import { allProducts, getProduct } from '../data/lookup';
import { percentOff } from '../lib/format';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductPhoto } from './ProductPhoto';
import { DemoNotice, SectionHead } from './ui';

export const activeSeason = () => (store.seasonal.enabled ? seasons.find((s) => s.key === store.seasonal.active) : undefined);

function tabProducts(id: string): Product[] {
  if (id === 'combo') return combos;
  if (id === 'festival') return (activeSeason()?.productIds ?? []).map(getProduct).filter((p): p is Product => !!p);
  if (id === 'savings') return allProducts.filter((p) => percentOff(p.price, p.mrp) > 0).sort((a, b) => percentOff(b.price, b.mrp) - percentOff(a.price, a.mrp)).slice(0, 8);
  return (offerTabs.find((t) => t.id === id)?.ids ?? []).map(getProduct).filter((p): p is Product => !!p);
}

export function Offers() {
  const tabs = offerTabs.filter((t) => t.id !== 'festival' || activeSeason());
  const [active, setActive] = useState(tabs[0].id);
  const items = tabProducts(active);
  const season = activeSeason();

  const pick = (tab: string) => { setActive(tab); document.getElementById('offer-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };

  return (
    <section id="offers" aria-labelledby="offers-title" className="bg-cream-deep py-14 sm:py-20">
      <div className="container-x">
        <SectionHead id="offers-title" title="Offers and deals" text="Picks, bundles and savings for the whole family." />
        <DemoNotice className="-mt-4 mb-5" />

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {offerBanners.map((b, i) => {
            const dark = b.tone === 'forest';
            const tone = dark ? 'bg-forest text-cream' : b.tone === 'gold' ? 'bg-gold-tint text-forest' : 'bg-sage-deep text-forest';
            const pics = tabProducts(b.tab).slice(0, 3);
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                className={`${dark ? 'on-dark' : ''} ${tone} group relative flex min-h-[210px] overflow-hidden rounded-2xl p-6 sm:p-7`}>
                <div className="relative z-10 flex max-w-[58%] flex-col items-start">
                  <h3 className={`text-2xl leading-tight sm:text-3xl ${dark ? '!text-cream' : ''}`}>{b.title}</h3>
                  <p className={`mt-2 text-[15px] ${dark ? 'text-cream/85' : 'text-forest/85'}`}>{b.text}</p>
                  <button type="button" onClick={() => pick(b.tab)} className={`btn mt-auto ${dark ? 'btn-gold' : 'btn-primary'} mt-5`}>{b.cta} <ArrowRight size={17} aria-hidden="true" /></button>
                </div>
                <div className="absolute -right-4 top-1/2 flex -translate-y-1/2 items-center" aria-hidden="true">
                  {pics.map((p, k) => (
                    <div key={p.id} className="-ml-9 h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:-translate-y-1 sm:h-32 sm:w-32" style={{ zIndex: 3 - k, transform: `translateY(${k === 1 ? 14 : -6}px)` }}>
                      <ProductPhoto p={p} className="h-full w-full" />
                    </div>
                  ))}
                </div>
                {store.demoData && <span className="absolute bottom-3 right-4 text-xs opacity-70">Sample</span>}
              </motion.div>
            );
          })}
        </div>

        <div role="tablist" aria-label="Offer groups" className="scroll-row -mx-4 mb-6 px-4 sm:mx-0 sm:px-0">
          {tabs.map((t) => (
            <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={active === t.id} aria-controls="offer-list" tabIndex={active === t.id ? 0 : -1} className="chip" onClick={() => setActive(t.id)}
              onKeyDown={(e) => {
                const i = tabs.findIndex((x) => x.id === active);
                if (e.key === 'ArrowRight') { setActive(tabs[(i + 1) % tabs.length].id); }
                if (e.key === 'ArrowLeft') { setActive(tabs[(i - 1 + tabs.length) % tabs.length].id); }
              }}>{t.label}</button>
          ))}
        </div>
        <div id="offer-list" role="tabpanel" aria-labelledby={`tab-${active}`}>
          {active === 'festival' && season && <p className="mb-4 text-ink/75">{season.label}: {season.text}</p>}
          {active === 'combo' && <p className="mb-4 text-ink/75">Each combo is priced together. The cart and your WhatsApp order list what is inside.</p>}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

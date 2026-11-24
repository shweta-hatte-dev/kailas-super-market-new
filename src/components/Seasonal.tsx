import { motion } from 'framer-motion';
import { getProduct } from '../data/lookup';
import type { Product } from '../types';
import { activeSeason } from './Offers';
import { AddControl, ProductVisual } from './ProductCard';
import { Price } from './ui';

const tones = {
  forest: { bg: 'bg-forest', text: 'text-cream', sub: 'text-cream/85', dark: true },
  gold: { bg: 'bg-gold-tint', text: 'text-forest', sub: 'text-forest/85', dark: false },
  sage: { bg: 'bg-sage-deep', text: 'text-forest', sub: 'text-forest/85', dark: false },
};

function Decor({ kind }: { kind: string }) {
  const mark: Record<string, string> = { sparkle: 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z', snow: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7', drops: 'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z', sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1', leaves: 'M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8' };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute right-4 top-4 h-28 w-28 opacity-25 sm:h-40 sm:w-40" fill="none" stroke="#C6A66B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={mark[kind]} />
    </svg>
  );
}

export function Seasonal() {
  const season = activeSeason();
  if (!season) return null;
  const t = tones[season.tone];
  const items = season.productIds.map(getProduct).filter((p): p is Product => !!p);
  return (
    <section id="seasonal" aria-labelledby="season-title" className="py-14 sm:py-20">
      <div className="container-x">
        <div className={`${t.dark ? 'on-dark' : ''} ${t.bg} relative overflow-hidden rounded-xl p-6 sm:p-10`}>
          <Decor kind={season.decor} />
          <div className="relative max-w-xl">
            <p className={`text-sm font-semibold ${t.sub}`}>{season.label} collection</p>
            <h2 id="season-title" className={`mt-1 text-3xl sm:text-5xl ${t.dark ? '!text-cream' : ''}`}>{season.headline}</h2>
            <p className={`mt-3 text-lg ${t.sub}`}>{season.text}</p>
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex flex-col rounded-lg bg-white p-3 text-ink">
                <div className="aspect-square overflow-hidden rounded-md"><ProductVisual p={p} /></div>
                <p className="mt-1 text-[15px] font-semibold leading-snug">{p.name}</p>
                <p className="text-sm text-ink/65">{p.unit}</p>
                <Price price={p.price} mrp={p.mrp} className="mt-1" />
                <div className="mt-2.5 flex min-h-[44px] items-end"><AddControl p={p} /></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

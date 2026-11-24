import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import type { Product } from '../types';
import { categoryMap } from '../data/categories';
import { percentOff } from '../lib/format';
import { useShop } from '../context/ShopContext';
import { getProduct } from '../data/lookup';
import { ProductPhoto } from './ProductPhoto';
import { Tilt } from './Tilt';
import { Availability, Price, QtyStepper } from './ui';

export function productTint(p: Product) { return categoryMap[p.category]?.tint ?? '#F2ECDD'; }

/** Photo of a product, or a 3-photo collage for combos. Sizing comes from className. */
export function ProductVisual({ p, className = '', zoom = false }: { p: Product; className?: string; zoom?: boolean }) {
  const ids = p.bundle?.map(getProduct).filter((x): x is Product => !!x);
  if (ids?.length) {
    return (
      <div className={`grid grid-cols-3 gap-0.5 overflow-hidden ${className}`}>
        {ids.map((b) => <ProductPhoto key={b.id} p={b} className="h-full w-full" zoom={zoom} />)}
      </div>
    );
  }
  return <ProductPhoto p={p} className={`h-full w-full ${className}`} zoom={zoom} />;
}

export function WishButton({ id, name, className = '' }: { id: string; name: string; className?: string }) {
  const { isWished, toggleWish } = useShop();
  const on = isWished(id);
  return (
    <button type="button" onClick={() => toggleWish(id)} aria-pressed={on} aria-label={on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={`flex h-11 w-11 items-center justify-center rounded-md bg-white/90 text-forest transition-colors hover:bg-white ${className}`}>
      <Heart size={19} className={on ? 'fill-[#B4472F] text-[#B4472F]' : ''} />
    </button>
  );
}

export function AddControl({ p, large = false }: { p: Product; large?: boolean }) {
  const { qtyOf, add } = useShop();
  const q = qtyOf(p.id);
  if (!p.inStock) return <button type="button" disabled className="btn btn-outline w-full">Out of stock</button>;
  if (q > 0) return <QtyStepper id={p.id} name={p.name} qty={q} large={large} />;
  return (
    <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => add(p.id)} className={`btn btn-primary ${large ? 'px-8' : 'w-full'}`} aria-label={`Add ${p.name} to cart`}>
      <Plus size={18} aria-hidden="true" /> Add to cart
    </motion.button>
  );
}

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { openQuickView } = useShop();
  const off = percentOff(p.price, p.mrp);
  const catName = categoryMap[p.category]?.name ?? 'Combo offer';
  return (
    <Tilt max={4} className="h-full"><motion.article
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-forest/10 bg-white shadow-[0_2px_10px_-6px_rgba(23,63,43,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative overflow-hidden" style={{ background: productTint(p) }}>
        <button type="button" onClick={() => openQuickView(p.id)} aria-label={`View details for ${p.name}`} className="block aspect-[5/4] w-full">
          <ProductVisual p={p} zoom />
        </button>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {p.badge && <span className="rounded-full bg-forest px-2.5 py-0.5 text-xs font-semibold text-cream">{p.badge}</span>}
          {off > 0 && <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-forest">{off}% off</span>}
        </div>
        <WishButton id={p.id} name={p.name} className="absolute right-2 top-2 !rounded-full shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-xs text-forest/75">{catName}</p>
        <h3 className="mt-0.5 font-sans text-[15px] font-semibold leading-snug text-ink">
          <button type="button" onClick={() => openQuickView(p.id)} className="text-left hover:underline">{p.name}</button>
        </h3>
        <p className="text-sm text-ink/65">{p.unit}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <Price price={p.price} mrp={p.mrp} />
          <Availability inStock={p.inStock} />
        </div>
        <div className="mt-3 flex min-h-[44px] items-end"><AddControl p={p} /></div>
      </div>
    </motion.article></Tilt>
  );
}

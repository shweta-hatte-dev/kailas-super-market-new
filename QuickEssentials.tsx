import { Check, Plus } from 'lucide-react';
import { allProducts } from '../data/lookup';
import { useShop } from '../context/ShopContext';
import { ProductVisual, productTint } from './ProductCard';
import { Price, QtyStepper, SectionHead } from './ui';

export function QuickEssentials() {
  const { qtyOf, add } = useShop();
  const items = allProducts.filter((p) => p.quick && p.inStock);
  const missing = items.filter((p) => qtyOf(p.id) === 0);
  return (
    <section id="essentials" aria-labelledby="qe-title" className="bg-sage py-14 sm:py-16">
      <div className="container-x">
        <SectionHead id="qe-title"
          title="Your everyday essentials"
          text="The things you buy again and again. One tap to add."
          action={
            <button type="button" className="btn btn-primary" disabled={!missing.length} onClick={() => missing.forEach((p) => add(p.id))}>
              {missing.length ? <><Plus size={18} aria-hidden="true" /> Add all {missing.length} to cart</> : <><Check size={18} aria-hidden="true" /> All in your cart</>}
            </button>
          }
        />
        <ul className="scroll-row -mx-4 px-4 sm:mx-0 sm:px-0" aria-label="Everyday essentials">
          {items.map((p) => {
            const q = qtyOf(p.id);
            return (
              <li key={p.id} className="w-[158px] shrink-0 rounded-lg bg-white p-3 ring-1 ring-forest/10 sm:w-[184px]">
                <div className="aspect-square overflow-hidden rounded-lg" style={{ background: productTint(p) }}><ProductVisual p={p} /></div>
                <p className="mt-2 truncate text-[15px] font-semibold" title={p.name}>{p.name}</p>
                <p className="text-sm text-ink/65">{p.unit}</p>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <Price price={p.price} />
                </div>
                <div className="mt-2.5 min-h-[44px]">
                  {q > 0 ? <QtyStepper id={p.id} name={p.name} qty={q} /> : (
                    <button type="button" onClick={() => add(p.id)} className="btn btn-primary w-full px-3" aria-label={`Add ${p.name} to cart`}><Plus size={18} aria-hidden="true" /> Add</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

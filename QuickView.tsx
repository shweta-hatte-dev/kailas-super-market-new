import { categoryMap } from '../data/categories';
import { allProducts, getProduct } from '../data/lookup';
import { percentOff } from '../lib/format';
import { useShop } from '../context/ShopContext';
import { AddControl, ProductVisual, WishButton, productTint } from './ProductCard';
import { Availability, Modal, Price } from './ui';

export function QuickView() {
  const { quickView, closeAll, openQuickView } = useShop();
  const p = quickView ? getProduct(quickView) : undefined;
  const related = p ? allProducts.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4) : [];
  const off = p ? percentOff(p.price, p.mrp) : 0;
  return (
    <Modal open={!!p} onClose={closeAll} title={p?.name ?? 'Product'}>
      {p && (
        <div className="grid sm:grid-cols-2">
          <div className="relative" style={{ background: productTint(p) }}>
            <ProductVisual p={p} className="aspect-square w-full sm:aspect-auto sm:h-full sm:min-h-[320px]" />
            {off > 0 && <span className="absolute left-3 top-3 rounded bg-gold px-2.5 py-1 text-sm font-bold text-forest">{off}% off</span>}
          </div>
          <div className="flex flex-col p-5 sm:p-7">
            <p className="text-sm text-forest/80">{categoryMap[p.category]?.name ?? 'Combo offer'}</p>
            <h2 className="mt-1 text-3xl">{p.name}</h2>
            <p className="mt-1 text-ink/70">{p.unit}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"><Price price={p.price} mrp={p.mrp} /><Availability inStock={p.inStock} /></div>
            {p.description && <p className="mt-4 text-ink/80">{p.description}</p>}
            {p.includes && <p className="mt-4 text-[15px] text-ink/80"><b>Includes:</b> {p.includes}</p>}
            <div className="mt-6 flex items-center gap-3"><AddControl p={p} large /><WishButton id={p.id} name={p.name} className="border border-forest/30" /></div>
          </div>
          {related.length > 0 && (
            <div className="border-t border-forest/10 p-5 sm:col-span-2 sm:p-7">
              <h3 className="font-sans text-base font-semibold text-ink">More from {categoryMap[p.category]?.name}</h3>
              <ul className="scroll-row mt-3">
                {related.map((r) => (
                  <li key={r.id} className="w-[132px] shrink-0">
                    <button type="button" onClick={() => openQuickView(r.id)} className="block w-full rounded-lg bg-white p-2 text-left ring-1 ring-forest/10 hover:shadow-lift">
                      <span className="block aspect-square overflow-hidden rounded-md" style={{ background: productTint(r) }}><ProductVisual p={r} /></span>
                      <span className="mt-1.5 block truncate text-sm font-semibold">{r.name}</span>
                      <span className="text-xs text-ink/65">{r.unit}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

import { Heart, X } from 'lucide-react';
import { getProduct } from '../data/lookup';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { AddControl, ProductVisual, productTint } from './ProductCard';
import { Drawer, Price } from './ui';

export function WishlistDrawer() {
  const { wishOpen, closeAll, wishlist, toggleWish, add, goToShop } = useShop();
  const items = wishlist.map(getProduct).filter((p): p is Product => !!p);
  const addable = items.filter((p) => p.inStock);
  return (
    <Drawer open={wishOpen} onClose={closeAll} title="Your wishlist"
      footer={addable.length > 0 && <button type="button" className="btn btn-primary w-full" onClick={() => addable.forEach((p) => add(p.id))}>Add all {addable.length} to cart</button>}>
      {items.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <Heart size={42} className="text-forest" aria-hidden="true" />
          <p className="mt-3 font-display text-2xl text-forest">Nothing saved yet</p>
          <p className="mt-1 max-w-[16rem] text-ink/70">Tap the heart on any product to keep it here for later.</p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => goToShop()}>Browse products</button>
        </div>
      ) : (
        <ul className="divide-y divide-forest/10">
          {items.map((p) => (
            <li key={p.id} className="flex gap-3 py-3">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg" style={{ background: productTint(p) }}><ProductVisual p={p} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug">{p.name}</p>
                <p className="text-sm text-ink/65">{p.unit}</p>
                <Price price={p.price} mrp={p.mrp} className="mt-1" />
                <div className="mt-2"><AddControl p={p} /></div>
              </div>
              <button type="button" onClick={() => toggleWish(p.id)} aria-label={`Remove ${p.name} from wishlist`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink/60 hover:bg-forest/10 hover:text-forest"><X size={19} /></button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

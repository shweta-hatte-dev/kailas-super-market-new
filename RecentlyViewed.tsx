import { getProduct } from '../data/lookup';
import { useShop } from '../context/ShopContext';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { SectionHead } from './ui';

export function RecentlyViewed() {
  const { recent, clearRecent } = useShop();
  const items = recent.map(getProduct).filter((p): p is Product => !!p);
  if (!items.length) return null;
  return (
    <section id="recent" aria-labelledby="recent-title" className="pb-14 sm:pb-20">
      <div className="container-x">
        <SectionHead id="recent-title" title="Recently viewed" text="Pick up where you left off." action={<button type="button" onClick={clearRecent} className="btn btn-outline">Clear history</button>} />
        <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:px-0">
          {items.map((p, i) => <div key={p.id} className="w-[200px] shrink-0 sm:w-[230px]"><ProductCard p={p} index={i} /></div>)}
        </div>
      </div>
    </section>
  );
}

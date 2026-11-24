import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '../data/categories';
import { allProducts, getProduct } from '../data/lookup';
import { useShop } from '../context/ShopContext';
import { ProductPhoto } from './ProductPhoto';
import { SectionHead } from './ui';
import { Tilt } from './Tilt';

export function Categories() {
  const { goToShop } = useShop();
  return (
    <section id="categories" aria-labelledby="cat-title" className="py-14 sm:py-20">
      <div className="container-x">
        <SectionHead id="cat-title" title="Shop by category" text="Pick an aisle and we’ll show everything on that shelf." />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((c, i) => {
            const count = allProducts.filter((p) => p.category === c.slug).length;
            const cover = getProduct(c.cover) ?? allProducts.find((p) => p.category === c.slug)!;
            return (
              <Tilt key={c.slug} max={5} className="h-full"><motion.button
                 type="button" onClick={() => goToShop({ category: c.slug })}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-forest text-left shadow-[0_2px_12px_-6px_rgba(23,63,43,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:aspect-[5/6]"
                aria-label={`${c.name}, ${count} products`}
              >
                <ProductPhoto p={cover} className="absolute inset-0 h-full w-full" zoom />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" aria-hidden="true" />
                <div className="on-dark absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
                  <h3 className="font-display text-xl font-semibold leading-tight !text-cream sm:text-2xl">{c.name}</h3>
                  <p className="mt-0.5 text-sm text-cream/85">{count} products</p>
                </div>
                <span className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-forest transition-colors group-hover:bg-gold" aria-hidden="true"><ArrowUpRight size={18} /></span>
              </motion.button></Tilt>
            );
          })}
        </div>
      </div>
    </section>
  );
}

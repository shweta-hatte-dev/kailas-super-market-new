import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { store } from '../config/store';
import { useShop } from '../context/ShopContext';
import { StoreImage } from './StoreImage';

export function About() {
  const { goToShop } = useShop();
  return (
    <section id="about" aria-labelledby="about-title" className="bg-cream-deep py-14 sm:py-24">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative">
          <StoreImage className="aspect-[3/2] rounded-2xl shadow-[0_30px_60px_-30px_rgba(23,63,43,0.5)] ring-1 ring-forest/10" position="center 50%" />
          <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold text-forest shadow">{store.name}</p>
        </motion.div>
        <div>
          <h2 id="about-title" className="text-3xl leading-tight sm:text-5xl">{store.about.heading}</h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink/80">
            {store.about.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => goToShop()} className="btn btn-primary">Start shopping <ArrowRight size={17} aria-hidden="true" /></button>
            <a href="#location" className="btn btn-outline">Find the store</a>
          </div>
        </div>
      </div>
    </section>
  );
}

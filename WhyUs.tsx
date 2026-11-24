import { motion } from 'framer-motion';
import { HeartHandshake, ShoppingBasket, SmilePlus, Sparkles, Truck } from 'lucide-react';
import { store } from '../config/store';
import { SectionHead } from './ui';

const icons = [ShoppingBasket, Sparkles, Sparkles, Truck, HeartHandshake];

export function WhyUs() {
  return (
    <section id="why" aria-labelledby="why-title" className="py-14 sm:py-20">
      <div className="container-x">
        <SectionHead id="why-title" title="Why shop with us?" text="A local supermarket that makes everyday shopping simple." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {store.whyUs.map((w, i) => {
            const Icon = i === 2 ? SmilePlus : icons[i % icons.length];
            return (
              <motion.li key={w.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }}
                className="rounded-xl border border-forest/10 bg-white p-5 transition-shadow hover:shadow-lift">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-forest"><Icon size={22} aria-hidden="true" /></span>
                <h3 className="mt-4 font-sans text-base font-semibold leading-snug text-ink">{w.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink/75">{w.text}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

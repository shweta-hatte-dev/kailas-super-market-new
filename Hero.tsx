import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Truck, Wallet } from 'lucide-react';
import { store } from '../config/store';
import { heroPromo } from '../data/offers';
import { useShop } from '../context/ShopContext';
import { StoreImage } from './StoreImage';
import { Tilt } from './Tilt';
import { WhatsAppGlyph, WhatsAppLink } from './ui';

const line = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } };

export function Hero() {
  const { goToShop } = useShop();
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  const trust = [
    { icon: <WhatsAppGlyph size={20} />, text: 'Send your order on WhatsApp' },
    ...(store.delivery.pickup || store.delivery.homeDelivery ? [{ icon: <Truck size={20} aria-hidden="true" />, text: store.delivery.pickup && store.delivery.homeDelivery ? 'Pickup or home delivery' : store.delivery.pickup ? 'Pickup from the store' : 'Home delivery' }] : []),
    ...(store.showPrices ? [{ icon: <Wallet size={20} aria-hidden="true" />, text: 'Shop within your budget' }] : []),
  ];

  return (
    <section id="home" aria-labelledby="hero-title" className="relative overflow-hidden bg-cream">
      <div className="container-x relative grid items-center gap-10 pb-16 pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pb-24 lg:pt-14">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.11 }}>
          <motion.p variants={line} className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage px-3.5 py-1.5 text-sm font-semibold text-forest">
            <MapPin size={15} aria-hidden="true" /> Your neighbourhood supermarket
          </motion.p>
          <h1 id="hero-title" className="text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.1rem]">
            <motion.span variants={line} className="block">Your Everyday Essentials.</motion.span>
            <motion.span variants={line} className="block">All in One Place.</motion.span>
          </h1>
          <motion.p variants={line} className="mt-5 max-w-[34rem] text-lg leading-relaxed text-ink/80">
            From everyday groceries to your family’s favourite essentials — discover convenient neighbourhood shopping at {store.name}.
          </motion.p>
          <motion.div variants={line} className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={() => goToShop()} className="btn btn-primary px-7 text-base">Shop now <ArrowRight size={18} aria-hidden="true" /></button>
            <a href="#categories" className="btn btn-outline px-7 text-base">Explore categories</a>
            <WhatsAppLink className="btn px-7 text-base text-white [background:#1c7a43] hover:[background:#15602f]"><WhatsAppGlyph size={20} /> Order on WhatsApp</WhatsAppLink>
          </motion.div>
          <motion.ul variants={line} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-7">
            {trust.map((t) => (
              <li key={t.text} className="flex items-center gap-2.5 text-[15px] font-medium text-forest">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-leaf-dark ring-1 ring-forest/10">{t.icon}</span>{t.text}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <Tilt max={5} className="relative"><motion.div className="relative" style={{ transformStyle: 'preserve-3d' }} initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <div ref={frame} className="relative aspect-[3/2] overflow-hidden rounded-2xl shadow-[0_30px_60px_-28px_rgba(23,63,43,0.55)] ring-1 ring-forest/10">
            <motion.div style={{ y, scale: 1.12 }} className="h-full w-full">
              <StoreImage priority className="h-full w-full" position="center 50%" />
            </motion.div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-forest/35 to-transparent" aria-hidden="true" />
          </div>
          <motion.div aria-hidden="true" style={{ transform: 'translateZ(50px)' }} className="absolute -right-3 -top-3 hidden h-16 w-16 rounded-full border-[6px] border-gold/70 sm:block" animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden="true" style={{ transform: 'translateZ(40px)' }} className="absolute -bottom-3 right-10 h-6 w-6 rounded-full bg-gold" animate={{ y: [0, 7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} />
          <motion.a href="#offers" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.5 }}
            style={{ transform: 'translateZ(70px)' }} className="absolute -bottom-6 left-3 max-w-[250px] rounded-xl bg-white p-4 shadow-lift ring-1 ring-forest/10 sm:left-5 lg:-left-6">
            <span className="price-tag text-sm">{heroPromo.title}</span>
            <span className="mt-2 block text-[15px] leading-snug text-ink/85">{heroPromo.text}</span>
            <span className="mt-2 flex items-center gap-1 text-sm font-semibold text-forest">See offers <ArrowRight size={14} aria-hidden="true" />{store.demoData && <span className="ml-auto text-xs font-medium text-ink/60">Sample</span>}</span>
          </motion.a>
        </motion.div></Tilt>
      </div>
    </section>
  );
}

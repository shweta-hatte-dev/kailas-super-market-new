import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ShoppingBasket, X } from 'lucide-react';
import { store } from '../config/store';
import { formatINR } from '../lib/format';
import { useShop } from '../context/ShopContext';
import { WhatsAppGlyph, WhatsAppLink } from './ui';

export function Toasts() {
  const { toasts, dismissToast } = useShop();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
            className="on-dark pointer-events-auto flex max-w-md items-center gap-3 rounded-lg bg-forest py-2 pl-4 pr-2 text-[15px] text-cream shadow-lift">
            <span className="py-1">{t.message}</span>
            {t.action && <button type="button" onClick={() => { t.action!.run(); dismissToast(t.id); }} className="min-h-[40px] shrink-0 rounded px-2 font-semibold text-gold hover:underline">{t.action.label}</button>}
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="flex h-10 w-10 shrink-0 items-center justify-center text-cream/70 hover:text-cream"><X size={16} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Floating WhatsApp + back-to-top, and a compact cart bar on phones. */
export function FloatingActions() {
  const { cartCount, cartTotal, openCart } = useShop();
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const on = () => setShowTop(window.scrollY > 700);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const barOn = cartCount > 0;
  return (
    <>
      <div className={`fixed right-3 z-30 flex flex-col items-end gap-3 transition-[bottom] duration-300 sm:right-5 ${barOn ? 'bottom-[88px] sm:bottom-5' : 'bottom-4 sm:bottom-5'}`}>
        <AnimatePresence>
          {showTop && (
            <motion.a href="#home" aria-label="Back to top" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest shadow-lift ring-1 ring-forest/20 hover:bg-sage"><ArrowUp size={20} /></motion.a>
          )}
        </AnimatePresence>
        <WhatsAppLink className="flex h-14 items-center gap-2 rounded-full px-4 font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 [background:#1c7a43] hover:[background:#15602f]" >
          <WhatsAppGlyph size={26} /><span className="hidden sm:inline">Order on WhatsApp</span><span className="sr-only sm:hidden">Order on WhatsApp with {store.name}</span>
        </WhatsAppLink>
      </div>
      <AnimatePresence>
        {barOn && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-forest/15 bg-cream/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
            <button type="button" onClick={openCart} className="btn btn-primary w-full justify-between">
              <span className="flex items-center gap-2"><ShoppingBasket size={20} aria-hidden="true" /> View cart · {cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              {store.showPrices && <span className="tabular-nums">{formatINR(cartTotal)}</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

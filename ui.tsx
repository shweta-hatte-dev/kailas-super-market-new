import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { store } from '../config/store';
import { buildWhatsAppUrl, isWhatsAppConfigured } from '../lib/whatsapp';
import { formatINR } from '../lib/format';
import { useShop } from '../context/ShopContext';

/* ---------- small pieces ---------- */
export function Price({ price, mrp, className = '' }: { price: number; mrp?: number; className?: string }) {
  if (!store.showPrices) return null;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="price-tag text-[15px]">{formatINR(price)}</span>
      {mrp && mrp > price && <s className="text-sm text-ink/55" aria-label={`Original price ${formatINR(mrp)}`}>{formatINR(mrp)}</s>}
    </span>
  );
}

export function Availability({ inStock }: { inStock: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${inStock ? 'text-leaf-dark' : 'text-ink/60'}`}>
      <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-leaf' : 'bg-ink/35'}`} aria-hidden="true" />
      {inStock ? 'Available' : 'Out of stock'}
    </span>
  );
}

export function SetupNote({ children }: { children: ReactNode }) {
  if (!store.showSetupHints) return null;
  return <p className="mt-2 rounded border border-dashed border-gold bg-gold-tint px-3 py-2 text-xs text-forest"><b>Setup needed:</b> {children}</p>;
}

export function SectionHead({ title, text, action, id }: { title: string; text?: string; action?: ReactNode; id?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
      className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 id={id} className="text-3xl leading-tight sm:text-4xl">{title}</h2>
        {text && <p className="mt-2 text-base text-ink/75">{text}</p>}
      </div>
      {action}
    </motion.div>
  );
}

export function DemoNotice({ className = '' }: { className?: string }) {
  if (!store.demoData || !store.showPrices) return null;
  return <p className={`text-sm text-ink/65 ${className}`}>Products, prices and offers shown are samples until confirmed by the store.</p>;
}

/** Link to WhatsApp when a number is set; otherwise a button that explains what is missing (never a dead click). */
export function WhatsAppLink({ children, className = '', text = store.whatsappGreeting }: { children: ReactNode; className?: string; text?: string }) {
  const { toast } = useShop();
  const url = buildWhatsAppUrl(store.whatsappNumber, text);
  if (url) return <a href={url} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  return (
    <button type="button" className={className} onClick={() => toast(store.showSetupHints ? 'WhatsApp number not set yet. Add it in src/config/store.ts' : 'WhatsApp ordering is not available yet. Please visit the store.', { id: 'wa' })}>
      {children}
    </button>
  );
}
export const whatsappReady = () => isWhatsAppConfigured(store.whatsappNumber);

/** Official WhatsApp logo mark. */
export function WhatsAppGlyph({ size = 18 }: { size?: number }) { return <FaWhatsapp size={size} aria-hidden="true" />; }

export function QtyStepper({ id, name, qty, large = false }: { id: string; name: string; qty: number; large?: boolean }) {
  const { setQty } = useShop();
  const b = `flex items-center justify-center text-forest transition-colors hover:bg-forest/10 ${large ? 'h-11 w-11' : 'h-10 w-10'}`;
  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-forest/35 bg-white" role="group" aria-label={`Quantity of ${name}`}>
      <button type="button" className={b} onClick={() => setQty(id, qty - 1)} aria-label={`Decrease ${name}`}><Minus size={16} /></button>
      <span className="min-w-[2.25rem] text-center text-[15px] font-semibold tabular-nums" aria-live="polite">{qty}</span>
      <button type="button" className={b} onClick={() => setQty(id, qty + 1)} aria-label={`Increase ${name}`} disabled={qty >= 99}><Plus size={16} /></button>
    </div>
  );
}

/* ---------- dialog plumbing ---------- */
function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !el) return;
      const f = el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], active = document.activeElement;
      if (e.shiftKey && (active === first || active === el)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, []);
  return ref;
}

interface DialogProps { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }

function DrawerPanel({ onClose, title, children, footer }: Omit<DialogProps, 'open'>) {
  const ref = useDialog(onClose);
  return (
    <div className="fixed inset-0 z-[60]">
      <motion.div className="absolute inset-0 bg-forest/45" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-drawer outline-none"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
      >
        <header className="flex items-center justify-between border-b border-forest/10 px-5 py-4">
          <h2 className="text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`} className="flex h-11 w-11 items-center justify-center rounded-md text-forest hover:bg-forest/10"><X size={22} /></button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-forest/10 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</footer>}
      </motion.aside>
    </div>
  );
}
export function Drawer({ open, ...rest }: DialogProps) {
  return <AnimatePresence>{open && <DrawerPanel key="drawer" {...rest} />}</AnimatePresence>;
}

function ModalPanel({ onClose, title, children }: Omit<DialogProps, 'open' | 'footer'>) {
  const ref = useDialog(onClose);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div className="absolute inset-0 bg-forest/45" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-xl bg-cream outline-none sm:rounded-xl"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-md bg-white/90 text-forest hover:bg-white"><X size={22} /></button>
        {children}
      </motion.div>
    </div>
  );
}
export function Modal({ open, ...rest }: Omit<DialogProps, 'footer'>) {
  return <AnimatePresence>{open && <ModalPanel key="modal" {...rest} />}</AnimatePresence>;
}

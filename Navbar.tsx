import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBasket, X } from 'lucide-react';
import { store } from '../config/store';
import { useShop } from '../context/ShopContext';

export const navLinks = [
  { label: 'Home', href: '#home' }, { label: 'Shop', href: '#shop' }, { label: 'Categories', href: '#categories' },
  { label: 'Offers', href: '#offers' }, { label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' },
];

export function Logo({ light = false }: { light?: boolean }) {
  const [first, ...rest] = store.name.split(' ');
  return (
    <a href="#home" className="flex items-center gap-2.5" aria-label={`${store.name}, home`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-md font-display text-2xl font-semibold ${light ? 'bg-cream text-forest' : 'bg-forest text-cream'}`}>{first[0]}</span>
      <span className="leading-none">
        <span className={`block font-display text-xl font-semibold ${light ? 'text-cream' : 'text-forest'}`}>{first}</span>
        <span className={`block text-[13px] font-medium ${light ? 'text-cream/80' : 'text-forest/80'}`}>{rest.join(' ')}</span>
      </span>
    </a>
  );
}

const IconBtn = ({ label, onClick, count, children }: { label: string; onClick: () => void; count?: number; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} aria-label={count ? `${label}, ${count} items` : label} className="relative flex h-11 w-11 items-center justify-center rounded-md text-forest transition-colors hover:bg-forest/10">
    {children}
    {!!count && (
      <motion.span key={count} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-forest px-1 text-[11px] font-bold text-cream">{count > 99 ? '99+' : count}</motion.span>
    )}
  </button>
);

export function Navbar() {
  const { cartCount, wishlist, openCart, openWish, openSearch } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menu]);
  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [menu]);

  return (
    <header className={`sticky top-0 z-40 border-b bg-cream/95 backdrop-blur transition-all duration-300 ${scrolled ? 'border-forest/15 shadow-[0_6px_20px_-14px_rgba(23,63,43,0.5)]' : 'border-transparent'}`}>
      <div className={`container-x flex items-center justify-between gap-3 transition-all duration-300 ${scrolled ? 'h-[60px]' : 'h-[68px]'}`}>
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => <a key={l.href} href={l.href} className="rounded-md px-3 py-2 text-[15px] font-medium text-forest hover:bg-forest/10">{l.label}</a>)}
        </nav>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={openSearch} className="mr-1 hidden h-11 w-60 items-center gap-2 rounded-md border border-forest/25 bg-white px-3 text-left text-[15px] text-ink/60 transition-colors hover:border-forest xl:flex" aria-label="Search products">
            <Search size={18} className="text-forest" /> Search groceries
          </button>
          <span className="xl:hidden"><IconBtn label="Search products" onClick={openSearch}><Search size={21} /></IconBtn></span>
          <IconBtn label="Wishlist" onClick={openWish} count={wishlist.length}><Heart size={21} /></IconBtn>
          <IconBtn label="Cart" onClick={openCart} count={cartCount}><ShoppingBasket size={22} /></IconBtn>
          <span className="lg:hidden"><IconBtn label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu((m) => !m)}>{menu ? <X size={22} /> : <Menu size={22} />}</IconBtn></span>
        </div>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.nav aria-label="Mobile" className="absolute inset-x-0 top-full max-h-[calc(100vh-70px)] overflow-y-auto border-b border-forest/15 bg-cream shadow-lift lg:hidden"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <ul className="container-x py-2">
              {[...navLinks, { label: 'Shopping list', href: '#list' }, { label: 'Shop within a budget', href: '#budget' }].map((l) => (
                <li key={l.href}><a href={l.href} onClick={() => setMenu(false)} className="flex min-h-[48px] items-center border-b border-forest/10 text-lg font-medium text-forest last:border-0">{l.label}</a></li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

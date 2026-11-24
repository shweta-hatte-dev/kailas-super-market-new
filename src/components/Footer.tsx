import { store } from '../config/store';
import { categories } from '../data/categories';
import { formatAddress, phoneHref } from '../lib/contact';
import credits from '../data/photoCredits.json';
import { getProduct } from '../data/lookup';
import { useShop } from '../context/ShopContext';
import { Logo } from './Navbar';
import { WhatsAppGlyph, WhatsAppLink } from './ui';

export function Footer() {
  const { goToShop } = useShop();
  const address = formatAddress(store);
  const tel = phoneHref(store.phone);
  const social = Object.entries(store.social).filter(([, v]) => v.trim());
  const links = [['Shop', '#shop'], ['Categories', '#categories'], ['Offers', '#offers'], ['Shopping list', '#list'], ['Budget', '#budget'], ['About', '#about'], ['Visit the store', '#location'], ['Contact', '#contact']];
  const h = 'font-sans text-base font-semibold text-cream';
  const credited = Object.entries(credits as Record<string, { by: string; license: string; url: string; source: string }>).filter(([id]) => getProduct(id));
  return (
    <footer className="on-dark bg-forest text-cream/85">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_1.1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs">A neighbourhood supermarket for everyday groceries and household essentials. Browse, plan and order on WhatsApp.</p>
          {social.length > 0 && <ul className="mt-4 flex gap-4">{social.map(([k, v]) => <li key={k}><a href={v} target="_blank" rel="noopener noreferrer" className="capitalize underline underline-offset-2 hover:text-gold">{k}</a></li>)}</ul>}
        </div>
        <div>
          <h2 className={h}>Categories</h2>
          <ul className="mt-3 space-y-1">
            {categories.map((c) => <li key={c.slug}><button type="button" onClick={() => goToShop({ category: c.slug })} className="min-h-[32px] text-left hover:text-gold">{c.name}</button></li>)}
          </ul>
        </div>
        <div>
          <h2 className={h}>Quick links</h2>
          <ul className="mt-3 space-y-1">{links.map(([l, href]) => <li key={href}><a href={href} className="inline-block min-h-[32px] hover:text-gold">{l}</a></li>)}</ul>
        </div>
        <div>
          <h2 className={h}>Store details</h2>
          <ul className="mt-3 space-y-2">
            <li className="font-medium text-cream">{store.name}</li>
            <li>{address || 'Address details coming soon.'}</li>
            {tel && <li><a href={tel} className="underline underline-offset-2 hover:text-gold">{store.phone}</a></li>}
            {store.email && <li><a href={`mailto:${store.email}`} className="underline underline-offset-2 hover:text-gold">{store.email}</a></li>}
            <li><WhatsAppLink className="inline-flex min-h-[40px] items-center gap-2 font-medium text-gold hover:underline"><WhatsAppGlyph size={17} /> Order on WhatsApp</WhatsAppLink></li>
          </ul>
        </div>
      </div>
      {credited.length > 0 && (
        <div className="border-t border-cream/15">
          <details className="container-x py-4 text-sm text-cream/75">
            <summary className="min-h-[40px] cursor-pointer py-2 font-medium text-cream">Photo credits</summary>
            <ul className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {credited.map(([id, c]) => <li key={id}>{getProduct(id)!.name}: <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold">{c.by}</a>, {c.license} ({c.source})</li>)}
            </ul>
          </details>
        </div>
      )}
      <div className="border-t border-cream/15">
        <div className="container-x flex flex-col gap-1 py-5 text-sm text-cream/75 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          {store.demoData && <p>Product names and prices on this site are samples until confirmed by the store.</p>}
        </div>
      </div>
    </footer>
  );
}

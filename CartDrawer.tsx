import { useState } from 'react';
import { ShoppingBasket, Trash2 } from 'lucide-react';
import { store } from '../config/store';
import { getProduct } from '../data/lookup';
import { formatINR } from '../lib/format';
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured, validateOrder, type OrderErrors } from '../lib/whatsapp';
import { useShop } from '../context/ShopContext';
import { BudgetMeter } from './Budget';
import { ProductVisual, productTint } from './ProductCard';
import { Drawer, QtyStepper, WhatsAppGlyph } from './ui';

export function CartDrawer() {
  const { cartOpen, closeAll, cart, cartTotal, cartCount, cartSavings, remove, clearCart, customer, setCustomer, budget, goToShop } = useShop();
  const [errors, setErrors] = useState<OrderErrors>({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [opened, setOpened] = useState(false);
  const configured = isWhatsAppConfigured(store.whatsappNumber);
  const modes = [...(store.delivery.pickup ? [['pickup', 'Pickup from store'] as const] : []), ...(store.delivery.homeDelivery ? [['delivery', 'Home delivery'] as const] : [])];

  const close = () => { setConfirmClear(false); setOpened(false); closeAll(); };

  const order = () => {
    const e = validateOrder(customer, cart);
    setErrors(e);
    if (Object.keys(e).length) return;
    const url = buildWhatsAppUrl(store.whatsappNumber, buildOrderMessage({ storeName: store.name, customer, lines: cart, get: getProduct, showPrices: store.showPrices }));
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpened(true);
  };

  const footer = cart.length > 0 && (
    <div className="space-y-3">
      {store.showPrices && (
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] text-ink/75">Subtotal · {cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          <span className="text-2xl font-semibold text-forest tabular-nums">{formatINR(cartTotal)}</span>
        </div>
      )}
      {store.showPrices && cartSavings > 0 && <p className="text-sm font-medium text-leaf-dark">You save {formatINR(cartSavings)} on this order.</p>}
      {configured ? (
        <button type="button" onClick={order} className="btn btn-primary w-full text-base"><WhatsAppGlyph /> Order on WhatsApp</button>
      ) : (
        <div role="note" className="rounded-md border border-dashed border-gold bg-gold-tint p-3 text-sm text-forest">
          <p className="font-semibold">WhatsApp ordering isn’t switched on yet.</p>
          <p>{store.showSetupHints ? <>Store owner: add the WhatsApp number in <code>src/config/store.ts</code>.</> : 'Please visit the store or call to place your order.'}</p>
        </div>
      )}
      {opened && <p role="status" className="rounded-md bg-sage p-3 text-sm text-forest">WhatsApp has opened with your order. Press <b>Send</b> in WhatsApp to place it. Your cart stays here until you clear it.</p>}
    </div>
  );

  return (
    <Drawer open={cartOpen} onClose={close} title="Your cart" footer={footer}>
      {cart.length === 0 ? (
        <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
          <ShoppingBasket size={44} className="text-forest" aria-hidden="true" />
          <p className="mt-3 font-display text-2xl text-forest">Your cart is empty</p>
          <p className="mt-1 max-w-[16rem] text-ink/70">Add a few things you need and they will show up here.</p>
          <button type="button" onClick={() => goToShop()} className="btn btn-primary mt-5">Start shopping</button>
        </div>
      ) : (
        <div className="space-y-5">
          {budget && store.showPrices && <div className="rounded-lg bg-white p-4 ring-1 ring-forest/10"><BudgetMeter compact /></div>}
          <ul className="divide-y divide-forest/10">
            {cart.map((l) => {
              const p = getProduct(l.id); if (!p) return null;
              return (
                <li key={l.id} className="flex gap-3 py-3">
                  <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg" style={{ background: productTint(p) }}><ProductVisual p={p} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug">{p.name}</p>
                    <p className="text-sm text-ink/65">{p.unit}{store.showPrices && ` · ${formatINR(p.price)}`}</p>
                    {p.includes && <p className="mt-0.5 line-clamp-2 text-xs text-ink/60">{p.includes}</p>}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QtyStepper id={p.id} name={p.name} qty={l.qty} />
                      {store.showPrices && <span className="font-semibold tabular-nums">{formatINR(p.price * l.qty)}</span>}
                      <button type="button" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`} className="flex h-11 w-11 items-center justify-center rounded-md text-ink/60 hover:bg-forest/10 hover:text-forest"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div>
            {confirmClear ? (
              <span className="inline-flex items-center gap-3 text-sm"><span>Remove everything?</span>
                <button type="button" className="font-semibold text-[#8c3320] underline" onClick={() => { clearCart(); setConfirmClear(false); }}>Yes, clear cart</button>
                <button type="button" className="font-medium underline" onClick={() => setConfirmClear(false)}>Keep</button></span>
            ) : <button type="button" onClick={() => setConfirmClear(true)} className="min-h-[44px] text-sm font-medium text-forest underline underline-offset-2">Clear cart</button>}
          </div>

          <form className="space-y-4 rounded-lg bg-white p-4 ring-1 ring-forest/10" onSubmit={(e) => { e.preventDefault(); order(); }} noValidate>
            <h3 className="font-sans text-lg font-semibold text-ink">Your details</h3>
            {modes.length > 1 && (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-forest">How would you like to get it?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {modes.map(([v, label]) => (
                    <label key={v} className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-md border px-2 text-center text-[15px] font-medium ${customer.mode === v ? 'border-forest bg-forest text-cream' : 'border-forest/30 bg-white text-forest'}`}>
                      <input type="radio" name="mode" value={v} checked={customer.mode === v} onChange={() => setCustomer({ mode: v })} className="sr-only" />{label}
                    </label>
                  ))}
                </div>
                {customer.mode === 'delivery' && <p className="mt-2 text-xs text-ink/70">{store.delivery.info}</p>}
              </fieldset>
            )}
            <div>
              <label htmlFor="c-name" className="mb-1 block text-sm font-semibold text-forest">Name</label>
              <input id="c-name" className="field" value={customer.name} onChange={(e) => setCustomer({ name: e.target.value })} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'c-name-e' : undefined} />
              {errors.name && <p id="c-name-e" role="alert" className="mt-1 text-sm font-medium text-[#8c3320]">{errors.name}</p>}
            </div>
            {customer.mode === 'delivery' && (
              <div>
                <label htmlFor="c-addr" className="mb-1 block text-sm font-semibold text-forest">Delivery address</label>
                <textarea id="c-addr" rows={3} className="field" value={customer.address} onChange={(e) => setCustomer({ address: e.target.value })} autoComplete="street-address" aria-invalid={!!errors.address} aria-describedby={errors.address ? 'c-addr-e' : undefined} />
                {errors.address && <p id="c-addr-e" role="alert" className="mt-1 text-sm font-medium text-[#8c3320]">{errors.address}</p>}
              </div>
            )}
            <div>
              <label htmlFor="c-note" className="mb-1 block text-sm font-semibold text-forest">Note for the store <span className="font-normal text-ink/60">(optional)</span></label>
              <input id="c-note" className="field" value={customer.note} onChange={(e) => setCustomer({ note: e.target.value.slice(0, 200) })} placeholder="e.g. ripe bananas, please" />
            </div>
            {errors.cart && <p role="alert" className="text-sm font-medium text-[#8c3320]">{errors.cart}</p>}
          </form>
        </div>
      )}
    </Drawer>
  );
}

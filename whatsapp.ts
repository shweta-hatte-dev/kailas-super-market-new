import type { CartLine, Product } from '../types';
import { formatINR } from './format';
import { cartTotal } from './cart';

export type Fulfilment = 'pickup' | 'delivery';
export interface Customer { name: string; mode: Fulfilment; address: string; note: string }

/** Returns digits with country code, or null if it can't be a valid number. 10-digit Indian numbers get 91. */
export function normaliseWhatsAppNumber(raw: string): string | null {
  const d = raw.replace(/\D/g, '').replace(/^0+/, '');
  if (/^[6-9]\d{9}$/.test(d)) return `91${d}`;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

export const isWhatsAppConfigured = (raw: string): boolean => normaliseWhatsAppNumber(raw) !== null;

export function buildWhatsAppUrl(rawNumber: string, text: string): string | null {
  const n = normaliseWhatsAppNumber(rawNumber);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

export interface OrderErrors { name?: string; address?: string; cart?: string }

export function validateOrder(c: Customer, lines: CartLine[]): OrderErrors {
  const e: OrderErrors = {};
  if (!lines.length) e.cart = 'Add at least one item to your cart.';
  if (c.name.trim().length < 2) e.name = 'Please enter your name.';
  if (c.mode === 'delivery' && c.address.trim().length < 6) e.address = 'Please enter your delivery address.';
  return e;
}

interface MessageInput {
  storeName: string;
  customer: Customer;
  lines: CartLine[];
  get: (id: string) => Product | undefined;
  showPrices: boolean;
}

export function buildOrderMessage({ storeName, customer, lines, get, showPrices }: MessageInput): string {
  const out: string[] = [`*New order for ${storeName}*`, ''];
  out.push(`*Name:* ${customer.name.trim()}`);
  out.push(`*Order type:* ${customer.mode === 'delivery' ? 'Home delivery' : 'Pickup from store'}`);
  if (customer.mode === 'delivery') out.push(`*Delivery address:* ${customer.address.trim()}`);
  out.push('', '*Items*');
  lines.forEach((l, i) => {
    const p = get(l.id);
    if (!p) return;
    const price = showPrices ? ` = ${formatINR(p.price * l.qty)}` : '';
    out.push(`${i + 1}. ${p.name} (${p.unit}) x ${l.qty}${price}`);
    if (p.includes) out.push(`   Includes: ${p.includes}`);
  });
  if (showPrices) {
    out.push('', `*Total:* ${formatINR(cartTotal(lines, get))}`);
    out.push('_Prices are as shown on the website. Please confirm availability and final amount._');
  } else {
    out.push('', '_Please confirm availability and the final amount._');
  }
  if (customer.note.trim()) out.push('', `*Note:* ${customer.note.trim()}`);
  return out.join('\n');
}

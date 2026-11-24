import type { StoreConfig } from '../config/store';

export const addressParts = (s: StoreConfig): string[] =>
  [s.address.line1, s.address.area, s.address.city, [s.address.state, s.address.postalCode].filter(Boolean).join(' ')]
    .map((x) => x.trim()).filter(Boolean);

export const formatAddress = (s: StoreConfig): string => addressParts(s).join(', ');
export const hasCoordinates = (s: StoreConfig): boolean => s.coordinates.lat !== null && s.coordinates.lng !== null;
const destination = (s: StoreConfig): string | null =>
  hasCoordinates(s) ? `${s.coordinates.lat},${s.coordinates.lng}` : formatAddress(s) ? `${s.name}, ${formatAddress(s)}` : null;

export function directionsUrl(s: StoreConfig): string | null {
  const d = destination(s);
  if (d) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(d)}`;
  return s.googleMapsUrl.trim() || null;
}

export const mapOpenUrl = (s: StoreConfig): string | null => {
  if (s.googleMapsUrl.trim()) return s.googleMapsUrl.trim();
  const d = destination(s);
  return d ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d)}` : null;
};

export const mapEmbedUrl = (s: StoreConfig): string | null => {
  const d = destination(s);
  return d ? `https://www.google.com/maps?q=${encodeURIComponent(d)}&output=embed` : null;
};

export const phoneHref = (phone: string): string | null => {
  const d = phone.replace(/[^\d+]/g, '');
  return d.replace(/\D/g, '').length >= 6 ? `tel:${d}` : null;
};

export function formatHours(s: StoreConfig): { days: string; time: string }[] {
  const t = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return `${((hh + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${hh >= 12 ? 'PM' : 'AM'}`;
  };
  const short = (d: string) => d.slice(0, 3);
  return s.hours.map((h) => ({
    days: h.days.length === 7 ? 'Every day' : h.days.length > 1 ? `${short(h.days[0])} – ${short(h.days[h.days.length - 1])}` : h.days[0],
    time: `${t(h.opens)} – ${t(h.closes)}`,
  }));
}

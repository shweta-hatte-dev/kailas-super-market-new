import type { StoreConfig } from '../config/store';
import { addressParts, phoneHref } from './contact';

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Config value first, then Vercel's automatic production domain, otherwise ''. */
export function resolveSiteUrl(s: StoreConfig, env: Record<string, string | undefined> = {}): string {
  const configured = s.siteUrl.trim().replace(/\/+$/, '');
  if (configured) return configured;
  const v = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  return v ? `https://${v}` : '';
}

export function buildJsonLd(s: StoreConfig, url: string): string {
  const ld: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'GroceryStore', name: s.name, description: s.seo.description };
  if (url) { ld.url = url; ld.image = `${url}/og-image.png`; }
  const tel = s.phone.trim();
  if (tel && phoneHref(tel)) ld.telephone = tel;
  if (s.email.trim()) ld.email = s.email.trim();
  const a = s.address;
  if (a.line1 || a.area || a.city) {
    ld.address = {
      '@type': 'PostalAddress',
      ...(a.line1 || a.area ? { streetAddress: [a.line1, a.area].filter(Boolean).join(', ') } : {}),
      ...(a.city ? { addressLocality: a.city } : {}),
      ...(a.state ? { addressRegion: a.state } : {}),
      ...(a.postalCode ? { postalCode: a.postalCode } : {}),
      addressCountry: 'IN',
    };
  }
  if (s.coordinates.lat !== null && s.coordinates.lng !== null) {
    ld.geo = { '@type': 'GeoCoordinates', latitude: s.coordinates.lat, longitude: s.coordinates.lng };
  }
  if (s.googleMapsUrl.trim()) ld.hasMap = s.googleMapsUrl.trim();
  if (s.hours.length) {
    ld.openingHoursSpecification = s.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes }));
  }
  const sameAs = Object.values(s.social).map((x) => x.trim()).filter(Boolean);
  if (sameAs.length) ld.sameAs = sameAs;
  return JSON.stringify(ld).replace(/</g, '\\u003c');
}

export function buildSeoHead(s: StoreConfig, url: string): string {
  const t = esc(s.seo.title);
  const d = esc(s.seo.description);
  const tags = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(s.name)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
  ];
  if (url) {
    tags.push(
      `<link rel="canonical" href="${url}/" />`,
      `<meta property="og:url" content="${url}/" />`,
      `<meta property="og:image" content="${url}/og-image.png" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:alt" content="${esc(s.name)}" />`,
      `<meta name="twitter:image" content="${url}/og-image.png" />`,
    );
  }
  tags.push(`<script type="application/ld+json">${buildJsonLd(s, url)}</script>`);
  return tags.join('\n    ');
}

export const buildRobots = (url: string): string =>
  ['User-agent: *', 'Allow: /', ...(url ? [`Sitemap: ${url}/sitemap.xml`] : [])].join('\n') + '\n';

export const buildSitemap = (url: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`;

/** Things the owner still has to fill in; printed during `npm run build`. */
export function configWarnings(s: StoreConfig, env: Record<string, string | undefined> = {}): string[] {
  const w: string[] = [];
  if (!s.whatsappNumber.trim()) w.push('whatsappNumber is empty: WhatsApp ordering is switched off until it is set (src/config/store.ts).');
  if (!s.phone.trim()) w.push('phone is empty.');
  if (!addressParts(s).length) w.push('address is empty: location section and Google local data will have no address.');
  if (!s.hours.length) w.push('hours is empty: business hours will not be shown.');
  if (!s.googleMapsUrl.trim() && s.coordinates.lat === null && !addressParts(s).length) w.push('No Google Maps link, coordinates or address: directions are unavailable.');
  if (!resolveSiteUrl(s, env)) w.push('siteUrl is empty and no Vercel URL was detected: canonical URL, social image and sitemap are skipped.');
  if (s.demoData) w.push('demoData is true: sample products & prices are labelled as samples.');
  return w;
}

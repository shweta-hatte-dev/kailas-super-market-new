/**
 * ============================================================
 *  KAILAS SUPER MARKET — THE ONE FILE TO EDIT FOR STORE DETAILS
 * ============================================================
 * Leave a field as '' (empty) if it is not known yet. Nothing is invented:
 * empty fields are hidden from the public site and left out of SEO data.
 */

export interface StoreConfig {
  name: string;
  tagline: string;
  /** Used for the page title / Google snippet. */
  seo: { title: string; description: string };
  /** Full address of the live site, e.g. 'https://kailas-super-market.vercel.app'. Leave '' on Vercel: it is detected automatically. */
  siteUrl: string;
  announcement: { enabled: boolean; text: string; linkLabel: string; linkHref: string };
  phone: string; // e.g. '+91 98xxxxxx00'
  /** Digits with country code, e.g. '9198xxxxxx00'. A plain 10-digit Indian number also works. */
  whatsappNumber: string;
  whatsappGreeting: string;
  email: string;
  address: { line1: string; area: string; city: string; state: string; postalCode: string };
  /** Paste the "Share" link of the shop from Google Maps (optional). */
  googleMapsUrl: string;
  /** Exact coordinates make directions and the map most accurate (optional). */
  coordinates: { lat: number | null; lng: number | null };
  /** One row per group of days. days use English names, times are 24h "HH:MM". Leave [] if unknown. */
  hours: { days: string[]; opens: string; closes: string }[];
  hoursNote: string;
  delivery: { pickup: boolean; homeDelivery: boolean; info: string };
  /** false = hide all prices and leave them out of WhatsApp orders. */
  showPrices: boolean;
  /** true = shows "sample prices" notices. Set to false once products & prices are real. */
  demoData: boolean;
  /** Shows small yellow "setup needed" notes where details are missing. Set to false before going live. */
  showSetupHints: boolean;
  storeImage: { src: string; alt: string; position: string };
  social: { instagram: string; facebook: string; youtube: string };
  about: { heading: string; paragraphs: string[] };
  /** The five reasons shown in "Why shop with us". Edit freely; keep claims to what the store really offers. */
  whyUs: { title: string; text: string }[];
  /** Seasonal collection. active: diwali | ganesh | holi | sankranti | summer | monsoon | winter | christmas */
  seasonal: { enabled: boolean; active: string };
}

export const store: StoreConfig = {
  name: 'Kailas Super Market',
  tagline: 'Your everyday essentials. All in one place.',
  seo: {
    title: 'Kailas Super Market | Everyday groceries & household essentials',
    description:
      'Kailas Super Market is your neighbourhood supermarket for everyday groceries and household essentials. Browse products, plan your shopping list and send your order on WhatsApp.',
  },
  siteUrl: '',

  announcement: {
    enabled: true,
    text: 'Your neighbourhood store for everyday essentials.',
    linkLabel: '',
    linkHref: '',
  },

  phone: '',
  whatsappNumber: '',
  whatsappGreeting: 'Hello Kailas Super Market, I have a question.',
  email: '',

  address: { line1: '', area: '', city: '', state: '', postalCode: '' },
  googleMapsUrl: '',
  coordinates: { lat: null, lng: null },

  hours: [],
  hoursNote: '',

  delivery: {
    pickup: true,
    homeDelivery: true,
    info: 'Home delivery, delivery areas and charges are confirmed by the store on WhatsApp after you send your order.',
  },

  showPrices: true,
  demoData: true,
  showSetupHints: true,

  storeImage: { src: '/images/kailas-super-market.jpg', alt: 'The Kailas Super Market storefront', position: 'center 50%' },

  social: { instagram: '', facebook: '', youtube: '' },

  about: {
    heading: 'A neighbourhood supermarket, now easier to shop',
    paragraphs: [
      'Kailas Super Market is a local supermarket where families, students and working professionals pick up their daily groceries and household essentials close to home.',
      'This website lets you browse the shelves, plan your shopping before you leave, and send your order to the store on WhatsApp for pickup or delivery.',
    ],
  },

  whyUs: [
    { title: 'Everyday essentials in one place', text: 'Groceries, fresh produce, dairy, snacks and household items under one roof.' },
    { title: 'Convenient shopping', text: 'Browse online, save a shopping list and send your order on WhatsApp.' },
    { title: 'Quality products', text: 'Everyday products you know, with fresh fruit and vegetables on the shelf.' },
    { title: 'Pickup or delivery', text: 'Choose pickup or home delivery when you order. The store confirms availability and delivery details with you on WhatsApp.' },
    { title: 'Friendly neighbourhood service', text: 'A local store that is happy to help you find what you need.' },
  ],

  seasonal: { enabled: true, active: 'winter' },
};

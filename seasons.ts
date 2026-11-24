/**
 * Seasonal collections. Pick which one is live with `seasonal.active` in config/store.ts,
 * or switch the whole section off with `seasonal.enabled: false`. Edit text and product ids freely.
 */
export interface Season {
  key: string; label: string; headline: string; text: string; productIds: string[];
  tone: 'forest' | 'gold' | 'sage'; decor: 'sparkle' | 'drops' | 'sun' | 'snow' | 'leaves';
}

export const seasons: Season[] = [
  { key: 'diwali', label: 'Diwali', headline: 'Diwali pantry', text: 'Sweets, ghee and pooja items for the festival.', productIds: ['ghee-500ml', 'sugar-1kg', 'besan-500g', 'soan-papdi', 'agarbatti', 'sunflower-oil-1l'], tone: 'forest', decor: 'sparkle' },
  { key: 'ganesh', label: 'Ganesh Festival', headline: 'Ganeshotsav essentials', text: 'Prasad ingredients and pooja basics.', productIds: ['jaggery-1kg', 'rice-basmati-5kg', 'ghee-500ml', 'agarbatti', 'sugar-1kg', 'rava-500g'], tone: 'gold', decor: 'sparkle' },
  { key: 'holi', label: 'Holi', headline: 'Holi get-together', text: 'Snacks, sweets and cold drinks for the gathering.', productIds: ['cola-750', 'chips-salted', 'bhujia-400g', 'soan-papdi', 'milk-1l', 'sugar-1kg'], tone: 'gold', decor: 'sparkle' },
  { key: 'sankranti', label: 'Makar Sankranti', headline: 'Til-gud time', text: 'Sesame, jaggery and sweets for Sankranti.', productIds: ['sesame-200g', 'jaggery-1kg', 'chikki', 'peanuts-200g', 'ghee-500ml'], tone: 'gold', decor: 'leaves' },
  { key: 'summer', label: 'Summer', headline: 'Stay cool this summer', text: 'Cold drinks, juices and curd.', productIds: ['cola-750', 'orange-juice-1l', 'lemon-soda', 'curd-400g', 'water-1l'], tone: 'gold', decor: 'sun' },
  { key: 'monsoon', label: 'Monsoon', headline: 'Rainy-day cravings', text: 'Chai, snacks and biscuits for a rainy evening.', productIds: ['tea-500g', 'coffee-100g', 'bhujia-400g', 'peanuts-200g', 'rusk', 'glucose-biscuit'], tone: 'sage', decor: 'drops' },
  { key: 'winter', label: 'Winter', headline: 'Warm winter pantry', text: 'Ghee, jaggery, tea and sweets for cold days.', productIds: ['ghee-500ml', 'jaggery-1kg', 'tea-500g', 'coffee-100g', 'chikki', 'sesame-200g'], tone: 'sage', decor: 'snow' },
  { key: 'christmas', label: 'Christmas', headline: 'Christmas treats', text: 'Chocolates, cookies and party basics.', productIds: ['choc-dark', 'choc-milk', 'butter-cookies', 'orange-juice-1l', 'butter-100g', 'cheese-slices'], tone: 'forest', decor: 'snow' },
];

import type { Product } from '../types';

/**
 * SAMPLE PRODUCTS — replace with the store's real items and prices.
 * One line per product:
 *   P(id, name, category, unit, price, 'photo search words', { optional fields })
 * Optional: mrp (shows a discount), badge, inStock:false, popular, quick, tags, description.
 *
 * PHOTOS: each product's photo is the file  src/assets/products/<id>.jpg
 * Run `npm run photos` to download them automatically, or add your own files with the same names.
 * Product names are generic on purpose (no brand names).
 */
const P = (id: string, name: string, category: string, unit: string, price: number, photoQuery: string, o: Partial<Product> = {}): Product =>
  ({ id, name, category, unit, price, photoQuery, inStock: true, ...o });

export const products: Product[] = [
  // Fruits
  P('apple-shimla', 'Shimla Apples', 'fruits', '1 kg', 180, 'fresh red apples', { badge: 'Popular', popular: true, tags: ['seb', 'fruit'] }),
  P('banana', 'Robusta Bananas', 'fruits', '1 dozen', 60, 'bananas bunch', { badge: 'Fresh', popular: true, tags: ['kela', 'fruit'] }),
  P('mango-1kg', 'Mangoes', 'fruits', '1 kg', 140, 'mangoes fruit', { inStock: false, tags: ['aam', 'fruit'] }),
  P('orange-1kg', 'Oranges', 'fruits', '1 kg', 90, 'oranges fruit', { tags: ['santra', 'fruit'] }),
  P('grapes-500g', 'Green Grapes', 'fruits', '500 g', 80, 'green grapes bunch', { badge: 'Fresh', tags: ['angur', 'fruit'] }),
  P('pomegranate-500g', 'Pomegranates', 'fruits', '500 g', 110, 'pomegranate fruit', { tags: ['anar', 'fruit'] }),

  // Vegetables
  P('tomato', 'Fresh Tomatoes', 'vegetables', '500 g', 30, 'ripe red tomatoes', { badge: 'Fresh', popular: true, quick: true, tags: ['tamatar', 'vegetable'] }),
  P('potato', 'Potatoes', 'vegetables', '1 kg', 40, 'potatoes', { quick: true, tags: ['aloo', 'batata', 'vegetable'] }),
  P('onion', 'Onions', 'vegetables', '1 kg', 38, 'onions', { quick: true, tags: ['pyaz', 'kanda', 'vegetable'] }),
  P('chilli-green', 'Green Chillies', 'vegetables', '100 g', 15, 'green chillies', { tags: ['hari mirch', 'vegetable'] }),
  P('spinach', 'Spinach Bunch', 'vegetables', '1 bunch', 20, 'fresh spinach leaves', { badge: 'Fresh', tags: ['palak', 'leafy', 'vegetable'] }),
  P('capsicum', 'Capsicum', 'vegetables', '500 g', 60, 'green capsicum bell pepper', { tags: ['shimla mirch', 'vegetable'] }),

  // Dairy
  P('milk-1l', 'Toned Milk', 'dairy', '1 L', 56, 'milk glass bottle', { badge: 'Best Seller', popular: true, quick: true, tags: ['doodh'] }),
  P('curd-400g', 'Fresh Curd', 'dairy', '400 g', 35, 'curd yogurt bowl', { quick: true, tags: ['dahi', 'yogurt'] }),
  P('paneer-200g', 'Paneer', 'dairy', '200 g', 90, 'paneer cottage cheese', { badge: 'Popular', popular: true, tags: ['cottage cheese'] }),
  P('butter-100g', 'Salted Butter', 'dairy', '100 g', 60, 'butter block', { tags: ['makhan'] }),
  P('cheese-slices', 'Cheese Slices', 'dairy', '200 g', 140, 'cheese slices', {}),
  P('ghee-500ml', 'Pure Ghee', 'dairy', '500 ml', 320, 'ghee jar clarified butter', { mrp: 345, tags: ['clarified butter'] }),
  P('bread-sandwich', 'Sandwich Bread', 'dairy', '400 g', 45, 'sliced bread loaf', { popular: true, quick: true, tags: ['pav', 'loaf'] }),
  P('eggs-6', 'Eggs', 'dairy', '6 pcs', 48, 'eggs carton', { quick: true, tags: ['anda'] }),

  // Grocery
  P('rice-basmati-5kg', 'Basmati Rice', 'grocery', '5 kg', 549, 'basmati rice', { mrp: 620, badge: 'Best Seller', popular: true, tags: ['chawal'] }),
  P('rice-sona-5kg', 'Sona Masoori Rice', 'grocery', '5 kg', 320, 'raw rice grains', { tags: ['chawal'] }),
  P('atta-5kg', 'Whole Wheat Atta', 'grocery', '5 kg', 245, 'wheat flour', { mrp: 270, badge: 'Popular', popular: true, quick: true, tags: ['gehu', 'flour', 'chakki'] }),
  P('besan-500g', 'Besan (Gram Flour)', 'grocery', '500 g', 70, 'gram flour besan', { tags: ['chickpea flour'] }),
  P('poha-500g', 'Poha (Flattened Rice)', 'grocery', '500 g', 55, 'poha flattened rice', { tags: ['breakfast', 'pohe'] }),
  P('rava-500g', 'Sooji (Rava)', 'grocery', '500 g', 38, 'semolina sooji', { tags: ['semolina', 'suji'] }),
  P('toor-dal-1kg', 'Toor Dal', 'grocery', '1 kg', 165, 'toor dal pigeon peas', { popular: true, quick: true, tags: ['arhar', 'tur', 'lentil'] }),
  P('moong-dal-1kg', 'Moong Dal', 'grocery', '1 kg', 140, 'moong dal lentils', { tags: ['lentil'] }),
  P('chana-dal-1kg', 'Chana Dal', 'grocery', '1 kg', 110, 'chana dal split chickpeas', { tags: ['lentil'] }),
  P('rajma-500g', 'Rajma', 'grocery', '500 g', 90, 'red kidney beans', { tags: ['kidney beans'] }),
  P('sunflower-oil-1l', 'Sunflower Oil', 'grocery', '1 L', 140, 'cooking oil bottle', { mrp: 155, badge: 'Popular', popular: true, quick: true, tags: ['tel', 'refined oil', 'cooking oil'] }),
  P('salt-1kg', 'Iodised Salt', 'grocery', '1 kg', 26, 'table salt', { quick: true, tags: ['namak'] }),
  P('sugar-1kg', 'Sugar', 'grocery', '1 kg', 46, 'white sugar', { quick: true, tags: ['chini', 'sakhar'] }),
  P('turmeric-200g', 'Turmeric Powder', 'grocery', '200 g', 58, 'turmeric powder', { tags: ['haldi', 'masala', 'spice'] }),
  P('chilli-200g', 'Red Chilli Powder', 'grocery', '200 g', 85, 'red chilli powder', { tags: ['mirch', 'masala', 'spice'] }),
  P('jaggery-1kg', 'Jaggery', 'grocery', '1 kg', 85, 'jaggery gur', { tags: ['gud', 'gur'] }),
  P('sesame-200g', 'Sesame Seeds', 'grocery', '200 g', 55, 'sesame seeds', { tags: ['til'] }),

  // Snacks
  P('chips-salted', 'Salted Potato Chips', 'snacks', '90 g', 30, 'potato chips', { badge: 'Popular', popular: true, tags: ['wafers'] }),
  P('bhujia-400g', 'Aloo Bhujia', 'snacks', '400 g', 110, 'indian namkeen snack', { popular: true, tags: ['sev', 'namkeen'] }),
  P('peanuts-200g', 'Roasted Peanuts', 'snacks', '200 g', 40, 'roasted peanuts', { tags: ['shengdana', 'moongphali'] }),
  P('glucose-biscuit', 'Glucose Biscuits', 'snacks', '500 g', 50, 'biscuits', { popular: true, quick: true, tags: ['tea biscuit'] }),
  P('cream-biscuit', 'Cream Biscuits', 'snacks', '250 g', 40, 'cream sandwich biscuits', {}),
  P('digestive', 'Digestive Biscuits', 'snacks', '400 g', 85, 'digestive biscuits', { mrp: 95 }),
  P('butter-cookies', 'Butter Cookies', 'snacks', '300 g', 90, 'butter cookies', { badge: 'New' }),
  P('rusk', 'Tea Rusk', 'snacks', '600 g', 70, 'rusk toast tea', { tags: ['toast'] }),
  P('choc-milk', 'Milk Chocolate Bar', 'snacks', '40 g', 40, 'milk chocolate bar', { badge: 'Popular', popular: true, tags: ['chocolate'] }),
  P('choc-dark', 'Dark Chocolate Bar', 'snacks', '80 g', 150, 'dark chocolate bar', { tags: ['chocolate'] }),
  P('candy-assorted', 'Assorted Candies', 'snacks', '150 g', 50, 'colorful candies', { tags: ['toffee', 'sweets'] }),
  P('soan-papdi', 'Soan Papdi', 'snacks', '250 g', 120, 'indian sweets mithai box', { tags: ['mithai', 'sweet'] }),
  P('chikki', 'Peanut Chikki', 'snacks', '200 g', 60, 'peanut chikki brittle', { tags: ['gud', 'sweet'] }),

  // Beverages
  P('cola-750', 'Cola', 'beverages', '750 ml', 40, 'cola soft drink glass', { popular: true, tags: ['soft drink', 'cold drink', 'soda'] }),
  P('orange-juice-1l', 'Orange Juice', 'beverages', '1 L', 110, 'orange juice glass', { tags: ['fruit juice'] }),
  P('tea-500g', 'Tea Leaves', 'beverages', '500 g', 240, 'black tea leaves cup', { badge: 'Best Seller', quick: true, tags: ['chai', 'chai patti'] }),
  P('coffee-100g', 'Instant Coffee', 'beverages', '100 g', 290, 'coffee beans cup', {}),
  P('water-1l', 'Packaged Drinking Water', 'beverages', '1 L', 20, 'drinking water bottle', { quick: true, tags: ['paani', 'mineral water'] }),
  P('lemon-soda', 'Lemon Soda', 'beverages', '600 ml', 30, 'lemon soda drink', { tags: ['cold drink'] }),

  // Personal care
  P('bath-soap-4', 'Bath Soap', 'personal-care', 'Pack of 4', 130, 'bar soap', { tags: ['soap'] }),
  P('shampoo-340', 'Shampoo', 'personal-care', '340 ml', 210, 'shampoo bottle', { mrp: 235, popular: true }),
  P('toothpaste-150', 'Toothpaste', 'personal-care', '150 g', 95, 'toothpaste toothbrush', { tags: ['dental'] }),
  P('handwash-250', 'Hand Wash', 'personal-care', '250 ml', 89, 'liquid hand soap', {}),
  P('facewash-100', 'Face Wash', 'personal-care', '100 ml', 145, 'face wash tube', {}),

  // Home essentials
  P('detergent-1kg', 'Detergent Powder', 'home-essentials', '1 kg', 120, 'laundry detergent powder', { badge: 'Popular', popular: true, quick: true, tags: ['washing powder', 'surf'] }),
  P('dishwash-500', 'Dishwash Liquid', 'home-essentials', '500 ml', 110, 'dishwashing liquid', { tags: ['utensil'] }),
  P('floor-cleaner-1l', 'Floor Cleaner', 'home-essentials', '1 L', 185, 'floor cleaner bottle', { mrp: 205, tags: ['phenyl'] }),
  P('toilet-cleaner-500', 'Toilet Cleaner', 'home-essentials', '500 ml', 95, 'bathroom cleaner bottle', {}),
  P('glass-cleaner-500', 'Glass Cleaner Spray', 'home-essentials', '500 ml', 125, 'cleaning spray bottle', {}),
  P('tissue-roll', 'Kitchen Tissue Rolls', 'home-essentials', 'Pack of 2', 80, 'paper towel rolls', { tags: ['paper towel'] }),
  P('foil-9m', 'Aluminium Foil', 'home-essentials', '9 m', 110, 'aluminium foil roll', { tags: ['kitchen'] }),
  P('agarbatti', 'Incense Sticks', 'home-essentials', '1 pack', 40, 'incense sticks', { tags: ['agarbatti', 'pooja'] }),
];

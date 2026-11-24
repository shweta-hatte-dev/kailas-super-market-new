import { readdirSync } from 'node:fs';
import { products } from '../src/data/products';

const have = new Set(readdirSync('src/assets/products').map((f) => f.replace(/\.[^.]+$/, '')));
const missing = products.filter((p) => !p.image && !have.has(p.id));
console.log(`${products.length - missing.length} of ${products.length} products have a photo.`);
if (missing.length) console.log('Missing (file name = id):\n  ' + missing.map((p) => `${p.id}.jpg  — ${p.name}`).join('\n  '));

import { useState } from 'react';
import { Apple, Carrot, Coffee, Cookie, Droplets, House, Milk, Package, Wheat, type LucideIcon } from 'lucide-react';
import type { Product } from '../types';

// Photos live in src/assets/products/<product-id>.jpg — Vite bundles and fingerprints them.
const found = import.meta.glob('/src/assets/products/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const photos: Record<string, string> = {};
for (const [path, url] of Object.entries(found)) photos[path.split('/').pop()!.replace(/\.[^.]+$/, '')] = url;

// Every catalogue item gets a real category photograph when an individual product photo is not supplied.
export const photoFor = (p: Pick<Product, 'id' | 'image' | 'category'>): string | null => p.image ?? photos[p.id] ?? `/products/${p.category}.jpg`;

const icons: Record<string, LucideIcon> = { fruits: Apple, vegetables: Carrot, dairy: Milk, grocery: Wheat, snacks: Cookie, beverages: Coffee, 'personal-care': Droplets, 'home-essentials': House };

/** Clean fallback tile: used only when a product has no photo file yet (or the file fails to load). */
export function FallbackTile({ category, className = '' }: { category: string; className?: string }) {
  const Icon = icons[category] ?? Package;
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-sage to-cream-deep ${className}`} aria-hidden="true">
      <Icon className="h-1/3 w-1/3 text-forest/35" strokeWidth={1.4} />
    </div>
  );
}

interface Props { p: Pick<Product, 'id' | 'name' | 'category' | 'image'>; className?: string; priority?: boolean; zoom?: boolean }

export function ProductPhoto({ p, className = '', priority = false, zoom = false }: Props) {
  const src = photoFor(p);
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <FallbackTile category={p.category} className={className} />;
  return (
    <img
      src={src} alt={p.name} onError={() => setFailed(true)} decoding="async" loading={priority ? 'eager' : 'lazy'}
      className={`object-cover ${zoom ? 'transition-transform duration-500 ease-out group-hover:scale-110' : ''} ${className}`}
    />
  );
}

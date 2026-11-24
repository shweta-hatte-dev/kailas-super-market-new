import { useState } from 'react';
import { store } from '../config/store';

interface Props { className?: string; priority?: boolean; position?: string }

/**
 * The real shop photo. It is a plain <img> pointing at /images/kailas-super-market.jpg
 * (the file lives in public/images/), always visible, never hidden by overlays or fade-ins.
 */
export function StoreImage({ className = '', priority = false, position }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`relative flex items-end overflow-hidden bg-forest ${className}`} role="img" aria-label={store.storeImage.alt}>
        <p className="relative p-5 font-display text-2xl text-cream">{store.name}</p>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-sage ${className}`}>
      <img
        src={store.storeImage.src}
        alt={store.storeImage.alt}
        width={1599}
        height={899}
        onError={() => setFailed(true)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? ({ fetchpriority: 'high' } as object) : {})}
        style={{ objectPosition: position ?? store.storeImage.position }}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

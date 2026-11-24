import { useState } from 'react';
import { X } from 'lucide-react';
import { store } from '../config/store';

export function AnnouncementBar() {
  const [hidden, setHidden] = useState(false);
  const a = store.announcement;
  if (!a.enabled || !a.text.trim() || hidden) return null;
  return (
    <div className="on-dark bg-forest text-cream" role="region" aria-label="Announcement">
      <div className="container-x relative flex min-h-[38px] items-center justify-center py-1.5 pr-10 text-center text-sm">
        <p>
          {a.text}{' '}
          {a.linkLabel && a.linkHref && <a href={a.linkHref} className="font-semibold text-gold underline underline-offset-2">{a.linkLabel}</a>}
        </p>
        <button type="button" onClick={() => setHidden(true)} aria-label="Dismiss announcement" className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-cream/80 hover:text-cream sm:right-3"><X size={16} /></button>
      </div>
    </div>
  );
}

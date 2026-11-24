import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { store } from '../config/store';
import { directionsUrl, formatAddress, formatHours, mapEmbedUrl, mapOpenUrl, phoneHref } from '../lib/contact';
import { useShop } from '../context/ShopContext';
import { StoreImage } from './StoreImage';
import { SectionHead, SetupNote } from './ui';

export function Location() {
  const { toast } = useShop();
  const address = formatAddress(store);
  const directions = directionsUrl(store);
  const embed = mapEmbedUrl(store);
  const open = mapOpenUrl(store);
  const tel = phoneHref(store.phone);
  const hours = formatHours(store);

  return (
    <section id="location" aria-labelledby="loc-title" className="bg-sage py-14 sm:py-20">
      <div className="container-x">
        <SectionHead id="loc-title" title="Visit the store" text="Find us, get directions, and check when we are open." />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-6">
            <StoreImage className="aspect-[16/10] rounded-lg" position="center 60%" />
            <div className="rounded-lg bg-white p-5 ring-1 ring-forest/10">
              <ul className="space-y-4 text-[16px]">
                <li className="flex gap-3"><MapPin size={20} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
                  <div><p className="font-semibold">{store.name}</p>
                    {address ? <p className="text-ink/80">{address}</p> : <p className="text-ink/70">Address details coming soon.</p>}
                    {!address && <SetupNote>fill in <code>address</code> in src/config/store.ts</SetupNote>}</div></li>
                <li className="flex gap-3"><Clock size={20} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
                  <div>{hours.length ? hours.map((h) => <p key={h.days}><span className="font-medium">{h.days}:</span> {h.time}</p>) : <p className="text-ink/70">Opening hours coming soon.</p>}
                    {store.hoursNote && <p className="text-sm text-ink/70">{store.hoursNote}</p>}
                    {!hours.length && <SetupNote>fill in <code>hours</code> in src/config/store.ts</SetupNote>}</div></li>
                <li className="flex gap-3"><Phone size={20} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
                  <div>{tel ? <a href={tel} className="font-medium underline underline-offset-2">{store.phone}</a> : <p className="text-ink/70">Phone number coming soon.</p>}
                    {!tel && <SetupNote>fill in <code>phone</code> in src/config/store.ts</SetupNote>}</div></li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                {directions
                  ? <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><Navigation size={18} aria-hidden="true" /> Get directions</a>
                  : <button type="button" className="btn btn-primary" onClick={() => toast(store.showSetupHints ? 'Add the address or Google Maps link in src/config/store.ts to switch on directions.' : 'Directions will be available soon.', { id: 'dir' })}><Navigation size={18} aria-hidden="true" /> Get directions</button>}
                {open && <a href={open} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Open in Google Maps</a>}
              </div>
            </div>
          </div>
          <div className="min-h-[320px] overflow-hidden rounded-lg bg-white ring-1 ring-forest/10">
            {embed ? (
              <iframe title={`Map showing ${store.name}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[320px] w-full border-0 lg:min-h-[520px]" />
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-8 text-center">
                <MapPin size={38} className="text-forest" aria-hidden="true" />
                <p className="mt-3 text-xl font-semibold text-forest">Map coming soon</p>
                <p className="mt-1 text-ink/70">The map appears here once the store address is added.</p>
                <SetupNote>set <code>address</code> or <code>coordinates</code> in src/config/store.ts</SetupNote>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

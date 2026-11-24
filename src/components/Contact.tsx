import { Clock, MapPin, Phone } from 'lucide-react';
import { store } from '../config/store';
import { formatAddress, formatHours, phoneHref } from '../lib/contact';
import { SectionHead, SetupNote, WhatsAppGlyph, WhatsAppLink, whatsappReady } from './ui';

export function Contact() {
  const tel = phoneHref(store.phone);
  const address = formatAddress(store);
  const hours = formatHours(store);
  const wa = whatsappReady();
  const Card = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <li className="rounded-lg border border-forest/12 bg-white p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-sage text-forest">{icon}</span>
      <h3 className="mt-3 font-sans text-base font-semibold text-ink">{title}</h3>
      <div className="mt-1 text-[15px] text-ink/80">{children}</div>
    </li>
  );
  return (
    <section id="contact" aria-labelledby="contact-title" className="py-14 sm:py-20">
      <div className="container-x">
        <SectionHead id="contact-title" title="Get in touch" text="Ask about a product, check availability or place an order." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card icon={<WhatsAppGlyph size={22} />} title="WhatsApp">
            {wa ? <p>Chat with the store and send your order.</p> : <p>WhatsApp ordering is coming soon.</p>}
            {!wa && <SetupNote>set <code>whatsappNumber</code> in src/config/store.ts</SetupNote>}
          </Card>
          <Card icon={<Phone size={22} aria-hidden="true" />} title="Phone">
            {tel ? <a href={tel} className="font-medium underline underline-offset-2">{store.phone}</a> : <p>Phone number coming soon.</p>}
            {!tel && <SetupNote>set <code>phone</code> in src/config/store.ts</SetupNote>}
          </Card>
          <Card icon={<MapPin size={22} aria-hidden="true" />} title="Location">
            {address ? <p>{address}</p> : <p>Address details coming soon.</p>}
            <p className="mt-1"><a href="#location" className="font-medium underline underline-offset-2">See map and directions</a></p>
          </Card>
          <Card icon={<Clock size={22} aria-hidden="true" />} title="Business hours">
            {hours.length ? hours.map((h) => <p key={h.days}>{h.days}: {h.time}</p>) : <p>Opening hours coming soon.</p>}
            {store.hoursNote && <p className="mt-1 text-sm">{store.hoursNote}</p>}
          </Card>
        </ul>
        <div className="on-dark mt-8 flex flex-col items-start justify-between gap-4 rounded-lg bg-forest p-6 text-cream sm:flex-row sm:items-center sm:p-8">
          <div>
            <h3 className="text-2xl !text-cream sm:text-3xl">Need something that is not on the site?</h3>
            <p className="mt-1 text-cream/85">Message the store and ask. We will let you know if it is available.</p>
          </div>
          <WhatsAppLink className="btn btn-gold shrink-0 px-7"><WhatsAppGlyph /> Message on WhatsApp</WhatsAppLink>
        </div>
      </div>
    </section>
  );
}

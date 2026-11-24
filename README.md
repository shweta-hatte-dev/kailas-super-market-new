# Kailas Super Market — website

A fast, frontend-only supermarket website: browse products, search, wishlist, shopping list, budget tracker, cart, and **ordering through WhatsApp**. React + TypeScript + Vite + Tailwind CSS + Framer Motion. No backend, no API keys, no paid services.

## Features
Announcement bar · sticky navbar · hero with the real storefront photo · 12 category tiles that filter products · popular products grid with search, sort and availability filter · offers & combos · seasonal collection (switchable) · "Your everyday essentials" one-tap row · recently viewed · wishlist · cart drawer (saved in the browser) · WhatsApp checkout (pickup / delivery) · shopping list (copy / share, adds matching products to cart) · "Shop within your budget" · location with Google Maps · contact · footer · floating WhatsApp button · back-to-top · local-business SEO.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the built site
npm test           # automated tests (cart, search, budget, WhatsApp message, photo downloader, full-app flows)
npm run photos     # download product photos (see section 1)
```
Requires Node 18+. The build prints a **"[store setup]" checklist** of anything not filled in yet.

## 1. Photos

**Storefront photo** — the real shop photo is `public/images/kailas-super-market.jpg` and is used in the hero, the store section and the social preview. To replace it, overwrite that file keeping the name. The build **fails with a clear message if the file is missing**, so you can never deploy without it.

*Check it is live:* after deploying, open `https://YOUR-SITE.vercel.app/images/kailas-super-market.jpg`. If your shop photo opens, it is deployed. If you get a 404, the file did not reach GitHub, or Vercel is building a different folder (see "Troubleshooting").

**Product photos** — each product shows a real downloaded photo from `src/assets/products/<product-id>.jpg` (e.g. `tomato.jpg`). Without a photo the card shows a plain icon tile, never a broken image.

- **Automatic on every deploy (default).** The build runs `scripts/fetch-photos.ts` first. With no setup it downloads free-licensed photos from Wikimedia Commons for any product that has no photo file, and lists the credits in the website footer ("Photo credits"). If the download fails, the site still deploys. Turn this off with the Vercel variable `PHOTOS_AUTO=off`. For nicer, studio-style photos add a free Pexels key as the Vercel variable `PEXELS_API_KEY` (pexels.com/api).
- **Download once and keep them (recommended).** Run `npm run photos` on your computer, then open **`photo-review.html`** to check every photo, delete any wrong ones, and commit the files in `src/assets/products/` and `src/data/photoCredits.json`. Committed photos are never overwritten.
- **Your own photos.** Save them as `<product-id>.jpg` in `src/assets/products/`. `npm run photos:check` lists what is missing.

Automatic search picks the first suitable match, so **always review the photos before the site goes live**. Packaged items (cleaning products, shampoo) are the most likely to need a hand-picked replacement.

## 2. Store details — one file: `src/config/store.ts`

**Required before WhatsApp ordering can reach the shop:** enter the shop's real WhatsApp number in `whatsappNumber` (India: 10 digits or `91` + 10 digits). The floating WhatsApp button and cart checkout are already wired to open WhatsApp with a pre-filled message; without the shop number they intentionally show a setup notice instead of sending customers to the wrong contact.
Name, announcement bar, **phone**, **WhatsApp number**, **address**, **Google Maps link / coordinates**, **opening hours**, pickup/delivery options, social links, About text, SEO title/description, seasonal collection. Leave a field `''` if unknown: it is hidden on the site and left out of SEO data. Nothing is invented.

- **WhatsApp:** `whatsappNumber: '919876543210'` (country code + number; a plain 10-digit Indian number also works). Until set, the cart shows "WhatsApp ordering isn't switched on yet" and never claims an order was sent. After a customer taps *Order on WhatsApp*, WhatsApp opens with the message ready; the customer must press **Send**.
- **Address / Maps:** fill `address`; add `googleMapsUrl` (Google Maps → Share → copy link) and optionally `coordinates` for the most accurate pin. Directions and the embedded map switch on automatically.
- **Hours:** e.g. `hours: [{ days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], opens: '08:00', closes: '21:00' }]`
- **Before going live:** set `showSetupHints: false` (hides yellow owner notes) and `demoData: false` once real products and prices are in.

## 3. Products, prices, categories, offers
- **Products & prices:** `src/data/products.ts` — one line per product: `P(id, name, category, unit, price, 'photo search words', { mrp, badge, inStock, popular, quick, tags })`. Add `mrp` to show a discount; `inStock: false` marks it unavailable; `quick: true` puts it in "everyday essentials"; `tags` add search words (e.g. `'dahi'`).
- **Product photos:** see section 1. Use `badge: 'Popular' | 'Fresh' | 'Best Seller' | 'New'` for the small label on a card.
- **Categories:** `src/data/categories.ts` (name, tint, and `cover` = the product whose photo is shown on the card). A product's `category` must match a category `slug`.
- **Offers:** `src/data/offers.ts` — banner text, which products appear in each tab, and combos (`comboPrice` must be lower than the sum of its items). "Savings collection" is automatic (products with an `mrp`).
- **Seasonal collection:** `src/data/seasons.ts` for content; pick the live one with `seasonal.active` in `store.ts` (`diwali ganesh holi sankranti summer monsoon winter christmas`) or switch it off with `seasonal.enabled: false`. Update it when the season changes.
- **Delete browser memory of old items:** shoppers' saved carts ignore products that no longer exist.

All offers, products and prices supplied are **sample data** until the owner confirms them.

## 4. Google & SEO
Built in from `store.ts`: title, description, canonical URL, Open Graph / social preview (`public/og-image.png`), LocalBusiness (`GroceryStore`) structured data, `robots.txt`, `sitemap.xml`, favicon, semantic headings.
- On Vercel the site address is detected automatically. For a custom domain, set `siteUrl: 'https://yourdomain.in'`.
- Only fields you fill in appear in the structured data (no invented address, ratings or reviews).
- **Google Business Profile is separate.** A website does not create a Google listing or guarantee ranking. The owner should claim/create the profile at business.google.com, use the same name, address and phone as in `store.ts`, and add this website's address to the profile. Add the site in Google Search Console and submit `/sitemap.xml`.
- Replace `public/og-image.png` (1200×630) with a design using the real shop photo when ready.

## 5. Put it on GitHub and Vercel
1. Extract the ZIP. Create an empty repository on github.com.
2. In the extracted folder: `git init && git add . && git commit -m "Kailas Super Market website" && git branch -M main && git remote add origin <your-repo-url> && git push -u origin main` (or drag the files into GitHub's "upload files" page; do **not** upload `node_modules` or `dist`).
3. On vercel.com choose **Add New → Project**, import the repository. Vercel detects Vite automatically (Build: `npm run build`, Output: `dist`). Click **Deploy**.
4. Every later `git push` redeploys. Add a custom domain under Project → Settings → Domains.

## Troubleshooting
- **The shop photo does not show on the live site.** Open `/images/kailas-super-market.jpg` on your site (see above). A 404 means the live site was not built from this project: make sure `package.json` and the `public` folder are at the **top level** of the GitHub repository (not inside an extra folder), that `public/images/kailas-super-market.jpg` is in the repository on github.com, and that Vercel's *Root Directory* (Project → Settings → General) is empty. Then redeploy from the latest commit. After redeploying, hard-refresh the page (Ctrl+Shift+R) so the browser drops its old copy.
- **Build warnings** starting with `[store setup]` are your to-do list (WhatsApp number, address, hours); they do not stop the build.

## Notes
- Cart, wishlist, list, budget and recently viewed are stored in the visitor's own browser (localStorage). There is no admin panel; the owner edits the files above. Orders are never stored on a server: they exist only as the WhatsApp message.
- Search engines render this single-page site with JavaScript. Google handles that, but a static, server-rendered version would be stronger for SEO if needed later.

/**
 * Downloads one real photo per product into src/assets/products/<product-id>.jpg.
 * Products that already have a photo are skipped, so any photo can be replaced by
 * dropping your own file in with the same name.
 *
 *   npm run photos              no account needed (free-licensed photos from Wikimedia Commons)
 *   PEXELS_API_KEY=... npm run photos   better-looking photos from Pexels (free key: pexels.com/api)
 *   npm run photos -- --force   re-download everything
 *
 * Credits are saved to src/data/photoCredits.json and shown in the website footer.
 * After running, open photo-review.html in your browser to check every photo.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products as catalogue } from '../src/data/products';

export interface PhotoJob { id: string; name: string; photoQuery?: string }
export interface Credit { by: string; license: string; url: string; source: 'Pexels' | 'Wikimedia Commons' }
interface Found { imageUrl: string; credit: Credit }
type Fetch = typeof fetch;
export type Provider = 'pexels' | 'commons';

const UA = 'KailasSuperMarketWebsite/1.0 (small business website; photo fetch script)';

/* ---------- Pexels (needs a free key) ---------- */
interface PexelsPhoto { url: string; photographer: string; src: { original: string } }
export const pexelsSearchUrl = (q: string) => `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape`;
export const pexelsImageUrl = (original: string) => `${original}?auto=compress&cs=tinysrgb&fit=crop&w=720&h=576`;

async function pexels(q: string, key: string, f: Fetch): Promise<Found | null> {
  const res = await f(pexelsSearchUrl(q), { headers: { Authorization: key } });
  if (res.status === 401 || res.status === 403) throw new Error('Pexels rejected the API key. Check you copied it correctly.');
  if (res.status === 429) throw new Error('Pexels rate limit reached. Wait an hour and run again; finished photos are kept.');
  if (!res.ok) throw new Error(`Pexels answered ${res.status}`);
  const pick = ((await res.json()) as { photos?: PexelsPhoto[] }).photos?.[0];
  return pick ? { imageUrl: pexelsImageUrl(pick.src.original), credit: { by: pick.photographer, license: 'Pexels License', url: pick.url, source: 'Pexels' } } : null;
}

/* ---------- Wikimedia Commons (no key) ---------- */
export const commonsSearchUrl = (q: string) =>
  'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=12' +
  `&gsrsearch=${encodeURIComponent(`${q} filetype:bitmap`)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=720&iiextmetadatafilter=LicenseShortName|Artist`;

interface CommonsPage { index?: number; title: string; imageinfo?: { thumburl?: string; descriptionurl?: string; width: number; height: number; mime: string; extmetadata?: { LicenseShortName?: { value: string }; Artist?: { value: string } } }[] }

/** Only licences that allow commercial use are accepted (no NC / ND). */
export const licenceOk = (l: string) => /^(CC0|Public domain|PD\b|CC BY(-SA)? [\d.]+|CC BY(-SA)?$)/i.test(l.trim()) && !/-(NC|ND)/i.test(l);
const strip = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

async function commons(q: string, f: Fetch): Promise<Found | null> {
  const res = await f(commonsSearchUrl(q), { headers: { 'User-Agent': UA } });
  if (res.status === 429) throw new Error('Wikimedia rate limit reached. Wait a few minutes and run again; finished photos are kept.');
  if (!res.ok) throw new Error(`Wikimedia answered ${res.status}`);
  const pages = Object.values(((await res.json()) as { query?: { pages?: Record<string, CommonsPage> } }).query?.pages ?? {}).sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  for (const pg of pages) {
    const i = pg.imageinfo?.[0];
    const lic = i?.extmetadata?.LicenseShortName?.value ?? '';
    if (!i?.thumburl || i.mime !== 'image/jpeg' || i.width < 600 || i.height < 400 || !licenceOk(lic)) continue;
    return { imageUrl: i.thumburl, credit: { by: strip(i.extmetadata?.Artist?.value ?? 'Unknown'), license: lic, url: i.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(pg.title)}`, source: 'Wikimedia Commons' } };
  }
  return null;
}

/* ---------- runner ---------- */
export interface RunOptions {
  provider: Provider; key?: string; jobs: PhotoJob[]; outDir: string; creditsFile: string;
  force?: boolean; fetchImpl?: Fetch; log?: (m: string) => void; delayMs?: number;
}

export async function run({ provider, key = '', jobs, outDir, creditsFile, force = false, fetchImpl = fetch, log = console.log, delayMs = 400 }: RunOptions) {
  mkdirSync(outDir, { recursive: true });
  const have = new Set(readdirSync(outDir).map((f) => f.replace(/\.[^.]+$/, '')));
  let credits: Record<string, Credit> = {};
  try { credits = JSON.parse(readFileSync(creditsFile, 'utf8')); } catch { /* new file */ }
  let ok = 0, skipped = 0;
  const failed: string[] = [];

  for (const job of jobs) {
    if (!force && have.has(job.id)) { skipped++; continue; }
    const q = job.photoQuery ?? job.name;
    try {
      const found = provider === 'pexels' ? await pexels(q, key, fetchImpl) : await commons(q, fetchImpl);
      if (!found) { failed.push(`${job.id} (no suitable photo for "${q}")`); log(`  - ${job.name}: no suitable photo found`); }
      else {
        const img = await fetchImpl(found.imageUrl, { headers: { 'User-Agent': UA } });
        if (!img.ok) throw new Error(`image download answered ${img.status}`);
        writeFileSync(join(outDir, `${job.id}.jpg`), Buffer.from(await img.arrayBuffer()));
        credits[job.id] = found.credit; ok++; log(`  ✓ ${job.name}`);
      }
    } catch (e) {
      const msg = (e as Error).message;
      if (/API key|rate limit/.test(msg)) { log(`\n${msg}`); break; }
      failed.push(`${job.id} (${msg})`); log(`  ✗ ${job.name}: ${msg}`);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  if (ok) writeFileSync(creditsFile, JSON.stringify(credits, null, 2) + '\n');
  return { ok, skipped, failed };
}

export function reviewPage(jobs: PhotoJob[], outDir: string, rootDir: string): string {
  const rel = outDir.replace(rootDir, '').replace(/^[\\/]/, '').replace(/\\/g, '/');
  const cards = jobs.map((j) => {
    const has = existsSync(join(outDir, `${j.id}.jpg`));
    return `<figure><div>${has ? `<img src="${rel}/${j.id}.jpg" alt="">` : '<span>NO PHOTO</span>'}</div><figcaption><b>${j.name}</b><br>${j.id}.jpg</figcaption></figure>`;
  }).join('');
  return `<!doctype html><meta charset="utf-8"><title>Photo review</title><style>body{font:15px system-ui;margin:20px;background:#faf7f0}h1{color:#173F2B}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}figure{margin:0;background:#fff;border:1px solid #ddd;border-radius:10px;overflow:hidden}figure div{aspect-ratio:5/4;background:#e8f0e6;display:flex;align-items:center;justify-content:center;color:#a33}img{width:100%;height:100%;object-fit:cover}figcaption{padding:8px;font-size:13px}</style><h1>Check every photo</h1><p>Wrong or ugly one? Delete its file in <code>${rel}</code> and drop in your own photo with the same name.</p><div class="g">${cards}</div>`;
}

async function main() {
  const ci = process.argv.includes('--ci');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  if (ci && /^(off|0|false)$/i.test(process.env.PHOTOS_AUTO ?? '')) { console.log('[photos] PHOTOS_AUTO is off: skipping.'); return; }
  const key = process.env.PEXELS_API_KEY?.trim() ?? '';
  let provider: Provider = key ? 'pexels' : 'commons';
  if (!ci && !key && !process.argv.includes('--commons')) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const a = (await rl.question('Press Enter to use free photos from Wikimedia Commons (no account),\nor paste a free Pexels API key (pexels.com/api) for nicer photos: ')).trim();
    rl.close();
    if (a) { process.env.PEXELS_API_KEY = a; provider = 'pexels'; }
  }
  const outDir = join(root, 'src/assets/products');
  console.log(`[photos] Source: ${provider === 'pexels' ? 'Pexels' : 'Wikimedia Commons'}. ${catalogue.length} products...\n`);
  const r = await run({ provider, key: process.env.PEXELS_API_KEY?.trim() ?? '', jobs: catalogue, outDir, creditsFile: join(root, 'src/data/photoCredits.json'), force: process.argv.includes('--force') });
  console.log(`\n[photos] ${r.ok} downloaded, ${r.skipped} already had a photo, ${r.failed.length} without a photo.`);
  if (r.failed.length) console.log('  Still missing (file name = product id, .jpg):\n   ' + r.failed.join('\n   '));
  if (!ci) {
    writeFileSync(join(root, 'photo-review.html'), reviewPage(catalogue, outDir, root));
    console.log('\nOpen photo-review.html in your browser to check every photo, then commit the new files.');
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  // In --ci mode (used by the build) a failure must never stop the website from deploying.
  main().catch((e) => { console.log('[photos] Skipped: ' + (e as Error).message); if (!process.argv.includes('--ci')) process.exitCode = 1; });
}

import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { commonsSearchUrl, licenceOk, pexelsImageUrl, pexelsSearchUrl, reviewPage, run } from '../../scripts/fetch-photos';

const jobs = [{ id: 'apple', name: 'Apples', photoQuery: 'red apples' }, { id: 'rice', name: 'Rice' }];
const tmp = () => mkdtempSync(join(tmpdir(), 'photos-'));
const asFetch = (f: unknown) => f as unknown as typeof fetch;

const pexelsApi = () => vi.fn(async (url: string | URL | Request) =>
  String(url).startsWith('https://api.pexels.com')
    ? new Response(JSON.stringify({ photos: [{ url: 'https://pexels.test/p/1', photographer: 'Ann', src: { original: 'https://img.test/1.jpeg' } }] }), { status: 200 })
    : new Response(new Uint8Array([1, 2, 3]), { status: 200 }));

const page = (index: number, o: { mime?: string; w?: number; h?: number; lic?: string }) => ({
  index, title: `File:P${index}.jpg`,
  imageinfo: [{ thumburl: `https://up.test/p${index}.jpg`, descriptionurl: `https://commons.test/P${index}`, width: o.w ?? 2000, height: o.h ?? 1500, mime: o.mime ?? 'image/jpeg', extmetadata: { LicenseShortName: { value: o.lic ?? 'CC BY-SA 4.0' }, Artist: { value: '<a href="x">Jo &amp; Co</a>' } } }],
});
const commonsApi = (pages: unknown[]) => vi.fn(async (url: string | URL | Request) =>
  String(url).startsWith('https://commons.wikimedia.org')
    ? new Response(JSON.stringify({ query: { pages: Object.fromEntries(pages.map((p, i) => [String(i), p])) } }), { status: 200 })
    : new Response(new Uint8Array([9, 9]), { status: 200 }));

describe('photo downloader (mocked network)', () => {
  it('Pexels: builds the documented request, saves <id>.jpg and credits', async () => {
    const dir = tmp(); const cf = join(dir, 'c.json'); const f = pexelsApi();
    const calls = f.mock.calls as unknown as unknown[][];
    const r = await run({ provider: 'pexels', key: 'KEY', jobs, outDir: dir, creditsFile: cf, fetchImpl: asFetch(f), log: () => {}, delayMs: 0 });
    expect(r).toEqual({ ok: 2, skipped: 0, failed: [] });
    expect(calls[0][0]).toBe(pexelsSearchUrl('red apples'));
    expect((calls[0][1] as RequestInit).headers).toEqual({ Authorization: 'KEY' });
    expect(calls[2][0]).toBe(pexelsSearchUrl('Rice'));
    expect(calls[1][0]).toBe(pexelsImageUrl('https://img.test/1.jpeg'));
    expect(readFileSync(join(dir, 'apple.jpg'))).toEqual(Buffer.from([1, 2, 3]));
    expect(JSON.parse(readFileSync(cf, 'utf8')).apple.by).toBe('Ann');
  });

  it('Commons: needs no key, sends a User-Agent and skips unusable results', async () => {
    const dir = tmp(); const cf = join(dir, 'c.json');
    const f = commonsApi([page(3, {}), page(1, { mime: 'image/png' }), page(2, { w: 300 }), page(4, { lic: 'CC BY-NC 4.0' }), page(5, { lic: 'CC BY 3.0' })]);
    const calls = f.mock.calls as unknown as unknown[][];
    const r = await run({ provider: 'commons', jobs: [jobs[0]], outDir: dir, creditsFile: cf, fetchImpl: asFetch(f), log: () => {}, delayMs: 0 });
    expect(r.ok).toBe(1);
    expect(calls[0][0]).toBe(commonsSearchUrl('red apples'));
    expect(((calls[0][1] as RequestInit).headers as Record<string, string>)['User-Agent']).toContain('Kailas');
    expect(calls[1][0]).toBe('https://up.test/p3.jpg'); // best-ranked usable result (index 3 beats 5; 1,2,4 rejected)
    expect(JSON.parse(readFileSync(cf, 'utf8')).apple).toEqual({ by: 'Jo & Co', license: 'CC BY-SA 4.0', url: 'https://commons.test/P3', source: 'Wikimedia Commons' });
  });

  it('only accepts licences that allow commercial use', () => {
    ['CC0', 'Public domain', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0'].forEach((l) => expect(licenceOk(l), l).toBe(true));
    ['CC BY-NC 4.0', 'CC BY-ND 2.0', 'CC BY-NC-SA 3.0', 'All rights reserved', ''].forEach((l) => expect(licenceOk(l), l).toBe(false));
  });

  it('skips existing photos unless forced', async () => {
    const dir = tmp(); writeFileSync(join(dir, 'apple.png'), 'mine');
    const r = await run({ provider: 'pexels', key: 'K', jobs, outDir: dir, creditsFile: join(dir, 'c.json'), fetchImpl: asFetch(pexelsApi()), log: () => {}, delayMs: 0 });
    expect(r.skipped).toBe(1); expect(r.ok).toBe(1); expect(existsSync(join(dir, 'apple.jpg'))).toBe(false);
  });

  it('stops on a bad key, reports empty searches and survives network errors', async () => {
    const dir = tmp(); const logs: string[] = [];
    const bad = vi.fn(async () => new Response('no', { status: 401 }));
    await run({ provider: 'pexels', key: 'x', jobs, outDir: dir, creditsFile: join(dir, 'c.json'), fetchImpl: asFetch(bad), log: (m) => logs.push(m), delayMs: 0 });
    expect(bad).toHaveBeenCalledTimes(1); expect(logs.join()).toContain('rejected the API key');
    const none = await run({ provider: 'commons', jobs: [jobs[0]], outDir: dir, creditsFile: join(dir, 'c.json'), fetchImpl: asFetch(commonsApi([])), log: () => {}, delayMs: 0 });
    expect(none.failed[0]).toContain('apple');
    const down = await run({ provider: 'commons', jobs, outDir: dir, creditsFile: join(dir, 'c.json'), fetchImpl: asFetch(vi.fn(async () => { throw new Error('fetch failed'); })), log: () => {}, delayMs: 0 });
    expect(down.failed).toHaveLength(2);
  });

  it('writes a review page listing every product', () => {
    const dir = tmp(); writeFileSync(join(dir, 'apple.jpg'), 'x');
    const html = reviewPage(jobs, dir, tmp());
    expect(html).toContain('apple.jpg'); expect(html).toContain('NO PHOTO');
  });
});

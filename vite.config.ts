import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readdirSync } from 'node:fs';
import { products } from './src/data/products';
import { store } from './src/config/store';
import { buildRobots, buildSeoHead, buildSitemap, configWarnings, resolveSiteUrl } from './src/lib/seo';

/** Fills the <head> (title, Open Graph, JSON-LD), robots.txt and sitemap.xml from src/config/store.ts. */
function storeSeo(): Plugin {
  const env = { ...process.env, ...loadEnv('production', process.cwd(), '') } as Record<string, string | undefined>;
  const url = resolveSiteUrl(store, env);
  return {
    name: 'store-seo',
    transformIndexHtml: { order: 'pre', handler: (html) => html.replace('<!--SEO_HEAD-->', buildSeoHead(store, url)) },
    buildStart() {
      configWarnings(store, env).forEach((w) => this.warn(`[store setup] ${w}`));
      if (!existsSync('public' + store.storeImage.src)) this.error(`Storefront photo missing: expected public${store.storeImage.src}`);
      let have = new Set<string>();
      try { have = new Set(readdirSync('src/assets/products').map((f) => f.replace(/\.[^.]+$/, ''))); } catch { /* none */ }
      const missing = products.filter((p) => !p.image && !have.has(p.id));
      if (missing.length) this.warn(`[store setup] ${missing.length} of ${products.length} products have no photo yet (they show a plain icon tile). Run: npm run photos`);
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobots(url) });
      if (url) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(url) });
    },
  };
}

export default defineConfig({ plugins: [react(), storeSeo()], build: { target: 'es2020' } });

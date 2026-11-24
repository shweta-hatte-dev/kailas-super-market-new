import { useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, Plus, Share2, ShoppingBasket, Trash2 } from 'lucide-react';
import { store } from '../config/store';
import { categories } from '../data/categories';
import { allProducts } from '../data/lookup';
import { bestMatch, formatShoppingList } from '../lib/list';
import { formatINR } from '../lib/format';
import { useShop } from '../context/ShopContext';
import { SectionHead } from './ui';

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  try {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

export function ShoppingList() {
  const { list, addListItem, toggleListItem, removeListItem, clearDoneItems, add, toast, qtyOf } = useShop();
  const [text, setText] = useState('');
  const matches = useMemo(() => Object.fromEntries(list.map((i) => [i.id, bestMatch(i.text, allProducts, categories)])), [list]);
  const todo = list.filter((i) => !i.done);
  const addable = todo.filter((i) => matches[i.id]);

  const submit = () => { if (text.trim()) { addListItem(text); setText(''); } };
  const addAll = () => {
    addable.forEach((i) => add(matches[i.id]!.id));
    const left = todo.length - addable.length;
    toast(`${addable.length} ${addable.length === 1 ? 'item' : 'items'} added to cart${left ? `. ${left} not found in our products.` : ''}`, { id: 'list' });
  };
  const body = () => formatShoppingList(list, store.name);
  const copy = async () => toast((await copyText(body())) ? 'Shopping list copied' : 'Could not copy. Please select the list and copy it manually.', { id: 'copy' });
  const share = async () => {
    if (typeof navigator.share === 'function') { try { await navigator.share({ title: 'Shopping list', text: body() }); return; } catch (e) { if ((e as Error).name === 'AbortError') return; } }
    copy();
  };

  return (
    <section id="list" aria-labelledby="list-title" className="py-14 sm:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHead id="list-title" title="Your shopping list" text="Jot down what you need. When you are ready, add matching products to your cart in one tap. Your list stays saved on this device." />
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
            <label htmlFor="list-input" className="sr-only">Add an item to your list</label>
            <input id="list-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={80} placeholder="e.g. toor dal, milk, soap" className="field" autoComplete="off" />
            <button type="submit" className="btn btn-primary" aria-label="Add to list"><Plus size={19} aria-hidden="true" /><span className="hidden sm:inline">Add</span></button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={addAll} disabled={!addable.length}><ShoppingBasket size={18} aria-hidden="true" /> Add matches to cart</button>
            <button type="button" className="btn btn-outline" onClick={copy} disabled={!list.length}><Copy size={17} aria-hidden="true" /> Copy</button>
            <button type="button" className="btn btn-outline" onClick={share} disabled={!list.length}><Share2 size={17} aria-hidden="true" /> Share</button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 ring-1 ring-forest/10 sm:p-6">
          {list.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ClipboardList size={38} className="text-forest" aria-hidden="true" />
              <p className="mt-3 text-xl font-semibold text-forest">Your list is empty</p>
              <p className="mt-1 max-w-xs text-ink/70">Type an item above and press Add. Try “rice” or “dahi”.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-forest/10">
                {list.map((i) => {
                  const m = matches[i.id];
                  return (
                    <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                      <label className="flex min-h-[44px] flex-1 cursor-pointer items-center gap-3">
                        <input type="checkbox" checked={i.done} onChange={() => toggleListItem(i.id)} className="h-5 w-5 shrink-0 accent-[#173F2B]" />
                        <span className={`text-[16px] ${i.done ? 'text-ink/50 line-through' : 'font-medium'}`}>{i.text}</span>
                      </label>
                      {m && !i.done && (
                        <button type="button" onClick={() => add(m.id)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-sage px-3 text-sm font-medium text-forest hover:bg-sage-deep" aria-label={`Add ${m.name} to cart`}>
                          {qtyOf(m.id) > 0 ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}{m.name} {m.unit}{store.showPrices && ` · ${formatINR(m.price)}`}
                        </button>
                      )}
                      <button type="button" onClick={() => removeListItem(i.id)} aria-label={`Remove ${i.text}`} className="flex h-11 w-11 items-center justify-center rounded-md text-ink/60 hover:bg-forest/10 hover:text-forest"><Trash2 size={18} /></button>
                    </li>
                  );
                })}
              </ul>
              {list.some((i) => i.done) && <button type="button" onClick={clearDoneItems} className="mt-3 text-sm font-medium text-forest underline underline-offset-2">Clear completed items</button>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

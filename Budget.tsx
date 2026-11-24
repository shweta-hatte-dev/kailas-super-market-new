import { useState } from 'react';
import { AlertTriangle, Plus, Wallet } from 'lucide-react';
import { store } from '../config/store';
import { allProducts } from '../data/lookup';
import { BUDGET_PRESETS, budgetStatus, fitsBudget, parseBudget } from '../lib/budget';
import { formatINR } from '../lib/format';
import { useShop } from '../context/ShopContext';
import { SectionHead } from './ui';

const barColour = { ok: 'bg-leaf', near: 'bg-gold', over: 'bg-[#B4472F]' };

export function BudgetMeter({ compact = false }: { compact?: boolean }) {
  const { budget, cartTotal } = useShop();
  if (!budget) return null;
  const s = budgetStatus(cartTotal, budget);
  return (
    <div className={compact ? '' : 'mt-1'}>
      <div className="flex items-baseline justify-between gap-3 text-[15px]">
        <span>Cart <b className="tabular-nums">{formatINR(cartTotal)}</b> of <b className="tabular-nums">{formatINR(budget)}</b></span>
        <span className={`font-semibold tabular-nums ${s.state === 'over' ? 'text-[#B4472F]' : 'text-leaf-dark'}`}>{s.state === 'over' ? `${formatINR(s.over)} over` : `${formatINR(s.remaining)} left`}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-forest/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.pct} aria-label="Budget used">
        <div className={`h-full rounded-full transition-all duration-500 ${barColour[s.state]}`} style={{ width: `${s.pct}%` }} />
      </div>
      {s.state === 'over' && <p role="alert" className="mt-3 flex items-start gap-2 rounded-md bg-[#B4472F]/10 p-3 text-[15px] font-medium text-[#8c3320]"><AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />Your cart is {formatINR(s.over)} over your budget. Remove an item or raise your budget.</p>}
      {s.state === 'near' && <p className="mt-3 text-sm font-medium text-forest">You are close to your budget.</p>}
    </div>
  );
}

export function Budget() {
  const { budget, setBudget, cartTotal, cart, add } = useShop();
  const [custom, setCustom] = useState('');
  const [err, setErr] = useState('');
  if (!store.showPrices) return null;

  const apply = () => { const n = parseBudget(custom); if (!n) { setErr('Enter an amount in rupees, for example 750.'); return; } setErr(''); setBudget(n); setCustom(''); };
  const remaining = budget ? budget - cartTotal : 0;
  const ideas = budget && remaining > 0 ? fitsBudget(allProducts.filter((p) => p.quick), remaining, cart.map((l) => l.id)).slice(0, 5) : [];

  return (
    <section id="budget" aria-labelledby="budget-title" className="bg-sage py-14 sm:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHead id="budget-title" title="Shop within your budget" text="Set an amount and watch it as you fill your cart. We’ll warn you if you go over." />
          <fieldset>
            <legend className="mb-2 text-[15px] font-semibold text-forest">Choose a budget</legend>
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((b) => <button key={b} type="button" className="chip" aria-pressed={budget === b} onClick={() => setBudget(b)}>{formatINR(b)}</button>)}
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex-1">
                <label htmlFor="budget-custom" className="sr-only">Custom budget in rupees</label>
                <input id="budget-custom" inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder="Custom amount, e.g. 750" className="field" aria-invalid={!!err} aria-describedby={err ? 'budget-err' : undefined} />
              </div>
              <button type="button" onClick={apply} className="btn btn-primary">Set budget</button>
            </div>
            {err && <p id="budget-err" role="alert" className="mt-2 text-sm font-medium text-[#8c3320]">{err}</p>}
          </fieldset>
          {budget && <button type="button" onClick={() => setBudget(null)} className="mt-4 text-sm font-medium text-forest underline underline-offset-2">Remove budget</button>}
        </div>

        <div className="rounded-lg bg-white p-5 ring-1 ring-forest/10 sm:p-7">
          {budget ? (
            <>
              <BudgetMeter />
              {ideas.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-sans text-base font-semibold text-ink">Everyday items that fit what is left</h3>
                  <ul className="mt-3 divide-y divide-forest/10">
                    {ideas.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="min-w-0"><span className="block truncate text-[15px] font-medium">{p.name}</span><span className="text-sm text-ink/65">{p.unit} · {formatINR(p.price)}</span></span>
                        <button type="button" onClick={() => add(p.id)} className="btn btn-outline px-3" aria-label={`Add ${p.name} to cart`}><Plus size={17} aria-hidden="true" /> Add</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <Wallet size={38} className="text-forest" aria-hidden="true" />
              <p className="mt-3 text-xl font-semibold text-forest">No budget set</p>
              <p className="mt-1 max-w-xs text-ink/70">Pick an amount on the left and your cart total will be tracked against it.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

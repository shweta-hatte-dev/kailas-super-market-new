const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const paise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatINR = (n: number): string => {
  const v = Math.round(n * 100) / 100;
  return Number.isInteger(v) ? whole.format(v) : paise.format(v);
};

export const percentOff = (price: number, mrp?: number): number =>
  mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

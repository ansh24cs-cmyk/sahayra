const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatInr = (n: number) => inr.format(n);
export const lowestPrice = (v: { priceInr: number }[]) => Math.min(...v.map((x) => x.priceInr));
export const inStock = (v: { stock: number }[]) => v.some((x) => x.stock > 0);

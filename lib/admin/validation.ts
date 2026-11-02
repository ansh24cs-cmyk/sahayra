import type { FulfilmentStatus } from "../types";
export type V<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
const isInt = (n: number, lo: number, hi: number) => Number.isInteger(n) && n >= lo && n <= hi;
const obj = (v: unknown) => (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
const fin = <T>(e: Record<string, string>, value: T): V<T> => (Object.keys(e).length ? { ok: false, errors: e } : { ok: true, value });
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export interface ProductValue { name: string; slug: string; category: string; material: string; description: string; images: string[]; variants: { sku: string; label: string; priceInr: number; stock: number }[]; compareAtInr: number | null; archived: boolean }
export function validateProduct(input: unknown): V<ProductValue> {
  const o = obj(input), e: Record<string, string> = {};
  const name = str(o.name, 120); if (name.length < 2) e.name = "Enter a product name.";
  const slug = str(o.slug, 80) || slugify(name); if (!SLUG.test(slug)) e.slug = "Use lowercase letters, numbers and hyphens.";
  const category = str(o.category, 40); if (!SLUG.test(category)) e.category = "Choose a category.";
  const material = str(o.material, 80); if (material.length < 2) e.material = "Enter the material.";
  const description = str(o.description, 2000);
  const images = (Array.isArray(o.images) ? o.images : []).map((x) => str(x, 600));
  if (images.length > 8 || images.some((u) => !/^https:\/\/\S+$/.test(u))) e.images = "Up to 8 images, each a secure (https) URL.";
  const rv = Array.isArray(o.variants) ? o.variants : []; const variants: ProductValue["variants"] = []; const seen = new Set<string>();
  if (rv.length < 1 || rv.length > 20) e.variants = "Add between 1 and 20 variants.";
  rv.slice(0, 20).forEach((x, i) => {
    const v = obj(x), sku = str(v.sku, 40), label = str(v.label, 60), price = num(v.priceInr), stock = num(v.stock);
    if (!/^[A-Za-z0-9._-]{2,40}$/.test(sku)) e[`variants.${i}.sku`] = "SKU: 2 to 40 letters, numbers, . _ -";
    else if (seen.has(sku)) e[`variants.${i}.sku`] = "Duplicate SKU.";
    seen.add(sku);
    if (!label) e[`variants.${i}.label`] = "Enter a label, e.g. Gold or Size 7.";
    if (!isInt(price, 1, 10_000_000)) e[`variants.${i}.priceInr`] = "Whole rupees, at least 1.";
    if (!isInt(stock, 0, 100_000)) e[`variants.${i}.stock`] = "Whole number, 0 or more.";
    variants.push({ sku, label, priceInr: price, stock });
  });
  let compareAtInr: number | null = null; const c = o.compareAtInr;
  if (c !== undefined && c !== null && c !== "") { compareAtInr = num(c); if (!isInt(compareAtInr, 1, 10_000_000) || compareAtInr <= Math.min(...variants.map((v) => v.priceInr))) e.compareAtInr = "Must be higher than the selling price, or leave it empty."; }
  return fin(e, { name, slug, category, material, description, images, variants, compareAtInr, archived: o.archived === true });
}
export function validateCategory(input: unknown): V<{ name: string; slug: string; order: number }> {
  const o = obj(input), e: Record<string, string> = {}; const name = str(o.name, 60); if (name.length < 2) e.name = "Enter a category name.";
  const slug = str(o.slug, 60) || slugify(name); if (!SLUG.test(slug)) e.slug = "Use lowercase letters, numbers and hyphens.";
  const order = o.order === undefined || o.order === "" || o.order === null ? 0 : num(o.order); if (!isInt(order, 0, 999)) e.order = "A whole number from 0 to 999.";
  return fin(e, { name, slug, order });
}
export interface CouponValue { code: string; description: string; type: "percent" | "flat"; value: number; minOrderInr: number; maxUses: number | null; startsAt: string | null; endsAt: string | null; active: boolean }
const when = (v: unknown): string | null | "bad" => { const s = str(v, 40); if (!s) return null; const t = Date.parse(s); return Number.isNaN(t) ? "bad" : new Date(t).toISOString(); };
export function validateCoupon(input: unknown): V<CouponValue> {
  const o = obj(input), e: Record<string, string> = {}; const code = str(o.code, 20).toUpperCase(); if (!/^[A-Z0-9]{3,20}$/.test(code)) e.code = "3 to 20 letters or numbers, no spaces.";
  const type = o.type === "flat" ? "flat" : o.type === "percent" ? "percent" : null; if (!type) e.type = "Choose percent or flat.";
  const value = num(o.value); if (type === "percent" ? !isInt(value, 1, 90) : !isInt(value, 1, 100_000)) e.value = type === "percent" ? "1 to 90 percent." : "Whole rupees, 1 to 100000.";
  const minOrderInr = o.minOrderInr === "" || o.minOrderInr == null ? 0 : num(o.minOrderInr); if (!isInt(minOrderInr, 0, 10_000_000)) e.minOrderInr = "Whole rupees, 0 or more.";
  const mu = o.maxUses === "" || o.maxUses == null ? null : num(o.maxUses); if (mu !== null && !isInt(mu, 1, 1_000_000)) e.maxUses = "A whole number, or leave empty.";
  const s = when(o.startsAt), en = when(o.endsAt); if (s === "bad") e.startsAt = "Enter a valid date."; if (en === "bad") e.endsAt = "Enter a valid date.";
  if (s && en && s !== "bad" && en !== "bad" && Date.parse(en) <= Date.parse(s)) e.endsAt = "The end must be after the start.";
  return fin(e, { code, description: str(o.description, 160), type: type ?? "percent", value, minOrderInr, maxUses: mu, startsAt: s === "bad" ? null : s, endsAt: en === "bad" ? null : en, active: o.active === true });
}
/** Server-side coupon maths for the future checkout phase. The client never supplies the discount. */
export function evaluateCoupon(c: CouponValue, subtotalInr: number, nowMs: number, used = 0): { ok: true; discountInr: number } | { ok: false; reason: string } {
  if (!c.active) return { ok: false, reason: "inactive" };
  if (c.startsAt && nowMs < Date.parse(c.startsAt)) return { ok: false, reason: "not_started" };
  if (c.endsAt && nowMs > Date.parse(c.endsAt)) return { ok: false, reason: "expired" };
  if (subtotalInr < c.minOrderInr) return { ok: false, reason: "below_minimum" };
  if (c.maxUses !== null && used >= c.maxUses) return { ok: false, reason: "used_up" };
  return { ok: true, discountInr: c.type === "percent" ? Math.floor((subtotalInr * c.value) / 100) : Math.min(c.value, subtotalInr) };
}
export function validateBanner(input: unknown): V<{ title: string; subtitle: string; imageUrl: string; href: string; order: number; published: boolean }> {
  const o = obj(input), e: Record<string, string> = {}; const title = str(o.title, 80); if (title.length < 2) e.title = "Enter a title.";
  const imageUrl = str(o.imageUrl, 600); if (imageUrl && !/^https:\/\/\S+$/.test(imageUrl)) e.imageUrl = "Use a secure (https) image URL, or leave empty.";
  const href = str(o.href, 200); if (href && !/^\/(?![/\\])[^\s\\]*$/.test(href)) e.href = "Use a path on this site, like /shop.";
  const order = o.order === "" || o.order == null ? 0 : num(o.order); if (!isInt(order, 0, 999)) e.order = "A whole number from 0 to 999.";
  return fin(e, { title, subtitle: str(o.subtitle, 160), imageUrl, href, order, published: o.published === true });
}
export interface SettingsValue { storeName: string; supportEmail: string; supportPhone: string; announcement: string; shippingFlatInr: number; freeShippingAboveInr: number | null }
export function validateSettings(input: unknown): V<SettingsValue> {
  const o = obj(input), e: Record<string, string> = {}; const storeName = str(o.storeName, 60); if (storeName.length < 2) e.storeName = "Enter the store name.";
  const supportEmail = str(o.supportEmail, 120); if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(supportEmail)) e.supportEmail = "Enter a valid email.";
  const shippingFlatInr = o.shippingFlatInr === "" || o.shippingFlatInr == null ? 0 : num(o.shippingFlatInr); if (!isInt(shippingFlatInr, 0, 100_000)) e.shippingFlatInr = "Whole rupees, 0 or more.";
  const fa = o.freeShippingAboveInr === "" || o.freeShippingAboveInr == null ? null : num(o.freeShippingAboveInr); if (fa !== null && !isInt(fa, 0, 10_000_000)) e.freeShippingAboveInr = "Whole rupees, or leave empty.";
  return fin(e, { storeName, supportEmail, supportPhone: str(o.supportPhone, 20), announcement: str(o.announcement, 120), shippingFlatInr, freeShippingAboveInr: fa });
}
const NEXT: Record<FulfilmentStatus, FulfilmentStatus[]> = { pending: ["processing", "cancelled"], processing: ["packed", "cancelled"], packed: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [] };
export const nextStatuses = (s: FulfilmentStatus): FulfilmentStatus[] => NEXT[s] ?? [];
export function validateStatusUpdate(input: unknown, current: FulfilmentStatus): V<{ status: FulfilmentStatus; note: string; shipment?: { courier: string; awb: string; estimatedDelivery?: string } }> {
  const o = obj(input), e: Record<string, string> = {}; const status = o.status as FulfilmentStatus;
  if (!nextStatuses(current).includes(status)) e.status = "That change isn't allowed from the current status.";
  let shipment; if (status === "shipped") { const courier = str(o.courier, 60), awb = str(o.awb, 40), est = str(o.estimatedDelivery, 20);
    if (courier.length < 2) e.courier = "Enter the courier name."; if (!/^[A-Za-z0-9-]{3,40}$/.test(awb)) e.awb = "Enter the AWB / tracking number.";
    if (est && Number.isNaN(Date.parse(est))) e.estimatedDelivery = "Enter a valid date."; shipment = { courier, awb, ...(est ? { estimatedDelivery: est } : {}) }; }
  return fin(e, { status, note: str(o.note, 200), ...(shipment ? { shipment } : {}) });
}

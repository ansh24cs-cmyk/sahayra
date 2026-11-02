import type { AddressInput, AddressLabel } from "../types";
const LABELS = ["Home", "Work", "Other"];
export const normalisePhone = (v: string) => v.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
export type AddressResult = { ok: true; value: AddressInput } | { ok: false; errors: Record<string, string> };
/** Builds the value from an allow-list of fields; unknown input keys (isDefault, role, uid...) are dropped. */
export function validateAddress(input: unknown): AddressResult {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const v = { fullName: s(o.fullName), phone: normalisePhone(s(o.phone)), line1: s(o.line1), line2: s(o.line2), landmark: s(o.landmark), city: s(o.city), state: s(o.state), pincode: s(o.pincode), country: s(o.country) || "India", label: s(o.label) };
  const e: Record<string, string> = {};
  if (v.fullName.length < 2 || v.fullName.length > 80) e.fullName = "Enter the recipient's full name.";
  if (!/^[6-9]\d{9}$/.test(v.phone)) e.phone = "Enter a valid 10-digit Indian mobile number.";
  if (v.line1.length < 3 || v.line1.length > 120) e.line1 = "Enter the house or flat number and street.";
  if (v.line2.length > 120) e.line2 = "Keep this under 120 characters.";
  if (v.landmark.length > 80) e.landmark = "Keep this under 80 characters.";
  if (v.city.length < 2 || v.city.length > 60) e.city = "Enter the city.";
  if (v.state.length < 2 || v.state.length > 60) e.state = "Enter the state.";
  if (!/^[1-9]\d{5}$/.test(v.pincode)) e.pincode = "Enter a valid 6-digit PIN code.";
  if (v.country !== "India") e.country = "We currently deliver within India only.";
  if (!LABELS.includes(v.label)) e.label = "Choose Home, Work or Other.";
  if (Object.keys(e).length) return { ok: false, errors: e };
  return { ok: true, value: { ...v, country: "India", label: v.label as AddressLabel } };
}
export function validateProfile(input: unknown): { ok: true; value: { displayName: string; phone: string } } | { ok: false; errors: Record<string, string> } {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>; const e: Record<string, string> = {};
  const displayName = s(o.displayName); const phone = normalisePhone(s(o.phone));
  if (displayName.length < 2 || displayName.length > 80) e.displayName = "Enter your full name.";
  if (phone && !/^[6-9]\d{9}$/.test(phone)) e.phone = "Enter a valid 10-digit Indian mobile number, or leave it empty.";
  return Object.keys(e).length ? { ok: false, errors: e } : { ok: true, value: { displayName, phone } };
}

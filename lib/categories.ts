import type { Category } from "./types";
/** Plain module (no "use client"): safe to import from both Server and Client Components. */
export const CATEGORIES: readonly (readonly [Category, string])[] = [
  ["earrings", "Earrings"], ["necklaces", "Necklaces"], ["rings", "Rings"], ["bracelets", "Bracelets"], ["anklets", "Anklets"],
];

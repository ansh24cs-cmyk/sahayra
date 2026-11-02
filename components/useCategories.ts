"use client";
import { useEffect, useState } from "react"; import { CATEGORIES } from "@/lib/categories";
/** Starts with the defaults (so server and client markup match), then swaps in admin-managed categories if any exist. */
export function useCategories() {
  const [c, setC] = useState<readonly (readonly [string, string])[]>(CATEGORIES);
  useEffect(() => { fetch("/api/categories").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.items?.length) setC(d.items); }).catch(() => {}); }, []);
  return c;
}

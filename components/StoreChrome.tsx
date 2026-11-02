"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header"; import Footer from "@/components/Footer"; import CartDrawer from "@/components/CartDrawer";
/** Storefront header, footer and bag drawer for every page except /admin, wherever the page file lives. */
export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith("/admin")) return <>{children}</>;
  return (<><a href="#main" className="sr-only focus:not-sr-only">Skip to content</a><Header /><main id="main">{children}</main><Footer /><CartDrawer /></>);
}

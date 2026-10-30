import Header from "@/components/Header"; import Footer from "@/components/Footer"; import CartDrawer from "@/components/CartDrawer";
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (<><a href="#main" className="sr-only focus:not-sr-only">Skip to content</a><Header /><main id="main">{children}</main><Footer /><CartDrawer /></>);
}

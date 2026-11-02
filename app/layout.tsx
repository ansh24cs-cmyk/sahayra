import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import StoreChrome from "@/components/StoreChrome";
import { CartProvider } from "@/context/CartContext";
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-serif" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = { title: { default: "Sahayra | Fine & demi-fine jewellery", template: "%s | Sahayra" }, description: "Fine and demi-fine jewellery designed in India." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en-IN" className={`${serif.variable} ${sans.variable}`}><body>
    <CartProvider><AuthProvider><WishlistProvider><StoreChrome>{children}</StoreChrome></WishlistProvider></AuthProvider></CartProvider></body></html>);
}

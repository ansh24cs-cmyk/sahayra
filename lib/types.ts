export type Category = "earrings" | "necklaces" | "rings" | "bracelets" | "anklets";
export interface Variant { sku: string; label: string; priceInr: number; stock: number }
export interface Product {
  id: string; slug: string; name: string; category: Category; material: string;
  images: string[]; variants: Variant[]; compareAtInr?: number; archived?: boolean; createdAt: string;
}
export interface CartLine { productId: string; sku: string; name: string; variantLabel: string; priceInr: number; image?: string; qty: number }
export interface TrackingEvent { at: string; status: string; location?: string }
export interface Shipment { courier: string; awb: string; estimatedDelivery?: string; events: TrackingEvent[] }
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export interface Order { id: string; lines: CartLine[]; totalInr: number; paymentStatus: PaymentStatus; shipment?: Shipment }
export interface ProductQuery { q?: string; category?: Category; maxPrice?: number; inStock?: boolean; sort?: "new" | "low" | "high"; page?: number }
export interface Paged<T> { items: T[]; total: number }

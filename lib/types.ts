export type Category = string; // slug; managed in the admin Categories page
export interface Variant { sku: string; label: string; priceInr: number; stock: number }
export interface Product {
  id: string; slug: string; name: string; category: Category; material: string; description?: string;
  images: string[]; variants: Variant[]; compareAtInr?: number; archived?: boolean; createdAt: string;
}
export interface CartLine { productId: string; sku: string; name: string; variantLabel: string; priceInr: number; image?: string; qty: number }
export interface TrackingEvent { at: string; status: string; location?: string }
export interface Shipment { courier: string; awb: string; estimatedDelivery?: string; events: TrackingEvent[] }
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export interface Order { id: string; lines: CartLine[]; totalInr: number; paymentStatus: PaymentStatus; shipment?: Shipment }
export interface ProductQuery { q?: string; category?: Category; maxPrice?: number; inStock?: boolean; sort?: "new" | "low" | "high"; page?: number }
export interface Paged<T> { items: T[]; total: number }
// ---- Phase 2: customer data & orders ----
export type AddressLabel = "Home" | "Work" | "Other";
export interface AddressInput { fullName: string; phone: string; line1: string; line2?: string; landmark?: string; city: string; state: string; pincode: string; country: "India"; label: AddressLabel }
export interface Address extends AddressInput { id: string; isDefault: boolean; createdAt: string; updatedAt: string }
export type FulfilmentStatus = "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled";
export interface OrderLine { productId: string; name: string; sku: string; image?: string; variantLabel?: string; unitPriceInr: number; qty: number; lineTotalInr: number }
export interface StatusEvent { status: string; at: string; note?: string }
/** Money is whole rupees. Convert to paise (x100) only at the Razorpay boundary. */
export interface OrderRecord { id: string; orderNumber: string; userId: string; lines: OrderLine[]; subtotalInr: number; discountInr: number; shippingInr: number; taxInr: number; totalInr: number; currency: "INR";
  shippingAddress: AddressInput; billingAddress: AddressInput; payment: { provider: "razorpay" | null; status: PaymentStatus; providerOrderId?: string };
  fulfilmentStatus: FulfilmentStatus; shipment?: Shipment; history: StatusEvent[]; createdAt: string; updatedAt: string }

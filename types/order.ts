export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderPayment {
  method: string;
  status: string;
  transactionRef?: string;
}

export interface OrderDeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  total: number;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  payment: OrderPayment;
  deliveryAddress: OrderDeliveryAddress;
  pricing: OrderPricing;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

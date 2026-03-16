import { Order, OrderStatus } from "@/types/order";
import { endpoints } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_ORDERS_KEY = "@customer_orders";

type CreateOrderInput = {
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  paymentMethod?: string;
  transactionRef?: string;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export async function getAllOrders(token: string, status?: OrderStatus): Promise<Order[]> {
  try {
    const url = status ? `${endpoints.orders}?status=${status}` : endpoints.orders;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return [];
    }

    return (await res.json()) as Order[];
  } catch (error) {
    console.error("Failed to fetch orders", error);
    return [];
  }
}

export async function getOrderById(token: string, orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`${endpoints.orders}${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as Order;
  } catch (error) {
    console.error("Failed to fetch order details", error);
    return null;
  }
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus
): Promise<{ ok: boolean; message?: string; order?: Order }> {
  try {
    const res = await fetch(`${endpoints.orders}${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: data.message || "Failed to update order status" };
    }

    return { ok: true, order: data as Order };
  } catch (error) {
    return { ok: false, message: "Could not connect to server" };
  }
}

async function readLocalOrders(): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(LOCAL_ORDERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalOrders(orders: Order[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

export async function createOrder(
  token: string,
  payload: CreateOrderInput
): Promise<{ ok: boolean; order?: Order; message?: string }> {
  try {
    const res = await fetch(endpoints.orders, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: data.message || "Failed to place order" };
    }

    const created = data as Order;
    const localOrders = await readLocalOrders();
    await writeLocalOrders([created, ...localOrders]);
    return { ok: true, order: created };
  } catch {
    return { ok: false, message: "Could not connect to server" };
  }
}

export async function getMyOrders(token: string): Promise<Order[]> {
  try {
    const res = await fetch(`${endpoints.orders}my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const apiOrders = (await res.json()) as Order[];
      await writeLocalOrders(apiOrders);
      return apiOrders;
    }
  } catch {
    // Fallback to local data from successful createOrder calls.
  }

  return await readLocalOrders();
}

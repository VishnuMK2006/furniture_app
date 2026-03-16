import AsyncStorage from "@react-native-async-storage/async-storage";
import { endpoints } from "@/utils/api";

export type PersonalInfo = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
};

export type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type PaymentMethod = {
  id: string;
  cardHolder: string;
  cardNumberMasked: string;
  expiry: string;
  brand: string;
  isDefault: boolean;
};

export type WishlistItem = {
  productId: string;
  name: string;
  imageUrl?: string | null;
  currentPrice: number;
};

export type NotificationPrefs = {
  orderUpdates: boolean;
  promotions: boolean;
  restockAlerts: boolean;
  wishlistDrops: boolean;
};

export type AppSettings = {
  biometricLogin: boolean;
  darkMode: boolean;
  language: "English" | "Tamil" | "Hindi";
};

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "Open" | "Resolved";
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  reason: string;
  createdAt: string;
  status: "Requested" | "Approved" | "Rejected";
};

const KEYS = {
  personal: "@profile_personal_info",
  addresses: "@profile_addresses",
  payments: "@profile_payment_methods",
  wishlist: "@profile_wishlist",
  notifications: "@profile_notifications",
  settings: "@profile_settings",
  tickets: "@profile_support_tickets",
  returns: "@profile_return_requests",
} as const;

const defaultNotificationPrefs: NotificationPrefs = {
  orderUpdates: true,
  promotions: true,
  restockAlerts: true,
  wishlistDrops: true,
};

const defaultSettings: AppSettings = {
  biometricLogin: false,
  darkMode: false,
  language: "English",
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

type LocalSession = {
  token?: string;
};

async function getSessionToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem("session");
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as LocalSession;
    return session?.token || null;
  } catch {
    return null;
  }
}

async function fetchProfilePath<T>(path: string, fallback: T): Promise<T> {
  const token = await getSessionToken();
  if (!token) return fallback;

  try {
    const res = await fetch(`${endpoints.profile}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function putProfilePath<T>(path: string, value: T): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) return false;

  try {
    const res = await fetch(`${endpoints.profile}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(value),
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function getPersonalInfo(): Promise<PersonalInfo> {
  const local = await readJSON<PersonalInfo>(KEYS.personal, {
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  const remote = await fetchProfilePath<PersonalInfo>("personal", local);
  await writeJSON(KEYS.personal, remote);
  return remote;
}

export async function savePersonalInfo(value: PersonalInfo): Promise<void> {
  await putProfilePath("personal", value);
  await writeJSON(KEYS.personal, value);
}

export async function getAddresses(): Promise<SavedAddress[]> {
  const local = await readJSON<SavedAddress[]>(KEYS.addresses, []);
  const remote = await fetchProfilePath<SavedAddress[]>("addresses", local);
  await writeJSON(KEYS.addresses, remote);
  return remote;
}

export async function saveAddresses(value: SavedAddress[]): Promise<void> {
  await putProfilePath("addresses", value);
  await writeJSON(KEYS.addresses, value);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const local = await readJSON<PaymentMethod[]>(KEYS.payments, []);
  const remote = await fetchProfilePath<PaymentMethod[]>("payment-methods", local);
  await writeJSON(KEYS.payments, remote);
  return remote;
}

export async function savePaymentMethods(value: PaymentMethod[]): Promise<void> {
  await putProfilePath("payment-methods", value);
  await writeJSON(KEYS.payments, value);
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const local = await readJSON<WishlistItem[]>(KEYS.wishlist, []);
  const remote = await fetchProfilePath<WishlistItem[]>("wishlist", local);
  await writeJSON(KEYS.wishlist, remote);
  return remote;
}

export async function saveWishlist(value: WishlistItem[]): Promise<void> {
  await putProfilePath("wishlist", value);
  await writeJSON(KEYS.wishlist, value);
}

export async function upsertWishlistItem(item: WishlistItem): Promise<void> {
  const current = await getWishlist();
  const exists = current.some((value) => value.productId === item.productId);
  const next = exists
    ? current.map((value) => (value.productId === item.productId ? item : value))
    : [item, ...current];
  await saveWishlist(next);
}

export async function removeWishlistItem(productId: string): Promise<void> {
  const current = await getWishlist();
  await saveWishlist(current.filter((item) => item.productId !== productId));
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const current = await getWishlist();
  return current.some((item) => item.productId === productId);
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const local = await readJSON<NotificationPrefs>(KEYS.notifications, defaultNotificationPrefs);
  const remote = await fetchProfilePath<NotificationPrefs>("notifications", local);
  await writeJSON(KEYS.notifications, remote);
  return remote;
}

export async function saveNotificationPrefs(value: NotificationPrefs): Promise<void> {
  await putProfilePath("notifications", value);
  await writeJSON(KEYS.notifications, value);
}

export async function getAppSettings(): Promise<AppSettings> {
  const local = await readJSON<AppSettings>(KEYS.settings, defaultSettings);
  const remote = await fetchProfilePath<AppSettings>("settings", local);
  await writeJSON(KEYS.settings, remote);
  return remote;
}

export async function saveAppSettings(value: AppSettings): Promise<void> {
  await putProfilePath("settings", value);
  await writeJSON(KEYS.settings, value);
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  const local = await readJSON<SupportTicket[]>(KEYS.tickets, []);
  const remote = await fetchProfilePath<SupportTicket[]>("support-tickets", local);
  await writeJSON(KEYS.tickets, remote);
  return remote;
}

export async function saveSupportTickets(value: SupportTicket[]): Promise<void> {
  await putProfilePath("support-tickets", value);
  await writeJSON(KEYS.tickets, value);
}

export async function getReturnRequests(): Promise<ReturnRequest[]> {
  const local = await readJSON<ReturnRequest[]>(KEYS.returns, []);
  const remote = await fetchProfilePath<ReturnRequest[]>("returns", local);
  await writeJSON(KEYS.returns, remote);
  return remote;
}

export async function saveReturnRequests(value: ReturnRequest[]): Promise<void> {
  await putProfilePath("returns", value);
  await writeJSON(KEYS.returns, value);
}

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

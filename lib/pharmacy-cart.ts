"use client";

export type PharmacyCartItem = {
  id: number;
  name: string;
  form: string;
  price: number;
  qty: number;
  stock: number;
};

const CART_KEY = "pharmacy_cart_v1";

type LegacyCartV2 = Record<
  string,
  {
    item?: {
      id?: number;
      name?: string;
      form?: string;
      price?: number;
      stock?: number;
    };
    qty?: number;
  }
>;

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeCartItem(item: Partial<PharmacyCartItem>) {
  const id = Number(item.id);
  const price = Number(item.price);
  const qty = Number(item.qty ?? 1);
  const stock = Number(item.stock ?? 0);

  if (!Number.isInteger(id) || id <= 0) return null;
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isInteger(qty) || qty <= 0) return null;

  return {
    id,
    name: String(item.name ?? "").trim(),
    form: String(item.form ?? "").trim(),
    price,
    qty,
    stock: Number.isInteger(stock) && stock >= 0 ? stock : 0,
  } satisfies PharmacyCartItem;
}

function readLegacyCart() {
  if (!isBrowser()) return [] as PharmacyCartItem[];

  const v2 = safeParse<LegacyCartV2>(localStorage.getItem("cart_v2"), {});
  const migratedV2 = Object.values(v2)
    .map((entry) =>
      normalizeCartItem({
        ...entry.item,
        qty: entry.qty ?? 1,
      }),
    )
    .filter((item): item is PharmacyCartItem => Boolean(item));

  if (migratedV2.length > 0) return migratedV2;

  const legacy = safeParse<Array<Partial<PharmacyCartItem>>>(
    localStorage.getItem("cart"),
    [],
  );

  return legacy
    .map((item) => normalizeCartItem(item))
    .filter((item): item is PharmacyCartItem => Boolean(item));
}

export function readPharmacyCart() {
  if (!isBrowser()) return [] as PharmacyCartItem[];

  const current = safeParse<Array<Partial<PharmacyCartItem>>>(
    localStorage.getItem(CART_KEY),
    [],
  )
    .map((item) => normalizeCartItem(item))
    .filter((item): item is PharmacyCartItem => Boolean(item));

  if (current.length > 0) return current;

  const migrated = readLegacyCart();
  if (migrated.length > 0) {
    writePharmacyCart(migrated);
  }

  return migrated;
}

export function writePharmacyCart(items: PharmacyCartItem[]) {
  if (!isBrowser()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearPharmacyCart() {
  if (!isBrowser()) return;
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem("cart");
  localStorage.removeItem("cart_v2");
}

export function addToPharmacyCart(
  item: Omit<PharmacyCartItem, "qty"> & { qty?: number },
) {
  const cart = readPharmacyCart();
  const nextQty = Number(item.qty ?? 1);
  const existing = cart.find((entry) => entry.id === item.id);

  if (existing) {
    existing.qty = Math.min(existing.qty + nextQty, Math.max(item.stock, 1));
    existing.stock = item.stock;
    writePharmacyCart([...cart]);
    return [...cart];
  }

  const normalized = normalizeCartItem({
    ...item,
    qty: Math.min(Math.max(nextQty, 1), Math.max(item.stock, 1)),
  });

  if (!normalized) return cart;

  const next = [...cart, normalized];
  writePharmacyCart(next);
  return next;
}

export function updatePharmacyCartQty(id: number, qty: number) {
  const cart = readPharmacyCart();
  const next = cart
    .map((item) =>
      item.id === id
        ? {
            ...item,
            qty: Math.min(Math.max(qty, 0), Math.max(item.stock, 1)),
          }
        : item,
    )
    .filter((item) => item.qty > 0);

  writePharmacyCart(next);
  return next;
}

export function removeFromPharmacyCart(id: number) {
  const next = readPharmacyCart().filter((item) => item.id !== id);
  writePharmacyCart(next);
  return next;
}

export function getPharmacyCartCount(items?: PharmacyCartItem[]) {
  return (items ?? readPharmacyCart()).reduce((sum, item) => sum + item.qty, 0);
}

export function getPharmacyCartTotal(items?: PharmacyCartItem[]) {
  return (items ?? readPharmacyCart()).reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
}

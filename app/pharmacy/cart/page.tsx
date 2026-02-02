"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Medicine = {
  id: number;
  name: string;
  form: string;
  price: number;
  available?: boolean;
  manufacturer?: string;
  rating?: number;
  reviews?: number;
};

type CartEntry = { item: Medicine; qty: number };
type Cart = Record<string, CartEntry>;

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readCart(): Cart {
  if (typeof window === "undefined") return {};
  const parsed = safeJsonParse<Cart>(localStorage.getItem("cart_v2"), {});
  if (!parsed || typeof parsed !== "object") return {};
  return parsed;
}

function writeCart(cart: Cart) {
  localStorage.setItem("cart_v2", JSON.stringify(cart));
}

function cartToList(cart: Cart) {
  return Object.values(cart)
    .filter((e) => e && e.item && typeof e.qty === "number")
    .map((e) => e);
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({});
  const [wait, setWait] = useState<Medicine[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window === "undefined") return;

    setCart(readCart());
    setWait(safeJsonParse<Medicine[]>(localStorage.getItem("wait"), []));
  }, []);

  const list = useMemo(() => cartToList(cart), [cart]);

  const totalQty = useMemo(
    () => list.reduce((s, e) => s + (e.qty ?? 0), 0),
    [list],
  );

  const total = useMemo(
    () => list.reduce((s, e) => s + (e.item.price ?? 0) * (e.qty ?? 0), 0),
    [list],
  );

  if (!mounted) return null;

  function updateCart(next: Cart) {
    setCart(next);
    writeCart(next);
  }

  function changeQty(id: number, delta: number) {
    const key = String(id);
    const current = cart[key];
    if (!current) return;

    const nextQty = (current.qty ?? 0) + delta;
    const next = { ...cart };

    if (nextQty <= 0) {
      delete next[key];
    } else {
      next[key] = { ...current, qty: nextQty };
    }

    updateCart(next);
  }

  function removeFromCart(id: number) {
    const key = String(id);
    if (!cart[key]) return;
    const next = { ...cart };
    delete next[key];
    updateCart(next);
  }

  function clearCart() {
    updateCart({});
  }

  function removeFromWait(id: number) {
    const updated = wait.filter((i) => i.id !== id);
    setWait(updated);
    localStorage.setItem("wait", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-40">
        {/* BACK */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/pharmacy"
            className="inline-block text-indigo-600 hover:underline"
          >
            ← Вернуться в каталог
          </Link>

          {list.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:underline"
            >
              Очистить корзину
            </button>
          )}
        </div>

        <div className="flex items-end justify-between gap-6 mb-8">
          <h1 className="text-3xl font-semibold text-[#111827]">Корзина</h1>
          {list.length > 0 && (
            <div className="text-sm text-[#6B7280]">
              Товаров:{" "}
              <span className="text-[#111827] font-medium">{totalQty}</span>
            </div>
          )}
        </div>

        {/* CART */}
        {list.length === 0 ? (
          <p className="text-[#6B7280]">Корзина пуста</p>
        ) : (
          <div className="space-y-4">
            {list.map(({ item, qty }) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-[#111827]">{item.name}</div>
                  <div className="text-sm text-[#6B7280]">{item.form}</div>
                </div>

                <div className="flex items-center gap-6">
                  {/* QTY */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="h-8 w-8 rounded-lg border text-lg"
                      aria-label="Уменьшить количество"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="h-8 w-8 rounded-lg border text-lg"
                      aria-label="Увеличить количество"
                    >
                      +
                    </button>
                  </div>

                  {/* PRICE */}
                  <div className="w-28 text-right font-semibold">
                    {(item.price * qty).toFixed(2)} BYN
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WAIT LIST */}
        <h2 className="text-2xl font-semibold text-[#111827] mt-16 mb-4">
          Лист ожидания
        </h2>

        {wait.length === 0 ? (
          <p className="text-[#6B7280]">Лист ожидания пуст</p>
        ) : (
          <div className="space-y-4">
            {wait.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-black/5 p-4 flex justify-between"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-[#6B7280]">{item.form}</div>
                </div>

                <button
                  onClick={() => removeFromWait(item.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUMMARY */}
      {list.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10">
          <div className="max-w-5xl mx-auto px-8 h-20 flex items-center justify-between">
            <div className="text-lg font-semibold">
              Итого: {total.toFixed(2)} BYN
            </div>

            <Link
              href="/pharmacy/checkout"
              className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center"
            >
              Оформить заказ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

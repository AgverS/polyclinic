"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  form: string;
  price: number;
  qty?: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<Item[]>([]);
  const [wait, setWait] = useState<Item[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window === "undefined") return;

    const storedCart: Item[] = JSON.parse(
      localStorage.getItem("cart") || "[]",
    ).map((i: Item) => ({ ...i, qty: i.qty ?? 1 }));

    setCart(storedCart);
    setWait(JSON.parse(localStorage.getItem("wait") || "[]"));
  }, []);

  if (!mounted) return null;

  function updateCart(updated: Item[]) {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  function changeQty(id: number, delta: number) {
    updateCart(
      cart.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, (i.qty ?? 1) + delta) } : i,
      ),
    );
  }

  function removeFromCart(id: number) {
    updateCart(cart.filter((i) => i.id !== id));
  }

  function removeFromWait(id: number) {
    const updated = wait.filter((i) => i.id !== id);
    setWait(updated);
    localStorage.setItem("wait", JSON.stringify(updated));
  }

  const total = cart.reduce((s, i) => s + i.price * (i.qty ?? 1), 0);

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-40">
        {/* BACK */}
        <Link
          href="/pharmacy"
          className="inline-block mb-6 text-indigo-600 hover:underline"
        >
          ← Вернуться в каталог
        </Link>

        <h1 className="text-3xl font-semibold text-[#111827] mb-8">Корзина</h1>

        {/* CART */}
        {cart.length === 0 ? (
          <p className="text-[#6B7280]">Корзина пуста</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
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
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="h-8 w-8 rounded-lg border text-lg"
                    >
                      +
                    </button>
                  </div>

                  {/* PRICE */}
                  <div className="w-24 text-right font-semibold">
                    {(item.price * (item.qty ?? 1)).toFixed(2)} BYN
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
      {cart.length > 0 && (
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  form: string;
  price: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<Item[]>([]);
  const [wait, setWait] = useState<Item[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window === "undefined") return;

    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    setWait(JSON.parse(localStorage.getItem("wait") || "[]"));
  }, []);

  if (!mounted) return null;

  const total = cart.reduce((s, i) => s + i.price, 0);

  function removeFromCart(id: number) {
    const updated = cart.filter((i) => i.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  function removeFromWait(id: number) {
    const updated = wait.filter((i) => i.id !== id);
    setWait(updated);
    localStorage.setItem("wait", JSON.stringify(updated));
  }

  return (
    <div className="px-6 pt-24 pb-16 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-8">Корзина</h1>

      <h2 className="text-xl text-white font-medium mb-4">Товары к заказу</h2>

      {cart.length === 0 ? (
        <p className="text-gray-400">Корзина пуста</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-[14px] bg-[#111A2E] border border-white/10 flex justify-between"
              >
                <div>
                  <div className="text-white font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.form}</div>
                </div>

                <div className="text-right">
                  <div className="text-blue-500 font-semibold">
                    {item.price.toFixed(2)} BYN
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-400 hover:text-red-500 mt-2"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-lg text-white font-semibold">
              Итого: {total.toFixed(2)} BYN
            </div>

            <Link
              href="/pharmacy/checkout"
              className="h-12 px-6 rounded-[14px] bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center"
            >
              Оформить заказ
            </Link>
          </div>
        </>
      )}

      <h2 className="text-xl text-white font-medium mt-14 mb-4">
        Лист ожидания
      </h2>

      {wait.length === 0 ? (
        <p className="text-gray-400">Лист ожидания пуст</p>
      ) : (
        <div className="space-y-4">
          {wait.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-[14px] bg-[#0F172A] border border-white/10 flex justify-between"
            >
              <div>
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-sm text-gray-400">{item.form}</div>
              </div>

              <button
                onClick={() => removeFromWait(item.id)}
                className="text-sm text-red-400 hover:text-red-500"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

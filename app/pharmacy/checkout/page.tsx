/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: number;
  name: string;
  form: string;
  price: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<Item[]>([]);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  if (!mounted) return null;

  const total = cart.reduce((s, i) => s + i.price, 0);

  function submit() {
    if (!address || !phone || cart.length === 0) return;

    const newOrder = {
      id: Date.now().toString(),
      items: cart.map((i) => ({ name: i.name, price: i.price })),
      total,
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    localStorage.setItem("orders", JSON.stringify([...orders, newOrder]));
    localStorage.removeItem("cart");

    router.push("/pharmacy/profile");
  }

  return (
    <div className="px-6 pt-24 pb-16 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-10">
        Оформление заказа
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111A2E] border border-white/10 space-y-4">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Адрес доставки"
            className="w-full h-12 px-4 rounded-xl bg-[#0F172A] text-white border border-white/10"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Телефон"
            className="w-full h-12 px-4 rounded-xl bg-[#0F172A] text-white border border-white/10"
          />
        </div>

        <div className="p-6 rounded-2xl bg-[#111A2E] border border-white/10 h-fit">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm text-gray-300 mb-2"
            >
              <span>{item.name}</span>
              <span>{item.price.toFixed(2)} BYN</span>
            </div>
          ))}

          <div className="border-t border-white/10 pt-4 mt-4 flex justify-between text-white font-semibold">
            <span>Итого</span>
            <span>{total.toFixed(2)} BYN</span>
          </div>

          <button
            onClick={submit}
            disabled={!address || !phone}
            className="mt-6 w-full h-12 rounded-[14px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
          >
            Подтвердить заказ
          </button>
        </div>
      </div>
    </div>
  );
}

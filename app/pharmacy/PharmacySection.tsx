"use client";

import { useState } from "react";
import Link from "next/link";

type Medicine = {
  id: number;
  name: string;
  form: string;
  price: number;
  description: string;
  available: boolean;
};

const MOCK: Medicine[] = [
  {
    id: 1,
    name: "Парацетамол",
    form: "Таблетки · 500 мг",
    price: 2.45,
    description: "Жаропонижающее и обезболивающее средство.",
    available: true,
  },
  {
    id: 2,
    name: "Ибупрофен",
    form: "Капсулы · 200 мг",
    price: 4.1,
    description: "Противовоспалительное средство.",
    available: false,
  },
];

export default function PharmacySection() {
  const [opened, setOpened] = useState<Medicine | null>(null);

  function addToCart(item: Medicine) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    localStorage.setItem("cart", JSON.stringify([...cart, item]));
    setOpened(null);
  }

  function addToWait(item: Medicine) {
    const wait = JSON.parse(localStorage.getItem("wait") || "[]");
    localStorage.setItem("wait", JSON.stringify([...wait, item]));
    setOpened(null);
  }

  return (
    <>
      <div className="px-6 pt-24 pb-10">
        <h1 className="text-4xl font-semibold text-white">Онлайн-аптека</h1>
        <p className="mt-3 text-gray-400">Доставка лекарств на дом</p>
      </div>

      <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {MOCK.map((item) => (
          <div
            key={item.id}
            onClick={() => setOpened(item)}
            className="cursor-pointer rounded-2xl bg-[#111A2E] border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all"
          >
            <div className="h-40 bg-black/20 rounded-t-2xl" />

            <div className="p-4">
              <div className="text-white font-medium">{item.name}</div>
              <div className="text-sm text-gray-400 mt-1">{item.form}</div>
              <div className="mt-4 text-lg font-semibold text-blue-500">
                {item.price.toFixed(2)} BYN
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* КНОПКА КОРЗИНЫ */}
      <Link
        href="/pharmacy/cart"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-xl text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L23 6H6" />
        </svg>
      </Link>

      {/* БОКОВАЯ КАРТОЧКА */}
      {opened && (
        <div className="fixed inset-0 z-50 bg-black/60">
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#0E162A] border-l border-white/10 overflow-y-auto">
            <button
              onClick={() => setOpened(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="h-64 bg-black/30" />

            <div className="p-6">
              <h2 className="text-2xl font-semibold text-white">
                {opened.name}
              </h2>

              <p className="text-gray-400 mt-1">{opened.form}</p>

              <div className="mt-6 text-2xl font-semibold text-blue-500">
                {opened.price.toFixed(2)} BYN
              </div>

              <p className="mt-6 text-gray-400">{opened.description}</p>

              <div className="mt-10">
                {opened.available ? (
                  <button
                    onClick={() => addToCart(opened)}
                    className="w-full h-12 rounded-[14px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    В корзину
                  </button>
                ) : (
                  <button
                    onClick={() => addToWait(opened)}
                    className="w-full h-12 rounded-[14px] bg-white/5 hover:bg-white/10 text-white font-medium"
                  >
                    В лист ожидания
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

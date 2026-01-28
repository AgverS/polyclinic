"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Medicine = {
  id: number;
  name: string;
  form: string;
  price: number;
  available: boolean;
  manufacturer: string;
  rating: number;
  reviews: number;
};

const MOCK: Medicine[] = [
  {
    id: 1,
    name: "Парацетамол",
    form: "Таблетки · 500 мг",
    price: 2.45,
    available: true,
    manufacturer: "Фармстандарт",
    rating: 4.7,
    reviews: 214,
  },
  {
    id: 2,
    name: "Ибупрофен",
    form: "Капсулы · 200 мг",
    price: 4.1,
    available: false,
    manufacturer: "Berlin-Chemie",
    rating: 4.8,
    reviews: 302,
  },
  {
    id: 3,
    name: "Нурофен",
    form: "Таблетки · 200 мг",
    price: 6.2,
    available: true,
    manufacturer: "Reckitt",
    rating: 4.9,
    reviews: 1120,
  },
  {
    id: 4,
    name: "Аспирин",
    form: "Таблетки · 500 мг",
    price: 1.9,
    available: true,
    manufacturer: "Bayer",
    rating: 4.5,
    reviews: 640,
  },
  {
    id: 5,
    name: "Цитрамон",
    form: "Таблетки",
    price: 1.3,
    available: true,
    manufacturer: "Фармстандарт",
    rating: 4.4,
    reviews: 410,
  },
  {
    id: 6,
    name: "Анальгин",
    form: "Таблетки · 500 мг",
    price: 1.1,
    available: false,
    manufacturer: "Обновление",
    rating: 4.2,
    reviews: 380,
  },
  {
    id: 7,
    name: "Лоратадин",
    form: "Таблетки · 10 мг",
    price: 3.4,
    available: true,
    manufacturer: "Ozon",
    rating: 4.6,
    reviews: 520,
  },
  {
    id: 8,
    name: "Супрастин",
    form: "Таблетки · 25 мг",
    price: 5.8,
    available: true,
    manufacturer: "Egis",
    rating: 4.7,
    reviews: 690,
  },
  {
    id: 9,
    name: "Амоксициллин",
    form: "Капсулы · 500 мг",
    price: 8.9,
    available: true,
    manufacturer: "Sandoz",
    rating: 4.8,
    reviews: 980,
  },
  {
    id: 10,
    name: "Азитромицин",
    form: "Таблетки · 500 мг",
    price: 9.4,
    available: false,
    manufacturer: "Teva",
    rating: 4.9,
    reviews: 860,
  },
  {
    id: 11,
    name: "Мезим",
    form: "Таблетки",
    price: 7.3,
    available: true,
    manufacturer: "Berlin-Chemie",
    rating: 4.6,
    reviews: 740,
  },
  {
    id: 12,
    name: "Эспумизан",
    form: "Капсулы",
    price: 6.9,
    available: true,
    manufacturer: "Berlin-Chemie",
    rating: 4.7,
    reviews: 560,
  },
  {
    id: 13,
    name: "Фосфалюгель",
    form: "Гель",
    price: 8.1,
    available: true,
    manufacturer: "Ipsen",
    rating: 4.8,
    reviews: 620,
  },
  {
    id: 14,
    name: "Но-шпа",
    form: "Таблетки · 40 мг",
    price: 4.6,
    available: true,
    manufacturer: "Sanofi",
    rating: 4.9,
    reviews: 1450,
  },
  {
    id: 15,
    name: "Пенталгин",
    form: "Таблетки",
    price: 3.9,
    available: true,
    manufacturer: "Отисифарм",
    rating: 4.5,
    reviews: 710,
  },
  {
    id: 16,
    name: "Кларитин",
    form: "Таблетки · 10 мг",
    price: 6.5,
    available: true,
    manufacturer: "Bayer",
    rating: 4.6,
    reviews: 480,
  },
  {
    id: 17,
    name: "Линекс",
    form: "Капсулы",
    price: 10.2,
    available: true,
    manufacturer: "Sandoz",
    rating: 4.7,
    reviews: 830,
  },
  {
    id: 18,
    name: "Витамин C",
    form: "Таблетки · 500 мг",
    price: 2.9,
    available: true,
    manufacturer: "Zentiva",
    rating: 4.3,
    reviews: 390,
  },
  {
    id: 19,
    name: "Магне B6",
    form: "Таблетки",
    price: 12.4,
    available: true,
    manufacturer: "Sanofi",
    rating: 4.8,
    reviews: 920,
  },
  {
    id: 20,
    name: "Цетрин",
    form: "Таблетки · 10 мг",
    price: 4.8,
    available: true,
    manufacturer: "Dr. Reddy’s",
    rating: 4.6,
    reviews: 560,
  },
];

export default function PharmacySection() {
  const [opened, setOpened] = useState<Medicine | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartCount(JSON.parse(localStorage.getItem("cart") || "[]").length);
  }, []);

  function addToCart(item: Medicine) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    localStorage.setItem("cart", JSON.stringify([...cart, item]));
    setCartCount((c) => c + 1);
    setToast(`«${item.name}» добавлен в корзину`);
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <div className="max-w-350 mx-auto px-8 pt-24">
        <h1 className="text-4xl font-semibold text-[#111827]">Онлайн-аптека</h1>
        <p className="text-[#6B7280] mt-2">Каталог лекарств</p>

        <div className="grid grid-cols-5 gap-6 mt-10">
          {MOCK.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-xl p-4 cursor-pointer"
              onClick={() => setOpened(item)}
            >
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-[#6B7280]">{item.form}</div>
              <div className="text-xs mt-1">{item.manufacturer}</div>

              <div className="mt-3 flex justify-between items-center">
                <div className="font-semibold">{item.price.toFixed(2)} BYN</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                  disabled={!item.available}
                  className={`px-3 py-1.5 rounded-xl text-sm ${
                    item.available
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  В корзину
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CART BUTTON */}
      <Link
        href="/pharmacy/cart"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl"
      >
        {cartCount}
      </Link>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-24 right-6 bg-white border border-black/10 shadow-lg rounded-xl px-4 py-3 text-sm">
          {toast}
        </div>
      )}

      {/* DRAWER */}
      <AnimatePresence>
        {opened && (
          <>
            <motion.div
              onClick={() => setOpened(null)}
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed right-0 top-0 h-full w-110 bg-white z-50 p-6 overflow-y-auto"
            >
              <button onClick={() => setOpened(null)}>✕</button>
              <h2 className="text-2xl font-semibold mt-6">{opened.name}</h2>
              <p className="text-[#6B7280]">{opened.form}</p>
              <div className="mt-4 text-3xl font-semibold text-indigo-600">
                {opened.price.toFixed(2)} BYN
              </div>
              <button
                onClick={() => addToCart(opened)}
                className="mt-8 w-full h-12 rounded-2xl bg-indigo-600 text-white"
              >
                В корзину
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

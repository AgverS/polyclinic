"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: number;
  name: string;
  form: string;
  price: number;
  qty?: number;
};

type OrderItem = {
  id: number;
  name: string;
  form: string;
  price: number;
  qty: number;
  lineTotal: number;
};

type Order = {
  id: string;
  address: string;
  phone: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status: "created";
};

function formatBYN(value: number) {
  // На всякий — если окружение без Intl, но в браузере он есть.
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "BYN",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} BYN`;
  }
}

function normalizePhone(raw: string) {
  // оставляем + и цифры, остальные символы выкидываем
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

function isValidPhone(raw: string) {
  // простая проверка: 10–15 цифр (E.164 часто 10–15)
  const p = normalizePhone(raw);
  const digits = p.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [touched, setTouched] = useState<{ address: boolean; phone: boolean }>({
    address: false,
    phone: false,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const raw: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    // нормализуем qty
    const normalized = raw.map((i) => ({ ...i, qty: i.qty ?? 1 }));
    setCart(normalized);
  }, []);

  const orderItems: OrderItem[] = useMemo(() => {
    return cart.map((i) => {
      const qty = i.qty ?? 1;
      const lineTotal = i.price * qty;
      return {
        id: i.id,
        name: i.name,
        form: i.form,
        price: i.price,
        qty,
        lineTotal,
      };
    });
  }, [cart]);

  const total = useMemo(
    () => orderItems.reduce((s, i) => s + i.lineTotal, 0),
    [orderItems],
  );

  const addressError =
    touched.address && address.trim().length < 8
      ? "Укажи адрес подробнее (минимум 8 символов)."
      : "";

  const phoneError =
    touched.phone && !isValidPhone(phone)
      ? "Телефон выглядит некорректно (нужно 10–15 цифр)."
      : "";

  const canSubmit =
    cart.length > 0 &&
    address.trim().length >= 8 &&
    isValidPhone(phone) &&
    !submitting;

  function backToCart() {
    router.push("/pharmacy/cart");
  }

  function submit() {
    setTouched({ address: true, phone: true });
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        address: address.trim(),
        phone: normalizePhone(phone),
        items: orderItems,
        total,
        createdAt: new Date().toISOString(),
        status: "created",
      };

      const orders: Order[] = JSON.parse(
        localStorage.getItem("orders") || "[]",
      );
      localStorage.setItem("orders", JSON.stringify([...orders, newOrder]));
      localStorage.removeItem("cart");

      router.push("/pharmacy/profile");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="px-6 pt-24 pb-16 max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-4">
          Оформление заказа
        </h1>
        <div className="p-6 rounded-2xl bg-[#111A2E] border border-white/10">
          <p className="text-gray-300">
            Корзина пустая. Добавь товары, чтобы оформить заказ.
          </p>

          <button
            onClick={backToCart}
            className="mt-6 h-12 px-5 rounded-[14px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Перейти в корзину
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-24 pb-16 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-10">
        Оформление заказа
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Данные доставки */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111A2E] border border-white/10 space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Адрес доставки
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              placeholder="Город, улица, дом, квартира"
              className="w-full h-12 px-4 rounded-xl bg-[#0F172A] text-white border border-white/10 outline-none focus:border-white/20"
            />
            {addressError ? (
              <p className="mt-2 text-sm text-red-300">{addressError}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                Пример: Минск, пр-т Независимости 10-15
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Телефон</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              placeholder="+375 29 123-45-67"
              inputMode="tel"
              className="w-full h-12 px-4 rounded-xl bg-[#0F172A] text-white border border-white/10 outline-none focus:border-white/20"
            />
            {phoneError ? (
              <p className="mt-2 text-sm text-red-300">{phoneError}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                Можно с пробелами/дефисами — мы нормализуем при сохранении.
              </p>
            )}
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Нажимая “Подтвердить заказ”, ты подтверждаешь оформление заказа на
              выбранные товары.
            </p>
          </div>
        </div>

        {/* Итог */}
        <div className="p-6 rounded-2xl bg-[#111A2E] border border-white/10 h-fit">
          <h2 className="text-white font-semibold mb-4">Состав заказа</h2>

          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="text-sm">
                <div className="flex justify-between text-gray-200">
                  <span className="truncate pr-3">
                    {item.name}{" "}
                    <span className="text-gray-400">({item.form})</span>
                  </span>
                  <span className="shrink-0">{formatBYN(item.lineTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Кол-во: {item.qty}</span>
                  <span>{formatBYN(item.price)} / шт</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 mt-5 flex justify-between text-white font-semibold">
            <span>Итого</span>
            <span>{formatBYN(total)}</span>
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="mt-6 w-full h-12 rounded-[14px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium"
          >
            {submitting ? "Оформляем..." : "Подтвердить заказ"}
          </button>

          <button
            onClick={backToCart}
            className="mt-3 w-full h-12 rounded-[14px] bg-transparent border border-white/10 hover:border-white/20 text-white/90"
          >
            Вернуться в корзину
          </button>
        </div>
      </div>
    </div>
  );
}

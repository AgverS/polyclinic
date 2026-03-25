"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import {
  clearPharmacyCart,
  getPharmacyCartTotal,
  readPharmacyCart,
  type PharmacyCartItem,
} from "@/lib/pharmacy-cart";

type OrderItem = {
  productId: number;
  name: string;
  form: string;
  price: number;
  qty: number;
  lineTotal: number;
};

function formatBYN(value: number) {
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
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

function isValidPhone(raw: string) {
  const p = normalizePhone(raw);
  const digits = p.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<PharmacyCartItem[]>([]);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  const [touched, setTouched] = useState<{ address: boolean; phone: boolean }>({
    address: false,
    phone: false,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    setCart(readPharmacyCart());
  }, []);

  const orderItems: OrderItem[] = useMemo(() => {
    return cart.map((item) => ({
      productId: item.id,
      name: item.name,
      form: item.form,
      price: item.price,
      qty: item.qty,
      lineTotal: item.price * item.qty,
    }));
  }, [cart]);

  const total = useMemo(() => getPharmacyCartTotal(cart), [cart]);

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

  async function submit() {
    setTouched({ address: true, phone: true });
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const token =
        typeof window === "undefined" ? null : localStorage.getItem("token");

      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          address: address.trim(),
          phone: normalizePhone(phone),
          comment: comment.trim(),
          userName: user?.fullName ?? "",
          items: orderItems.map((item) => ({
            productId: item.productId,
            qty: item.qty,
          })),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Не удалось оформить заказ");
      }

      clearPharmacyCart();
      router.push("/profile");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Не удалось оформить заказ",
      );
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
                Можно с пробелами и дефисами, телефон будет нормализован.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Комментарий к заказу
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Например: код домофона, удобное время, просьбы по заказу"
              className="w-full rounded-xl bg-[#0F172A] px-4 py-3 text-white border border-white/10 outline-none focus:border-white/20"
            />
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Нажимая кнопку подтверждения, вы отправляете заказ в систему, и он
              появится у администратора в разделе аптеки.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111A2E] border border-white/10 h-fit">
          <h2 className="text-white font-semibold mb-4">Состав заказа</h2>

          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.productId} className="text-sm">
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

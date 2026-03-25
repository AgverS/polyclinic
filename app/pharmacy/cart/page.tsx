"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getPharmacyCartCount,
  getPharmacyCartTotal,
  readPharmacyCart,
  removeFromPharmacyCart,
  type PharmacyCartItem,
  updatePharmacyCartQty,
} from "@/lib/pharmacy-cart";

function formatBYN(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "BYN",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function PharmacyCartPage() {
  const [cart, setCart] = useState<PharmacyCartItem[]>(() =>
    typeof window === "undefined" ? [] : readPharmacyCart(),
  );

  const total = useMemo(() => getPharmacyCartTotal(cart), [cart]);
  const count = useMemo(() => getPharmacyCartCount(cart), [cart]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#09101F_0%,#101A33_36%,#F4F7FB_36%,#F7F9FC_100%)] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#0F1A34]/92 p-8 text-white shadow-2xl shadow-slate-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">
                Корзина аптеки
              </div>
              <h1 className="mt-3 text-4xl font-semibold">Подготовка заказа</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Проверьте состав корзины и перейдите к оформлению заказа.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-right">
              <div className="text-sm text-slate-300">Товаров</div>
              <div className="mt-1 text-3xl font-semibold">{count}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-950">Товары</h2>
              <Link
                href="/pharmacy"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-cyan-400 hover:text-slate-950"
              >
                Вернуться в каталог
              </Link>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                Корзина пока пустая.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.form}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Остаток: {item.stock}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCart(removeFromPharmacyCart(item.id))}
                        className="rounded-full border border-rose-200 px-4 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            setCart(
                              updatePharmacyCartQty(item.id, item.qty - 1),
                            )
                          }
                          className="h-11 w-11 text-lg text-slate-700 transition hover:bg-slate-50"
                        >
                          -
                        </button>
                        <div className="flex min-w-14 justify-center text-sm font-semibold text-slate-950">
                          {item.qty}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCart(
                              updatePharmacyCartQty(item.id, item.qty + 1),
                            )
                          }
                          disabled={item.qty >= item.stock}
                          className="h-11 w-11 text-lg text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-slate-500">
                          {formatBYN(item.price)} / шт
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {formatBYN(item.price * item.qty)}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
            <h2 className="text-xl font-semibold text-slate-950">Итог</h2>

            <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Позиций</span>
                <span>{count}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-lg font-semibold text-slate-950">
                <span>Итого</span>
                <span>{formatBYN(total)}</span>
              </div>
            </div>

            <Link
              href={cart.length > 0 ? "/pharmacy/checkout" : "/pharmacy"}
              className={`mt-6 flex h-12 items-center justify-center rounded-[14px] font-medium ${
                cart.length > 0
                  ? "bg-cyan-400 text-slate-950 transition hover:bg-cyan-300"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {cart.length > 0 ? "Перейти к оформлению" : "Перейти в каталог"}
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

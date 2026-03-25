"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addToPharmacyCart,
  getPharmacyCartCount,
  readPharmacyCart,
} from "@/lib/pharmacy-cart";

type PharmacyProduct = {
  id: number;
  name: string;
  form: string;
  price: number;
  stock: number;
  isActive: boolean;
  manufacturer: string;
  requiresPrescription: boolean;
  category: string;
};

function formatPrice(value: number) {
  return `${value.toFixed(2)} BYN`;
}

export default function PharmacySection() {
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(() =>
    typeof window === "undefined"
      ? 0
      : getPharmacyCartCount(readPharmacyCart()),
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (onlyAvailable) params.set("onlyAvailable", "true");

    fetch(`/api/pharmacy/products?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Не удалось загрузить каталог");
        }
        const payload = (await res.json()) as PharmacyProduct[];
        setProducts(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки каталога",
        );
      })
      .finally(() => setLoading(false));
  }, [onlyAvailable, query]);

  const availableCount = useMemo(
    () => products.filter((product) => product.stock > 0).length,
    [products],
  );

  function handleAddToCart(product: PharmacyProduct) {
    if (product.stock <= 0) return;

    const next = addToPharmacyCart({
      id: product.id,
      name: product.name,
      form: product.form,
      price: product.price,
      stock: product.stock,
    });

    setCartCount(getPharmacyCartCount(next));
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_24%),linear-gradient(180deg,#0B1220_0%,#121D37_38%,#F4F7FB_38%,#F7F9FC_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <section className="rounded-4xl border border-white/10 bg-[#0F1A34]/92 p-8 text-white shadow-2xl shadow-slate-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                Аптека при поликлинике №26
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Онлайн-каталог лекарств и товаров первой необходимости
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Быстрый поиск по каталогу, понятная выдача наличия и отдельная
                страница с отзывами покупателей.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/pharmacy/cart"
                className="rounded-full border border-white/15 px-5 py-3 text-white/90 transition hover:border-cyan-300 hover:text-white"
              >
                Корзина ({cartCount})
              </Link>
              <Link
                href="/pharmacy/reviews"
                className="rounded-full bg-cyan-300 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-200"
              >
                Отзывы об аптеке
              </Link>
              <Link
                href="/pharmacy/checkout"
                className="rounded-full border border-white/15 px-5 py-3 text-white/90 transition hover:border-cyan-300 hover:text-white"
              >
                Оформление заказа
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">Позиций в каталоге</div>
              <div className="mt-2 text-3xl font-semibold">
                {products.length}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">В наличии</div>
              <div className="mt-2 text-3xl font-semibold">
                {availableCount}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">В корзине</div>
              <div className="mt-2 text-3xl font-semibold">{cartCount}</div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-4xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => {
                setLoading(true);
                setQuery(event.target.value);
              }}
              placeholder="Поиск по названию, форме, производителю"
              className="h-12 min-w-72 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-cyan-400 focus:bg-white"
            />

            <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) => {
                  setLoading(true);
                  setOnlyAvailable(event.target.checked);
                }}
                className="h-4 w-4"
              />
              Только в наличии
            </label>

            <div className="text-sm text-slate-500">
              Найдено: <span className="font-semibold">{products.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Загрузка каталога...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-600">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              По вашему запросу ничего не найдено.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-cyan-700">
                        {product.category}
                      </div>
                      <h2 className="mt-1 text-xl font-semibold text-slate-950">
                        {product.name}
                      </h2>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.stock > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {product.stock > 0 ? "В наличии" : "Нет в наличии"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">{product.form}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Производитель: {product.manufacturer}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Остаток: {product.stock}
                  </p>
                  {product.requiresPrescription ? (
                    <p className="mt-1 text-sm text-amber-600">
                      Отпускается по рецепту
                    </p>
                  ) : null}

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-2xl font-semibold text-slate-950">
                        {formatPrice(product.price)}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={() => handleAddToCart(product)}
                      className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      В корзину
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

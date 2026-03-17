"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Medicine = {
  id: number;
  name: string;
  form: string;
  price: number;
  available: boolean;
  manufacturer: string;
  rating: number;
  reviews: number;
  category: string;
};

const MEDICINES: Medicine[] = [
  {
    id: 1,
    name: "Парацетамол",
    form: "Таблетки · 500 мг",
    price: 2.45,
    available: true,
    manufacturer: "Фармстандарт",
    rating: 4.7,
    reviews: 214,
    category: "Жаропонижающие",
  },
  {
    id: 2,
    name: "Ибупрофен",
    form: "Капсулы · 200 мг",
    price: 4.1,
    available: true,
    manufacturer: "Berlin-Chemie",
    rating: 4.8,
    reviews: 302,
    category: "Боль и воспаление",
  },
  {
    id: 3,
    name: "Лоратадин",
    form: "Таблетки · 10 мг",
    price: 3.4,
    available: true,
    manufacturer: "Ozon",
    rating: 4.6,
    reviews: 520,
    category: "Аллергия",
  },
  {
    id: 4,
    name: "Но-шпа",
    form: "Таблетки · 40 мг",
    price: 4.6,
    available: false,
    manufacturer: "Sanofi",
    rating: 4.9,
    reviews: 1450,
    category: "Спазмолитики",
  },
  {
    id: 5,
    name: "Мезим",
    form: "Таблетки",
    price: 7.3,
    available: true,
    manufacturer: "Berlin-Chemie",
    rating: 4.6,
    reviews: 740,
    category: "Пищеварение",
  },
  {
    id: 6,
    name: "Цетрин",
    form: "Таблетки · 10 мг",
    price: 4.8,
    available: true,
    manufacturer: "Dr. Reddy's",
    rating: 4.6,
    reviews: 560,
    category: "Аллергия",
  },
];

function formatPrice(value: number) {
  return `${value.toFixed(2)} BYN`;
}

export default function PharmacySection() {
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return MEDICINES.filter((medicine) => {
      const matchesQuery =
        normalized.length === 0 ||
        `${medicine.name} ${medicine.form} ${medicine.manufacturer} ${medicine.category}`
          .toLowerCase()
          .includes(normalized);

      return matchesQuery && (!onlyAvailable || medicine.available);
    });
  }, [onlyAvailable, query]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,#0B1220_0%,#121D37_38%,#F4F7FB_38%,#F7F9FC_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-[#0F1A34]/92 p-8 text-white shadow-2xl shadow-slate-950/20">
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
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">Позиций в каталоге</div>
              <div className="mt-2 text-3xl font-semibold">1200+</div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">Средний рейтинг</div>
              <div className="mt-2 text-3xl font-semibold">4.8 / 5</div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">Самовывоз</div>
              <div className="mt-2 text-3xl font-semibold">от 30 мин</div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию, форме, производителю"
              className="h-12 min-w-72 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-cyan-400 focus:bg-white"
            />

            <label className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) => setOnlyAvailable(event.target.checked)}
                className="h-4 w-4"
              />
              Только в наличии
            </label>

            <div className="text-sm text-slate-500">
              Найдено: <span className="font-semibold">{filtered.length}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((medicine) => (
              <article
                key={medicine.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-cyan-700">{medicine.category}</div>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                      {medicine.name}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      medicine.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {medicine.available ? "В наличии" : "Нет в наличии"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-500">{medicine.form}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Производитель: {medicine.manufacturer}
                </p>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-2xl font-semibold text-slate-950">
                      {formatPrice(medicine.price)}
                    </div>
                    <div className="mt-1 text-sm text-amber-500">
                      ★ {medicine.rating} · {medicine.reviews} отзывов
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    В корзину
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Review = {
  id: number;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  tags: string[];
  verified: boolean;
};

const REVIEWS: Review[] = [
  {
    id: 1,
    author: "Марина К.",
    city: "Минск",
    rating: 5,
    date: "14 марта 2026",
    title: "Быстро собрали заказ",
    text: "Заказ оформила утром, к обеду уже получила уведомление о готовности. Фармацевт подсказал аналог и объяснил разницу по дозировке.",
    tags: ["Самовывоз", "Консультация"],
    verified: true,
  },
  {
    id: 2,
    author: "Алексей Р.",
    city: "Минск",
    rating: 4,
    date: "9 марта 2026",
    title: "Удобный онлайн-каталог",
    text: "Понравилось, что видно наличие и рейтинг препаратов. Хотелось бы чуть быстрее обновление остатков, но в целом всё корректно.",
    tags: ["Каталог", "Наличие"],
    verified: true,
  },
  {
    id: 3,
    author: "Ольга П.",
    city: "Минск",
    rating: 5,
    date: "2 марта 2026",
    title: "Вежливый персонал",
    text: "Нужен был препарат для ребёнка, помогли подобрать форму выпуска и подробно рассказали, как хранить после вскрытия упаковки.",
    tags: ["Сервис", "Фармацевт"],
    verified: false,
  },
  {
    id: 4,
    author: "Дмитрий С.",
    city: "Минск",
    rating: 3,
    date: "26 февраля 2026",
    title: "Очередь вечером",
    text: "После 18:00 пришлось подождать дольше обычного, но заказ выдали без ошибок, сроки годности были в порядке.",
    tags: ["Выдача", "Пиковые часы"],
    verified: true,
  },
  {
    id: 5,
    author: "Елена Т.",
    city: "Минск",
    rating: 5,
    date: "18 февраля 2026",
    title: "Чисто и понятно",
    text: "В аптеке аккуратно, зоны ожидания удобные. По заказу пришло понятное уведомление, в кассе всё оформили быстро.",
    tags: ["Интерьер", "Уведомления"],
    verified: true,
  },
  {
    id: 6,
    author: "Игорь М.",
    city: "Минск",
    rating: 4,
    date: "11 февраля 2026",
    title: "Хороший выбор аналогов",
    text: "Не было нужного производителя, но предложили несколько вариантов и сразу показали разницу в цене.",
    tags: ["Аналоги", "Цена"],
    verified: false,
  },
];

const FILTERS = [
  { label: "Все отзывы", value: 0 },
  { label: "5 звёзд", value: 5 },
  { label: "4+ звезды", value: 4 },
  { label: "3+ звезды", value: 3 },
];

function stars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function PharmacyReviewsPage() {
  const [minRating, setMinRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    rating: "5",
    text: "",
  });

  const filteredReviews = useMemo(
    () =>
      minRating === 0
        ? REVIEWS
        : REVIEWS.filter((review) => review.rating >= minRating),
    [minRating],
  );

  const average = (
    REVIEWS.reduce((sum, review) => sum + review.rating, 0) / REVIEWS.length
  ).toFixed(1);

  const recommended = Math.round(
    (REVIEWS.filter((review) => review.rating >= 4).length / REVIEWS.length) *
      100,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: "", rating: "5", text: "" });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.18),_transparent_30%),linear-gradient(180deg,#09101F_0%,#101A33_48%,#EFF4FF_48%,#F7F9FC_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-[#0F1A34]/92 p-8 text-white shadow-2xl shadow-slate-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                Отзывы покупателей
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Страница отзывов об аптеке
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Оценки сервиса, скорости выдачи и качества консультации в одном
                месте.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/pharmacy"
                className="rounded-full border border-white/15 px-5 py-3 text-white/90 transition hover:border-cyan-300 hover:text-white"
              >
                Каталог
              </Link>
              <Link
                href="/pharmacy/reviews"
                className="rounded-full bg-cyan-300 px-5 py-3 font-medium text-slate-950"
              >
                Отзывы
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">Средний рейтинг</div>
              <div className="mt-2 text-3xl font-semibold">{average}</div>
              <div className="mt-2 text-amber-300">★★★★★</div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">Рекомендуют</div>
              <div className="mt-2 text-3xl font-semibold">{recommended}%</div>
              <div className="mt-2 text-sm text-slate-300">
                по оценкам 4 и 5
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <div className="text-sm text-slate-300">Всего отзывов</div>
              <div className="mt-2 text-3xl font-semibold">{REVIEWS.length}</div>
              <div className="mt-2 text-sm text-slate-300">
                новые отзывы модерируются
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              {FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setMinRating(filter.value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    minRating === filter.value
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-300/70"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4">
              {filteredReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-950">
                          {review.title}
                        </h2>
                        {review.verified && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            Проверенная покупка
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        {review.author} · {review.city} · {review.date}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg tracking-[0.2em] text-amber-500">
                        {stars(review.rating)}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {review.rating}.0 из 5
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {review.text}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
            <div className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Новый отзыв
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Оставить отзыв
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Форма работает на клиенте и показывает подтверждение после
              отправки.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-cyan-400 focus:bg-white"
                placeholder="Ваше имя"
              />

              <select
                value={form.rating}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rating: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-cyan-400 focus:bg-white"
              >
                <option value="5">5 - отлично</option>
                <option value="4">4 - хорошо</option>
                <option value="3">3 - нормально</option>
                <option value="2">2 - есть замечания</option>
                <option value="1">1 - плохо</option>
              </select>

              <textarea
                required
                value={form.text}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                }
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white"
                placeholder="Что понравилось или что можно улучшить"
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
              >
                Отправить отзыв
              </button>
            </form>

            {submitted && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Спасибо. Отзыв принят и будет опубликован после проверки.
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/lib/context";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Review = {
  id: number;
  userName: string;
  rating: number;
  createdAt: string;
  title: string;
  text: string;
  tags: string[];
};

const FILTERS = [
  { label: "Все отзывы", value: 0 },
  { label: "5 звёзд", value: 5 },
  { label: "4+ звезды", value: 4 },
  { label: "3+ звезды", value: 3 },
];

function stars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PharmacyReviewsPage() {
  const { user } = useAuth();
  const [minRating, setMinRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    rating: "5",
    title: "",
    text: "",
    tags: "",
  });

  useEffect(() => {
    fetch("/api/pharmacy/reviews")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Не удалось загрузить отзывы");
        }

        const payload = (await res.json()) as Review[];
        setReviews(payload);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки отзывов",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredReviews = useMemo(
    () =>
      minRating === 0
        ? reviews
        : reviews.filter((review) => review.rating >= minRating),
    [minRating, reviews],
  );

  const average = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : "0.0";

  const recommended = reviews.length
    ? Math.round(
        (reviews.filter((review) => review.rating >= 4).length /
          reviews.length) *
          100,
      )
    : 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    try {
      const token =
        typeof window === "undefined" ? null : localStorage.getItem("token");

      const res = await fetch("/api/pharmacy/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userName: user ? user.fullName : form.name.trim(),
          rating: Number(form.rating),
          title: form.title.trim(),
          text: form.text.trim(),
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Не удалось отправить отзыв");
      }

      setSubmitted(true);
      setForm({
        name: user?.fullName ?? "",
        rating: "5",
        title: "",
        text: "",
        tags: "",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось отправить отзыв");
    } finally {
      setSubmitting(false);
    }
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
              <div className="mt-2 text-3xl font-semibold">{reviews.length}</div>
              <div className="mt-2 text-sm text-slate-300">
                опубликованные отзывы
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
              {loading ? (
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-500">
                  Загрузка отзывов...
                </div>
              ) : error ? (
                <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-600">
                  {error}
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-500">
                  Отзывов по выбранному фильтру пока нет.
                </div>
              ) : (
                filteredReviews.map((review) => (
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
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            Опубликовано
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {review.userName} · {formatDate(review.createdAt)}
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

                    {review.tags.length > 0 ? (
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
                    ) : null}
                  </article>
                ))
              )}
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
              Новый отзыв отправляется на сервер и появляется на странице после
              модерации администратором.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!user ? (
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
              ) : null}

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

              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-cyan-400 focus:bg-white"
                placeholder="Короткий заголовок"
              />

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

              <input
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-cyan-400 focus:bg-white"
                placeholder="Теги через запятую: доставка, сервис, наличие"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? "Отправляем..." : "Отправить отзыв"}
              </button>

              {submitted && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Спасибо. Отзыв отправлен и ожидает модерации.
                </div>
              )}
            </form>
          </aside>
        </section>
      </div>
    </div>
  );
}

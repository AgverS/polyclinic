"use client";

import { useAuth } from "@/lib/context";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "CREATED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type PharmacyOrder = {
  id: number;
  userId: number | null;
  userName: string | null;
  address: string;
  phone: string;
  comment: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productId: number;
    name: string;
    form: string;
    price: number;
    qty: number;
    lineTotal: number;
  }>;
};

type PharmacyReview = {
  id: number;
  userName: string;
  rating: number;
  title: string;
  text: string;
  tags: string[];
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  isPublished: boolean;
  createdAt: string;
};

const STATUSES: OrderStatus[] = [
  "CREATED",
  "PROCESSING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "BYN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function localOrderStatus(status: OrderStatus) {
  if (status === "CREATED") return "Создан";
  if (status === "PROCESSING") return "В обработке";
  if (status === "READY") return "Готов";
  if (status === "COMPLETED") return "Завершен";
  return "Отменен";
}

function orderStatusClass(status: OrderStatus) {
  if (status === "CREATED") return "bg-slate-100 text-slate-700";
  if (status === "PROCESSING") return "bg-amber-100 text-amber-700";
  if (status === "READY") return "bg-cyan-100 text-cyan-700";
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
  return "bg-rose-100 text-rose-700";
}

export default function AdminPharmacyPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [reviews, setReviews] = useState<PharmacyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);
  const [savingReviewId, setSavingReviewId] = useState<number | null>(null);

  useEffect(() => {
    const token =
      typeof window === "undefined" ? null : localStorage.getItem("token");

    if (!token) {
      setError("Нужна авторизация администратора");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("/api/pharmacy/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch("/api/pharmacy/reviews?includeUnpublished=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ])
      .then(async ([ordersRes, reviewsRes]) => {
        if (!ordersRes.ok || !reviewsRes.ok) {
          throw new Error("Не удалось загрузить аптечные данные");
        }

        const [ordersPayload, reviewsPayload] = await Promise.all([
          ordersRes.json() as Promise<PharmacyOrder[]>,
          reviewsRes.json() as Promise<PharmacyReview[]>,
        ]);

        setOrders(ordersPayload);
        setReviews(reviewsPayload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки данных аптеки",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingReviews = useMemo(
    () => reviews.filter((review) => review.moderationStatus === "PENDING"),
    [reviews],
  );

  async function updateOrderStatus(orderId: number, status: OrderStatus) {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingOrderId(orderId);
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Не удалось изменить статус");
      }

      const updated = (await res.json()) as PharmacyOrder;
      setOrders((current) =>
        current.map((item) => (item.id === orderId ? updated : item)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка обновления заказа");
    } finally {
      setSavingOrderId(null);
    }
  }

  async function moderateReview(
    reviewId: number,
    action: "APPROVE" | "REJECT",
  ) {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingReviewId(reviewId);
    try {
      const res = await fetch(`/api/pharmacy/reviews/${reviewId}/moderate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Не удалось обработать отзыв");
      }

      const updated = (await res.json()) as PharmacyReview;
      setReviews((current) =>
        current.map((item) => (item.id === reviewId ? updated : item)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка модерации");
    } finally {
      setSavingReviewId(null);
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-slate-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Раздел администратора</h1>
          <p className="mt-3 text-slate-300">
            Доступ к аптечным заказам открыт только администратору.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Вернуться в админку
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Аптечные заказы и отзывы</h1>
            <p className="mt-2 text-slate-300">
              Управление заказами покупателей и модерация новых отзывов.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-5 py-3 text-white/90 transition hover:border-cyan-300 hover:text-white"
          >
            Назад в админку
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            Загрузка...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-rose-100">
            {error}
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Заказы</h2>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                  Всего: {orders.length}
                </span>
              </div>

              {orders.length === 0 ? (
                <p className="text-slate-300">Заказов пока нет.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold">
                            Заказ #{order.id}
                          </div>
                          <div className="mt-1 text-sm text-slate-300">
                            {order.userName || "Гость"} · {order.phone}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {order.address}
                          </div>
                          {order.comment ? (
                            <div className="mt-2 text-sm text-slate-400">
                              Комментарий: {order.comment}
                            </div>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <div
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${orderStatusClass(order.status)}`}
                          >
                            {localOrderStatus(order.status)}
                          </div>
                          <div className="mt-2 text-sm text-slate-400">
                            {formatDateTime(order.createdAt)}
                          </div>
                          <div className="mt-2 text-lg font-semibold text-cyan-300">
                            {formatMoney(order.total)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-200">
                        {order.items.map((item) => (
                          <div
                            key={`${order.id}-${item.productId}`}
                            className="flex justify-between gap-4"
                          >
                            <span>
                              {item.name} ({item.form}) x {item.qty}
                            </span>
                            <span>{formatMoney(item.lineTotal)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {STATUSES.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={
                              savingOrderId === order.id || status === order.status
                            }
                            onClick={() => updateOrderStatus(order.id, status)}
                            className={`rounded-full px-4 py-2 text-sm transition ${
                              status === order.status
                                ? "bg-cyan-400 text-slate-950"
                                : "bg-white/10 text-white hover:bg-white/15"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {localOrderStatus(status)}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Отзывы</h2>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                  На модерации: {pendingReviews.length}
                </span>
              </div>

              {pendingReviews.length === 0 ? (
                <p className="text-slate-300">Новых отзывов нет.</p>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold">
                            {review.title}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {review.userName} · {review.rating}/5
                          </div>
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatDateTime(review.createdAt)}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-200">
                        {review.text}
                      </p>

                      {review.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {review.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          disabled={savingReviewId === review.id}
                          onClick={() => moderateReview(review.id, "APPROVE")}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-60"
                        >
                          Опубликовать
                        </button>
                        <button
                          type="button"
                          disabled={savingReviewId === review.id}
                          onClick={() => moderateReview(review.id, "REJECT")}
                          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400 disabled:opacity-60"
                        >
                          Отклонить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

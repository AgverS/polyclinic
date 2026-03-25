"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context";

type FeedbackItem = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const token =
      typeof window === "undefined" ? null : localStorage.getItem("token");

    if (!token) {
      setError("Нужна авторизация администратора");
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`/api/admin/feedback?onlyUnread=${onlyUnread}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Не удалось загрузить обращения");
        }

        return res.json() as Promise<FeedbackItem[]>;
      })
      .then((items) => {
        setFeedback(items);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки обращений",
        );
      })
      .finally(() => setLoading(false));
  }, [onlyUnread]);

  async function toggleRead(id: number, isRead: boolean) {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Не удалось обновить обращение");
      }

      const updated = (await res.json()) as FeedbackItem;
      setFeedback((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка обновления");
    } finally {
      setSavingId(null);
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <main className="clinic-shell px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl bg-white/80 p-8 text-center shadow-xl">
          Доступ открыт только администратору.
        </div>
      </main>
    );
  }

  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Админка · обращения</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Обратная связь с сайта
          </h1>
          <Link href="/admin" className="clinic-btn-ghost mt-6">
            Назад в админку
          </Link>
        </div>

        <div className="clinic-surface rounded-[2rem] p-6">
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(event) => setOnlyUnread(event.target.checked)}
              className="h-4 w-4"
            />
            Показывать только непрочитанные обращения
          </label>
        </div>

        {loading ? (
          <div className="clinic-surface rounded-[2rem] p-8 text-slate-600">
            Загрузка обращений...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-600">
            {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {feedback.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                Обращений нет.
              </div>
            ) : (
              feedback.map((item) => (
                <article
                  key={item.id}
                  className="clinic-surface rounded-[1.8rem] p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">
                        {item.subject}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.name} · {item.email}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleRead(item.id, !item.isRead)}
                      disabled={savingId === item.id}
                      className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                        item.isRead
                          ? "border border-slate-200 bg-white text-slate-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.isRead ? "Отметить непрочитанным" : "Отметить прочитанным"}
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {item.message}
                  </p>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}

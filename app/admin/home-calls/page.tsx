"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context";

type HomeCallStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type HomeCallItem = {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  doctor: string;
  date: string;
  time: string;
  status: HomeCallStatus;
  createdAt: string;
};

const STATUSES: HomeCallStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

function localStatus(status: HomeCallStatus) {
  if (status === "PENDING") return "Новая заявка";
  if (status === "CONFIRMED") return "Подтверждено";
  if (status === "COMPLETED") return "Завершено";
  return "Отменено";
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

export default function AdminHomeCallsPage() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<HomeCallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const token =
      typeof window === "undefined" ? null : localStorage.getItem("token");

    if (!token) {
      setError("Нужна авторизация администратора");
      setLoading(false);
      return;
    }

    fetch("/api/admin/home-calls", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Не удалось загрузить вызовы");
        }

        return res.json() as Promise<HomeCallItem[]>;
      })
      .then((items) => {
        setCalls(items);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки вызовов",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: number, status: HomeCallStatus) {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/home-calls/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Не удалось обновить статус");
      }

      const updated = (await res.json()) as HomeCallItem;
      setCalls((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка обновления статуса");
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
          <div className="clinic-kicker">Админка · вызовы на дом</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Управление вызовами на дом
          </h1>
          <Link href="/admin" className="clinic-btn-ghost mt-6">
            Назад в админку
          </Link>
        </div>

        {loading ? (
          <div className="clinic-surface rounded-[2rem] p-8 text-slate-600">
            Загрузка вызовов...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-600">
            {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {calls.map((call) => (
              <article
                key={call.id}
                className="clinic-surface rounded-[1.8rem] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      {call.fullName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {call.doctor} · {call.date} {call.time}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {call.phone} · {call.address}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Создано: {formatDateTime(call.createdAt)}
                    </p>
                  </div>

                  <div className="min-w-56">
                    <label className="mb-2 block text-sm text-slate-600">
                      Статус
                    </label>
                    <select
                      title="Статус вызова"
                      value={call.status}
                      disabled={savingId === call.id}
                      onChange={(event) =>
                        updateStatus(
                          call.id,
                          event.target.value as HomeCallStatus,
                        )
                      }
                      className="clinic-input w-full"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {localStatus(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

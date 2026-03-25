"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context";

type OverviewPayload = {
  stats: {
    doctors: number;
    patients: number;
    appointments: number;
    homeCalls: number;
    unreadFeedback: number;
    pharmacyOrders: number;
  };
  recentHomeCalls: Array<{
    id: number;
    fullName: string;
    doctor: string;
    date: string;
    time: string;
    status: string;
    createdAt: string;
  }>;
  recentFeedback: Array<{
    id: number;
    name: string;
    subject: string;
    isRead: boolean;
    createdAt: string;
  }>;
};

const tabs = [
  { href: "/admin/doctors", label: "Доктора", hint: "Список и редактирование" },
  { href: "/admin/schedule", label: "Расписания", hint: "Сетка рабочих слотов" },
  { href: "/admin/patients", label: "Пациенты", hint: "Просмотр базы пациентов" },
  { href: "/admin/home-calls", label: "Вызовы на дом", hint: "Заявки и статусы" },
  { href: "/admin/feedback", label: "Обращения", hint: "Сообщения с сайта" },
  { href: "/admin/pharmacy", label: "Аптека", hint: "Заказы и модерация отзывов" },
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Admin() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window === "undefined" ? null : localStorage.getItem("token");

    if (!token) {
      setError("Нужна авторизация администратора");
      setLoading(false);
      return;
    }

    fetch("/api/admin/overview", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Не удалось загрузить сводку");
        }

        return res.json() as Promise<OverviewPayload>;
      })
      .then((payload) => {
        setOverview(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки админки",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== "ADMIN") {
    return (
      <main className="clinic-shell">
        <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
          <div className="clinic-surface rounded-4xl p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-950">
              Раздел администратора
            </h1>
            <p className="mt-3 text-slate-600">
              Доступ к панели управления открыт только пользователю с ролью
              администратора.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Административный раздел</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Управление поликлиникой
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Сводка по пациентам, врачам, вызовам на дом, обращениям и аптеке в
            одном рабочем пространстве.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="clinic-surface rounded-[1.8rem] p-6 text-slate-950 transition hover:-translate-y-1"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-800">
                Раздел
              </div>
              <div className="mt-3 text-2xl font-bold">{tab.label}</div>
              <div className="mt-2 text-sm text-slate-500">{tab.hint}</div>
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="clinic-surface mt-8 rounded-[2rem] p-8 text-slate-600">
            Загрузка сводки...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-600">
            {error}
          </div>
        ) : overview ? (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Врачи" value={overview.stats.doctors} />
              <StatCard label="Пациенты" value={overview.stats.patients} />
              <StatCard label="Талоны" value={overview.stats.appointments} />
              <StatCard label="Вызовы на дом" value={overview.stats.homeCalls} />
              <StatCard
                label="Непрочитанные обращения"
                value={overview.stats.unreadFeedback}
              />
              <StatCard
                label="Заказы аптеки"
                value={overview.stats.pharmacyOrders}
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <section className="clinic-surface rounded-[2rem] p-6">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Последние вызовы на дом
                </h2>
                <div className="mt-6 space-y-3">
                  {overview.recentHomeCalls.length === 0 ? (
                    <EmptyState text="Новых вызовов нет" />
                  ) : (
                    overview.recentHomeCalls.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.4rem] border border-slate-200 bg-white p-4"
                      >
                        <div className="font-semibold text-slate-950">
                          {item.fullName}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {item.doctor} · {item.date} {item.time}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          Создан: {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="clinic-surface rounded-[2rem] p-6">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Последние обращения
                </h2>
                <div className="mt-6 space-y-3">
                  {overview.recentFeedback.length === 0 ? (
                    <EmptyState text="Сообщений пока нет" />
                  ) : (
                    overview.recentFeedback.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.4rem] border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold text-slate-950">
                            {item.name}
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              item.isRead
                                ? "bg-slate-100 text-slate-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.isRead ? "Прочитано" : "Новое"}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {item.subject}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="clinic-surface rounded-[1.6rem] p-5">
      <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 text-4xl font-extrabold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
      {text}
    </div>
  );
}

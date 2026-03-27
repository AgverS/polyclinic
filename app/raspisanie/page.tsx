"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ScheduleDoctor = {
  name: string;
  specialties: string[];
  room: number | null;
  days: string[];
  time: string;
  status: "busy" | "available";
  exp: number;
};

function statusLabel(status: ScheduleDoctor["status"]) {
  return status === "available" ? "Есть свободные окна" : "Все окна заняты";
}

export default function SchedulePage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [items, setItems] = useState<ScheduleDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/specialty")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<Array<{ name: string }>>;
      })
      .then((data) => setSpecialties(data.map((item) => item.name)))
      .catch(() => setSpecialties([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (specialty) params.set("specialty", specialty);

    fetch(`/api/schedule/public?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить расписание");
        return res.json() as Promise<ScheduleDoctor[]>;
      })
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setItems([]);
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось загрузить расписание",
        );
      })
      .finally(() => setLoading(false));
  }, [search, specialty]);

  const availableCount = useMemo(
    () => items.filter((item) => item.status === "available").length,
    [items],
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_24%),linear-gradient(180deg,#081223_0%,#11233E_34%,#F3F7FB_34%,#F8FAFC_100%)]">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#0E1A33]/92 p-8 text-white shadow-2xl shadow-slate-950/20">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
                Публичное расписание врачей
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Найдите врача и выберите удобное время для записи
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Показаны ближайшие доступные рабочие дни и временные интервалы.
              </p>
            </div>

            <div className="grid min-w-65 gap-4 sm:grid-cols-2">
              <StatCard label="Найдено врачей" value={String(items.length)} />
              <StatCard
                label="Свободные к записи"
                value={String(availableCount)}
              />
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-4xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_auto]">
            <input
              value={search}
              onChange={(event) => {
                setLoading(true);
                setSearch(event.target.value);
              }}
              placeholder="Поиск по врачу"
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-400 focus:bg-white"
            />

            <select
              title="Специальность"
              value={specialty}
              onChange={(event) => {
                setLoading(true);
                setSpecialty(event.target.value);
              }}
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="">Все специальности</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <Link
              href="/online-appointment"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white! transition hover:bg-slate-800"
            >
              Заказать талон
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Загружаем расписание...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-600">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              По заданным параметрам расписание не найдено.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {items.map((item) => (
                <article
                  key={`${item.name}-${item.room}-${item.time}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.specialties.join(", ")}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <InfoRow label="Кабинет" value={String(item.room ?? "—")} />
                    <InfoRow label="Стаж" value={`${item.exp} лет`} />
                    <InfoRow label="Дни" value={item.days.join(", ")} />
                    <InfoRow label="Время" value={item.time} />
                  </dl>

                  <div className="mt-5">
                    <Link
                      href="/online-appointment"
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
                    >
                      Перейти к записи
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
    </div>
  );
}

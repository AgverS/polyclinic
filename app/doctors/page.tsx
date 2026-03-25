"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import type { DoctorCategory, FullDoctor } from "@/lib/types";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<FullDoctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [category, setCategory] = useState<DoctorCategory | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<
    "all" | "pediatric" | "highest" | "experience"
  >("all");

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/doctors", {
          params: {
            search: search || undefined,
            specialty: specialty || undefined,
            category: category || undefined,
            quickFilter: quickFilter !== "all" ? quickFilter : undefined,
          },
        });

        setDoctors(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load doctors", err);
        setDoctors([]);
        setError("Не удалось загрузить список врачей");
      } finally {
        setLoading(false);
      }
    };

    void fetchDoctors();
  }, [search, specialty, category, quickFilter]);

  const humanizeCategory = (c: DoctorCategory) => {
    if (c === "FIRST") return "Первая";
    if (c === "SECOND") return "Вторая";
    if (c === "HIGHEST") return "Высшая";
  };

  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="clinic-hero rounded-4xl p-8 text-white sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <div className="clinic-kicker">Врачи и специальности</div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Выберите врача по имени, профилю или категории
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Актуальный список специалистов с быстрым переходом к записи на
                прием.
              </p>
            </div>
            <Link href="/online-appointment" className="clinic-btn-accent">
              Записаться
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
        <div className="clinic-surface rounded-4xl p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              className="clinic-input"
              placeholder="Поиск по врачу"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              className="clinic-input"
              placeholder="Специальность"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />

            <select
              title="Категория"
              className="clinic-input"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as DoctorCategory | "")
              }
            >
              <option value="">Все категории</option>
              <option value="HIGHEST">Высшая</option>
              <option value="FIRST">Первая</option>
              <option value="SECOND">Вторая</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", "Все"],
              ["pediatric", "Детские"],
              ["highest", "Высшая категория"],
              ["experience", "Опыт 10+ лет"],
            ].map(([key, label]) => (
              <button
                key={key}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setQuickFilter(key as any)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  quickFilter === key
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading && (
              <div className="col-span-full rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-gray-500">
                Загрузка врачей...
              </div>
            )}

            {!loading && error && (
              <div className="col-span-full rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && doctors.length === 0 && (
              <div className="col-span-full rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-gray-500">
                Врачи не найдены
              </div>
            )}

            {!loading &&
              !error &&
              doctors.map((d) => (
                <div
                  key={d.id}
                  className="clinic-card rounded-[1.6rem] p-6 space-y-3"
                >
                  <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
                    Врач
                  </div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {d.user.fullName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {d.doctorSpecialties
                      .map((s) => s.specialty.name)
                      .join(", ")}
                  </p>
                  <div className="text-sm text-slate-700">
                    Категория: {humanizeCategory(d.category)}
                  </div>
                  <div className="text-sm text-slate-700">
                    Опыт: {d.experience} лет
                  </div>
                  <Link
                    href="/online-appointment"
                    className="mt-4 inline-flex rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Перейти к записи
                  </Link>
                </div>
              ))}
          </section>
        </div>
      </section>
    </main>
  );
}

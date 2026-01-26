"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FullDoctor } from "@/lib/types";
import { DoctorCategory } from "@/lib/generated/prisma";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<FullDoctor[]>([]);

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [category, setCategory] = useState<DoctorCategory | "">("");
  const [quickFilter, setQuickFilter] = useState<
    "all" | "pediatric" | "highest" | "experience"
  >("all");

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await axios.get("/api/doctors", {
        params: {
          search: search || undefined,
          specialty: specialty || undefined,
          category: category || undefined,
          quickFilter: quickFilter !== "all" ? quickFilter : undefined,
        },
      });

      setDoctors(res.data);
    };

    fetchDoctors();
  }, [search, specialty, category, quickFilter]);

  const humanizeCategory = (c: DoctorCategory) => {
    if (c === "FIRST") return "Первая";
    if (c === "SECOND") return "Вторая";
    if (c === "HIGHEST") return "Высшая";
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Наши врачи</h1>
        <Link
          href="/online-appointment"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Записаться
        </Link>
      </header>

      {/* FILTERS */}
      <section className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            className="border rounded-lg px-4 py-3"
            placeholder="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            className="border rounded-lg px-4 py-3"
            placeholder="Специальность"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />

          <select
            title="Категория"
            className="border rounded-lg px-4 py-3"
            value={category}
            onChange={(e) => setCategory(e.target.value as DoctorCategory | "")}
          >
            <option value="">Все категории</option>
            <option value="HIGHEST">Высшая</option>
            <option value="FIRST">Первая</option>
            <option value="SECOND">Вторая</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
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
              className={`px-4 py-2 rounded-full border ${
                quickFilter === key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* DOCTORS */}
      <section className="grid md:grid-cols-3 gap-6">
        {doctors.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            Врачи не найдены
          </div>
        )}

        {doctors.map((d) => (
          <div key={d.id} className="bg-white p-6 rounded-xl shadow space-y-2">
            <h3 className="text-lg font-semibold">{d.user.fullName}</h3>
            <p className="text-gray-500">
              {d.doctorSpecialties.map((s) => s.specialty.name).join(", ")}
            </p>
            <div>Категория: {humanizeCategory(d.category)}</div>
            <div>Опыт: {d.experience} лет</div>
          </div>
        ))}
      </section>
    </main>
  );
}

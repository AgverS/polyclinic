"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FullDoctor } from "@/lib/types";
import axios from "axios";
import { DoctorCategory } from "@/lib/generated/prisma";

/*
  TODO (потом):
  Заменить mockDoctors на fetch("/api/doctors")
*/

// type Doctor = {
//   id: number;
//   fullName: string;
//   specialties: string[];
//   category: "Высшая" | "Первая" | "Вторая";
//   experience: number;
//   rating: number;
//   isPediatric: boolean;
//   availableToday: boolean;
// };

// const mockDoctors: Doctor[] = [
//   {
//     id: 1,
//     fullName: "Иванов Иван Иванович",
//     specialties: ["Терапевт"],
//     category: "Высшая",
//     experience: 15,
//     rating: 4.9,
//     isPediatric: false,
//     availableToday: true,
//   },
//   {
//     id: 2,
//     fullName: "Петрова Анна Сергеевна",
//     specialties: ["Педиатр"],
//     category: "Первая",
//     experience: 11,
//     rating: 4.7,
//     isPediatric: true,
//     availableToday: false,
//   },
// ];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [category, setCategory] = useState("");
  const [quickFilter, setQuickFilter] = useState<
    "all" | "available" | "pediatric" | "highest" | "experience"
  >("all");
  const [doctors, setDoctors] = useState<FullDoctor[]>([]);

  // const filteredDoctors = useMemo(() => {
  //   return doctors.filter((d) => {
  //     if (
  //       search &&
  //       !`${d.fullName} ${d.specialties.join(" ")}`
  //         .toLowerCase()
  //         .includes(search.toLowerCase())
  //     )
  //       return false;

  //     if (specialty && !d.specialties.includes(specialty)) return false;
  //     if (category && d.category !== category) return false;

  //     // if (quickFilter === "available" && !d.availableToday) return false;
  //     if (quickFilter === "pediatric" && !d.isPediatric) return false;
  //     if (quickFilter === "highest" && d.category !== "Высшая") return false;
  //     if (quickFilter === "experience" && d.experience < 10) return false;

  //     return true;
  //   });
  // }, [search, specialty, category, quickFilter, doctors]);

  const humanizeCategory = (category: DoctorCategory) => {
    switch (category) {
      case "FIRST":
        return "Первая";
      case "SECOND":
        return "Вторая";
      case "HIGHEST":
        return "Высшая";
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get("api/doctors");
      setDoctors(res.data);
    };
    fetch();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Наши врачи</h1>
          <p className="text-gray-500">
            Квалифицированные специалисты с многолетним опытом работы
          </p>
        </div>

        <Link
          href="/online-appointment"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Записаться на прием
        </Link>
      </header>

      {/* STATS */}
      <section className="grid md:grid-cols-4 gap-4">
        <Stat value="58" label="Врачей" />
        <Stat value="15" label="Направлений" />
        <Stat value="285+" label="Лет опыта" />
        <Stat value="4.8" label="Средний рейтинг" />
      </section>

      {/* FILTERS */}
      <section className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            className="border rounded-lg px-4 py-3"
            placeholder="Поиск врача или специальности"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            title="123"
            className="border rounded-lg px-4 py-3"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">Все специальности</option>
            <option value="Терапевт">Терапевт</option>
            <option value="Педиатр">Педиатр</option>

            {/* TODO:
              Заполнять список специальностей с бэка
            */}
          </select>

          <select
            title="123"
            className="border rounded-lg px-4 py-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Все категории</option>
            <option value="Высшая">Высшая</option>
            <option value="Первая">Первая</option>
            <option value="Вторая">Вторая</option>
          </select>
        </div>

        {/* QUICK FILTERS */}
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "Все врачи"],
            ["available", "Свободные сегодня"],
            ["pediatric", "Детские врачи"],
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

      {/* DOCTORS GRID */}
      <section className="grid md:grid-cols-3 gap-6">
        {doctors.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            Врачи по вашему запросу не найдены
          </div>
        )}

        {doctors.map((d) => (
          <div key={d.id} className="bg-white p-6 rounded-xl shadow space-y-3">
            <h3 className="text-lg font-semibold">{d.user.fullName}</h3>
            <p className="text-gray-500">
              {d.doctorSpecialties.map((el) => el.specialty.name).join(", ")}
            </p>

            <div className="text-sm">
              Категория: {humanizeCategory(d.category)}
            </div>
            <div className="text-sm">Опыт: {d.experience} лет</div>

            <div
              className={`text-sm font-medium ${
                true ? "text-green-600" : "text-gray-400"
              }`}
            >
              {true ? "Свободен сегодня" : "Нет свободных окон"}
            </div>

            <Link
              href={`/online-appointment?doctorId=${d.id}`}
              className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Записаться
            </Link>

            {/* TODO:
              /online-appointment должен принимать doctorId
              и подставлять врача автоматически
            */}
          </div>
        ))}
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <div className="text-3xl font-bold text-blue-600">{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  );
}

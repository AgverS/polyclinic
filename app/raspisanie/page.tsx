"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* =========================
   TYPES
========================= */

type ScheduleDoctor = {
  name: string;
  specialty: string;
  room: number;
  days: string[];
  time: string;
  status: "available" | "busy";
  exp: number;
};

type ScheduleFiltersProps = {
  search: string;
  specialty: string;
  day: string;
  time: string;
  setSearch: (v: string) => void;
  setSpecialty: (v: string) => void;
  setDay: (v: string) => void;
  setTime: (v: string) => void;
};

type ScheduleTableProps = {
  doctors: ScheduleDoctor[];
  loading: boolean;
};

/* =========================
   PAGE
========================= */

export default function SchedulePage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const [doctors, setDoctors] = useState<ScheduleDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/schedule?search=${search}&specialty=${specialty}&day=${day}`
        );
        const data: ScheduleDoctor[] = await res.json();

        if (!cancelled) {
          setDoctors(data);
        }
      } catch {
        if (!cancelled) {
          setDoctors([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [search, specialty, day]);

  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <ScheduleHero />

      <section className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <ScheduleFilters
          search={search}
          specialty={specialty}
          day={day}
          time={time}
          setSearch={setSearch}
          setSpecialty={setSpecialty}
          setDay={setDay}
          setTime={setTime}
        />

        <ScheduleTable doctors={doctors} loading={loading} />

        <div className="text-center pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </section>
    </main>
  );
}

/* =========================
   HERO
========================= */

function ScheduleHero() {
  return (
    <section className="h-70 bg-linear-to-r from-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Расписание приёма врачей</h1>
        <p className="text-gray-200 max-w-3xl">
          Актуальное расписание специалистов поликлиники
        </p>
      </div>
    </section>
  );
}

/* =========================
   FILTERS
========================= */

function ScheduleFilters({
  search,
  specialty,
  day,
  setSearch,
  setSpecialty,
  setDay,
}: ScheduleFiltersProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по врачу"
        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
      />

      <select
        title="123"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
      >
        <option value="">Все специальности</option>
        <option value="Терапевт">Терапевт</option>
        <option value="Педиатр">Педиатр</option>
        <option value="Кардиолог">Кардиолог</option>
      </select>

      <select
        title="123"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
      >
        <option value="">Все дни</option>
        <option value="Пн">Пн</option>
        <option value="Вт">Вт</option>
        <option value="Ср">Ср</option>
        <option value="Чт">Чт</option>
        <option value="Пт">Пт</option>
      </select>
    </div>
  );
}

/* =========================
   TABLE
========================= */

function ScheduleTable({ doctors, loading }: ScheduleTableProps) {
  if (loading) {
    return (
      <div className="text-center p-8 text-gray-400">
        Загрузка расписания...
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="text-center p-8 text-gray-400">Врачи не найдены</div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-white/10">
          <tr>
            <th className="p-4 text-left">Врач</th>
            <th className="p-4">Специальность</th>
            <th className="p-4">Кабинет</th>
            <th className="p-4">Дни</th>
            <th className="p-4">Время</th>
            <th className="p-4">Статус</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d.name} className="border-t border-white/10">
              <td className="p-4">
                <div className="font-semibold">{d.name}</div>
                <div className="text-xs text-gray-400">Стаж: {d.exp} лет</div>
              </td>
              <td className="p-4">{d.specialty}</td>
              <td className="p-4">{d.room}</td>
              <td className="p-4">{d.days.join(", ")}</td>
              <td className="p-4">{d.time}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    d.status === "available"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {d.status === "available" ? "Свободно" : "Занято"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

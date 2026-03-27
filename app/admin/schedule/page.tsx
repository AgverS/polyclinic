"use client";
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Doctor = {
  id: number;
  user: {
    fullName: string;
  };
};

type SlotKey = `${string}_${string}`;

const days = [
  { key: "mon", label: "Пн" },
  { key: "tue", label: "Вт" },
  { key: "wed", label: "Ср" },
  { key: "thu", label: "Чт" },
  { key: "fri", label: "Пт" },
];

function generateTimes() {
  const times: string[] = [];
  let h = 9;
  let m = 0;

  while (h < 17) {
    times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m === 60) {
      h++;
      m = 0;
    }
  }

  return times;
}

function getNextMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toSlotKey(value: string) {
  const date = new Date(value);
  const weekStart = getNextMonday();
  const diffDays = Math.round(
    (date.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
  );

  const dayMap: Record<number, string> = {
    0: "mon",
    1: "tue",
    2: "wed",
    3: "thu",
    4: "fri",
  };

  const dayKey = dayMap[diffDays];
  if (!dayKey) return null;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${dayKey}_${hours}:${minutes}` as SlotKey;
}

function AdminScheduleContent() {
  const searchParams = useSearchParams();
  const initialDoctorId = (() => {
    const doctorIdParam = searchParams.get("doctorId");
    const parsed = Number(doctorIdParam);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : "";
  })();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(
    initialDoctorId !== "",
  );
  const [doctorId, setDoctorId] = useState<number | "">(initialDoctorId);
  const [schedule, setSchedule] = useState<Set<SlotKey>>(new Set());
  const [saved, setSaved] = useState(false);

  const times = useMemo(() => generateTimes(), []);

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки врачей");
        return res.json();
      })
      .then((data) => setDoctors(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!doctorId) {
      return;
    }

    fetch(`/api/schedule?doctorId=${doctorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить расписание");
        return res.json() as Promise<
          Array<{ startDateTime: string; endDateTime: string }>
        >;
      })
      .then((data) => {
        const next = new Set<SlotKey>();

        for (const slot of data) {
          const key = toSlotKey(slot.startDateTime);
          if (key) next.add(key);
        }

        setSchedule(next);
      })
      .catch(() => {
        setSchedule(new Set());
      })
      .finally(() => setScheduleLoading(false));
  }, [doctorId]);

  function toggle(day: string, time: string) {
    if (!doctorId) return;

    const key: SlotKey = `${day}_${time}`;

    setSchedule((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

    setSaved(false);
  }

  async function saveSchedule() {
    if (!doctorId) return;

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        slots: Array.from(schedule),
      }),
    });

    if (!res.ok) {
      alert("Не удалось сохранить расписание");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-8">
        <div className="clinic-hero rounded-4xl p-8 text-white sm:p-10">
          <div className="clinic-kicker">Админка · расписание</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Расписание врачей
          </h1>
        </div>

        <div className="clinic-surface rounded-4xl p-6">
          <div className="flex max-w-5xl flex-wrap items-end gap-6">
            <div className="w-72">
              <label className="mb-2 block text-sm text-slate-600">Врач</label>
              <select
                title="Doctors"
                value={doctorId}
                disabled={loading}
                onChange={(e) => {
                  const nextDoctorId = e.target.value
                    ? Number(e.target.value)
                    : "";
                  setScheduleLoading(nextDoctorId !== "");
                  setDoctorId(nextDoctorId);
                  setSaved(false);
                }}
                className="clinic-input w-full"
              >
                <option value="">
                  {loading ? "Загрузка..." : "Выберите врача"}
                </option>

                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={saveSchedule}
              disabled={!doctorId}
              className={`rounded-2xl px-8 py-3 font-semibold transition ${
                doctorId
                  ? "bg-(--clinic-navy) text-white hover:bg-[#122547]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Сохранить расписание
            </button>

            {saved && (
              <span className="font-medium text-emerald-600">
                ✔ Расписание сохранено
              </span>
            )}
            {scheduleLoading && (
              <span className="font-medium text-slate-500">
                Загрузка слотов...
              </span>
            )}
          </div>
        </div>

        {doctorId ? (
          <div className="clinic-surface overflow-x-auto rounded-4xl p-6">
            <table className="border-collapse text-slate-700">
              <thead>
                <tr>
                  <th className="pr-4"></th>
                  {times.map((t) => (
                    <th key={t} className="px-2 py-1 text-xs text-slate-400">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {days.map((d) => (
                  <tr key={d.key}>
                    <td className="pr-4 font-semibold">{d.label}</td>
                    {times.map((t) => {
                      const active = schedule.has(`${d.key}_${t}`);

                      return (
                        <td key={t}>
                          <button
                            onClick={() => toggle(d.key, t)}
                            className={`h-6 w-6 rounded transition ${
                              active
                                ? "bg-(--clinic-navy)"
                                : "bg-slate-200 hover:bg-slate-300"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">
            Выберите врача, чтобы редактировать расписание.
          </p>
        )}
      </section>
    </main>
  );
}

export default function AdminSchedulePage() {
  return (
    <Suspense
      fallback={
        <main className="clinic-shell px-6 py-12 sm:px-8">
          <div className="mx-auto max-w-6xl rounded-4xl bg-white/70 p-8 text-slate-600 shadow-xl">
            Загрузка...
          </div>
        </main>
      }
    >
      <AdminScheduleContent />
    </Suspense>
  );
}

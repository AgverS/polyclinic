/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect, useMemo, useState } from "react";

/* =====================
   TYPES
===================== */

type Doctor = {
  id: number;
  user: {
    fullName: string;
  };
};

type SlotKey = `${string}_${string}`;

/* =====================
   CONSTANTS
===================== */

const days = [
  { key: "mon", label: "Пн" },
  { key: "tue", label: "Вт" },
  { key: "wed", label: "Ср" },
  { key: "thu", label: "Чт" },
  { key: "fri", label: "Пт" },
];

/* =====================
   HELPERS
===================== */

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

/* =====================
   PAGE
===================== */

export default function AdminSchedulePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [doctorId, setDoctorId] = useState<number | "">("");
  const [schedule, setSchedule] = useState<Set<SlotKey>>(new Set());
  const [saved, setSaved] = useState(false);

  const times = useMemo(() => generateTimes(), []);

  /* =====================
     LOAD DOCTORS
  ===================== */

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки врачей");
        return res.json();
      })
      .then((data) => setDoctors(data))
      .finally(() => setLoading(false));
  }, []);

  /* =====================
     ACTIONS
  ===================== */

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

  /* =====================
     RENDER
  ===================== */

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 space-y-8">
      <h1 className="text-3xl font-bold">Расписание врачей</h1>

      <div className="flex flex-wrap gap-6 items-end max-w-5xl">
        <div className="w-72">
          <label className="block text-sm text-gray-300 mb-2">Врач</label>
          <select
            title="Doctors"
            value={doctorId}
            disabled={loading}
            onChange={(e) => {
              setDoctorId(e.target.value ? Number(e.target.value) : "");
              setSchedule(new Set());
              setSaved(false);
            }}
            className="w-full bg-white/10 px-4 py-3 rounded-lg"
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
          className={`px-8 py-3 rounded-lg font-semibold transition ${
            doctorId
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Сохранить расписание
        </button>

        {saved && (
          <span className="text-green-400 font-medium">
            ✔ Расписание сохранено
          </span>
        )}
      </div>

      {doctorId && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="pr-4"></th>
                {times.map((t) => (
                  <th key={t} className="px-2 py-1 text-xs text-gray-400">
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
                          className={`w-6 h-6 rounded transition ${
                            active
                              ? "bg-blue-600"
                              : "bg-white/10 hover:bg-white/20"
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
      )}

      {!doctorId && (
        <p className="text-gray-400">
          Выберите врача, чтобы редактировать расписание
        </p>
      )}
    </div>
  );
}

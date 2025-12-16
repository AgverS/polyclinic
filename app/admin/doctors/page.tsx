/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* =====================
   TYPES
===================== */

type Doctor = {
  id: number;
  fullName: string;
  specialty: string;
  room: number;
  experience: number;
};

const emptyDoctor: Omit<Doctor, "id"> = {
  fullName: "",
  specialty: "",
  room: 0,
  experience: 0,
};

/* =====================
   PAGE
===================== */

export default function AdminDoctorsPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<Omit<Doctor, "id">>(emptyDoctor);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // MOCK
    setDoctors([
      {
        id: 1,
        fullName: "Сычева Анна Романовна",
        specialty: "Педиатр",
        room: 7,
        experience: 0,
      },
    ]);
  }, []);

  /* =====================
     ACTIONS
  ===================== */

  function resetForm() {
    setForm(emptyDoctor);
    setEditingId(null);
  }

  function submitForm() {
    if (!form.fullName || !form.specialty) return;

    if (editingId === null) {
      setDoctors((prev) => [...prev, { id: Date.now(), ...form }]);
    } else {
      setDoctors((prev) =>
        prev.map((d) => (d.id === editingId ? { id: editingId, ...form } : d))
      );
    }

    resetForm();
  }

  function editDoctor(d: Doctor) {
    setEditingId(d.id);
    setForm({
      fullName: d.fullName,
      specialty: d.specialty,
      room: d.room,
      experience: d.experience,
    });
  }

  function deleteDoctor(id: number) {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  }

  function goToSchedule(id: number) {
    router.push(`/admin/schedule?doctorId=${id}`);
  }

  /* =====================
     RENDER
  ===================== */

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 space-y-10">
      <h1 className="text-3xl font-bold">Управление врачами</h1>

      {/* FORM */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6">
          {editingId ? "Редактировать врача" : "Добавить врача"}
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {/* ФИО */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              ФИО врача
            </label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-4 py-3"
              placeholder="Введите ФИО"
            />
          </div>

          {/* Специальность */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Специальность
            </label>
            <select
              title="123"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-4 py-3"
            >
              <option value="">Выберите</option>
              <option value="Педиатр">Педиатр</option>
              <option value="Терапевт">Терапевт</option>
              <option value="Кардиолог">Кардиолог</option>
              <option value="Невролог">Невролог</option>
            </select>
          </div>

          {/* Кабинет */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Номер кабинета
            </label>
            <input
              type="number"
              min={1}
              value={form.room}
              onChange={(e) =>
                setForm({ ...form, room: Number(e.target.value) })
              }
              className="w-full bg-white/10 rounded-lg px-4 py-3"
              placeholder="Напр. 205"
            />
          </div>

          {/* Стаж */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Стаж (лет)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    experience: Number(e.target.value),
                  })
                }
                className="w-full bg-white/10 rounded-lg px-4 py-3 pr-12"
                placeholder="Напр. 5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                лет
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={submitForm}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="bg-white/10 px-8 py-3 rounded-lg"
            >
              Отмена
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10">
            <tr>
              <th className="p-4">ФИО</th>
              <th className="p-4">Специальность</th>
              <th className="p-4">Кабинет</th>
              <th className="p-4">Стаж</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-t border-white/10">
                <td className="p-4">{d.fullName}</td>
                <td className="p-4">{d.specialty}</td>
                <td className="p-4">{d.room}</td>
                <td className="p-4">{d.experience} лет</td>
                <td className="p-4 text-right space-x-4">
                  <button
                    onClick={() => goToSchedule(d.id)}
                    className="text-blue-400 hover:underline"
                  >
                    Расписание
                  </button>
                  <button
                    onClick={() => editDoctor(d)}
                    className="text-blue-400 hover:underline"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => deleteDoctor(d.id)}
                    className="text-red-400 hover:underline"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

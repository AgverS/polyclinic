"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import { Specialty } from "@/lib/generated/prisma";
import { FullDoctor } from "@/lib/types";

/* =====================
   TYPES
===================== */

type FormSchema = {
  fullName: string;
  specialty: string;
  room: number;
  experience: number;
  email: string;
  password: string;
};

const emptyForm: FormSchema = {
  fullName: "",
  specialty: "",
  room: 0,
  experience: 0,
  email: "",
  password: "",
};

/* =====================
   PAGE
===================== */

export default function AdminDoctorsPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<FullDoctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [form, setForm] = useState<FormSchema>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /* =====================
     LOAD DATA (FIXED)
  ===================== */

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [doctorsRes, specialtiesRes] = await Promise.all([
          axios.get("/api/doctors"),
          axios.get("/api/specialty"),
        ]);

        if (!mounted) return;

        setDoctors(doctorsRes.data);
        setSpecialties(specialtiesRes.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================
     HELPERS
  ===================== */

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function isFormValid() {
    return (
      form.fullName.trim() &&
      form.email.trim() &&
      form.specialty.trim() &&
      form.room > 0 &&
      form.experience >= 0 &&
      (!editingId || form.password.trim())
    );
  }

  /* =====================
     ACTIONS
  ===================== */

  async function submitForm() {
    if (!isFormValid()) {
      alert("Заполните все поля");
      return;
    }

    if (editingId) {
      await axios.put("/api/doctors", { id: editingId, form });
    } else {
      await axios.post("/api/doctors", form);
    }

    const res = await axios.get("/api/doctors");
    setDoctors(res.data);
    resetForm();
  }

  function editDoctor(d: FullDoctor) {
    if (editingId === d.id) {
      resetForm();
      return;
    }

    setEditingId(d.id);
    setForm({
      fullName: d.user.fullName,
      email: d.user.email,
      specialty: d.doctorSpecialties[0]?.specialty.name ?? "",
      room: d.room,
      experience: d.experience,
      password: "",
    });
  }

  async function deleteDoctor(id: number) {
    if (!confirm("Удалить врача?")) return;
    await axios.delete("/api/doctors", { data: { id } });
    const res = await axios.get("/api/doctors");
    setDoctors(res.data);
  }

  function goToSchedule(id: number) {
    router.push(`/admin/schedule?doctorId=${id}`);
  }

  /* =====================
     RENDER
  ===================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-10">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 space-y-10">
      <h1 className="text-3xl font-bold">Управление врачами</h1>

      {/* FORM */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6">
          {editingId ? "Редактировать врача" : "Добавить врача"}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <InputBlock
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />

          <InputBlock
            label="Пароль врача"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            placeholder={editingId ? "Оставьте пустым" : "Введите пароль"}
          />

          <InputBlock
            label="ФИО врача"
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
          />

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Специальность
            </label>
            <Select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              options={specialties.map((s) => s.name)}
              title="Специальность"
            />
          </div>

          <InputBlock
            label="Кабинет"
            type="number"
            value={form.room}
            onChange={(v) => setForm({ ...form, room: Number(v) })}
          />

          <InputBlock
            label="Стаж (лет)"
            type="number"
            value={form.experience}
            onChange={(v) => setForm({ ...form, experience: Number(v) })}
          />
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
                <td className="p-4">{d.user.fullName}</td>
                <td className="p-4">
                  {d.doctorSpecialties[0]?.specialty.name}
                </td>
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
                    {editingId === d.id ? "Отменить" : "Редактировать"}
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

/* =====================
   INPUT BLOCK
===================== */

function InputBlock({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 rounded-lg px-4 py-3"
      />
    </div>
  );
}

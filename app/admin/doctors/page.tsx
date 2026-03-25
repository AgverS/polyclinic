"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import type { FullDoctor, SpecialtyModel } from "@/lib/types";

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

export default function AdminDoctorsPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<FullDoctor[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyModel[]>([]);
  const [form, setForm] = useState<FormSchema>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function reloadDoctors() {
    const res = await axios.get("/api/doctors");
    setDoctors(res.data);
  }

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

    await reloadDoctors();
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
    await reloadDoctors();
  }

  function goToSchedule(id: number) {
    router.push(`/admin/schedule?doctorId=${id}`);
  }

  if (loading) {
    return (
      <main className="clinic-shell px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-white/70 p-8 text-slate-600 shadow-xl">
          Загрузка...
        </div>
      </main>
    );
  }

  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Админка · врачи</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Управление врачами
          </h1>
        </div>

        <div className="clinic-surface rounded-[2rem] p-8 max-w-6xl">
          <h2 className="mb-6 text-2xl font-semibold text-slate-950">
            {editingId ? "Редактировать врача" : "Добавить врача"}
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
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
              <label className="mb-1 block text-sm text-slate-600">
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
            <button onClick={submitForm} className="clinic-btn-primary">
              {editingId ? "Сохранить" : "Добавить"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-8 py-3 font-semibold text-slate-900"
              >
                Отмена
              </button>
            )}
          </div>
        </div>

        <div className="clinic-surface overflow-hidden rounded-[2rem]">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-50">
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
                <tr key={d.id} className="border-t border-slate-200">
                  <td className="p-4">{d.user.fullName}</td>
                  <td className="p-4">
                    {d.doctorSpecialties[0]?.specialty.name}
                  </td>
                  <td className="p-4">{d.room}</td>
                  <td className="p-4">{d.experience} лет</td>
                  <td className="p-4 text-right space-x-4">
                    <button
                      onClick={() => goToSchedule(d.id)}
                      className="font-medium text-cyan-700 hover:underline"
                    >
                      Расписание
                    </button>
                    <button
                      onClick={() => editDoctor(d)}
                      className="font-medium text-slate-700 hover:underline"
                    >
                      {editingId === d.id ? "Отменить" : "Редактировать"}
                    </button>
                    <button
                      onClick={() => deleteDoctor(d.id)}
                      className="font-medium text-rose-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

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
      <label className="mb-1 block text-sm text-slate-600">{label}</label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

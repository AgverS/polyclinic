"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import { Doctor, Specialty, User } from "@/lib/generated/prisma";
import { FullDoctor } from "@/lib/types";

export type FormSchema = {
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
  const [form, setForm] = useState<FormSchema>(emptyForm);
  const [editing, setEditing] = useState<Doctor | null>(null);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    async function fetchSpecialties() {
      const res = await axios.get("/api/specialty");
      setSpecialties(res.data);
    }
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    const res = await axios.get("/api/doctors");
    setDoctors(res.data);
  };

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get("/api/doctors");
      const data = res.data;
      console.log(data);
      setDoctors(data);
    };
    fetch();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
  }

  function isFormValid(form: FormSchema) {
    return (
      form.fullName.trim() !== "" &&
      form.email.trim() !== "" &&
      form.password.trim() !== "" &&
      form.specialty.trim() !== "" &&
      form.room > 0 &&
      form.experience >= 0
    );
  }

  async function submitForm() {
    if (!isFormValid(form)) {
      alert("Заполните все поля");
      return;
    }
    if (!!editing) {
      await axios.put("/api/doctors", { form, id: editing.id });
      fetchDoctors();
    } else {
      await axios.post("/api/doctors", form);
      fetchDoctors();
    }

    resetForm();
  }

  async function editDoctor(d: Doctor) {
    if (!!editing && editing.id == d.id) {
      resetForm();
      return;
    }
    const resUser = await axios.get(`/api/user/${d.userId}`);
    const user: User = resUser.data;
    const resSpecialty = await axios.get(`/api/specialty/${d.id}`);
    const specialty: Specialty = resSpecialty.data;
    setEditing(d);
    setForm({
      email: user.email,
      fullName: user.fullName,
      specialty: specialty.name,
      experience: d.experience,
      password: "",
      room: d.room,
    });
  }

  function deleteDoctor(id: number) {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  }

  function goToSchedule(id: number) {
    router.push(`/admin/schedule?doctorId=${id}`);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 space-y-10">
      <h1 className="text-3xl font-bold">Управление врачами</h1>

      {/* FORM */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6">
          {editing ? "Редактировать врача" : "Добавить врача"}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-4 py-3"
              placeholder="example@gmail.com"
              required
            />
          </div>

          {/* Пароль */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Пароль врача
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-4 py-3"
              placeholder="Введите пароль"
              required
            />
          </div>

          {/* ФИО */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              ФИО врача
            </label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-4 py-3"
              placeholder="Введите ФИО"
              required
            />
          </div>

          {/* Специальность */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Специальность
            </label>
            <Select
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              options={specialties.map((s) => s.name)}
              title="Специальность"
              required
            />
          </div>

          {/* Кабинет */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Номер кабинета
            </label>
            <Input
              type="number"
              min={1}
              value={form.room}
              onChange={(e) => {
                if (e.currentTarget.value.length > 3) return;
                setForm({ ...form, room: Number(e.target.value) });
              }}
              className="w-full bg-white/10 rounded-lg px-4 py-3"
              placeholder="Напр. 205"
              required
            />
          </div>

          {/* Стаж */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Стаж (лет)
            </label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={99}
                value={form.experience}
                onChange={(e) => {
                  if (e.currentTarget.value.length > 2) return;
                  setForm({
                    ...form,
                    experience: Number(e.target.value),
                  });
                }}
                className="w-full bg-white/10 rounded-lg px-4 py-3 pr-12"
                placeholder="Напр. 5"
                required
              />
              <span className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400">
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
            {editing ? "Сохранить" : "Добавить"}
          </button>

          {editing && (
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
                <td className="p-4">{d.doctorSpecialties[0].specialty.name}</td>
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
                    {!!editing && editing === d ? "Отменить" : "Редактировать"}
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

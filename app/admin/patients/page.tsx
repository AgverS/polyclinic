"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context";

type Patient = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPatients() {
    const token =
      typeof window === "undefined" ? null : localStorage.getItem("token");

    if (!token) {
      throw new Error("Нужна авторизация администратора");
    }

    const res = await fetch("/api/admin/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.message || "Не удалось загрузить пациентов");
    }

    return (await res.json()) as Patient[];
  }

  useEffect(() => {
    loadPatients()
      .then((items) => {
        setPatients(items);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ошибка загрузки пациентов",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function removePatient(id: number) {
    if (!confirm("Удалить пациента?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`/api/admin/patients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      alert(payload?.message || "Не удалось удалить пациента");
      return;
    }

    setPatients((current) => current.filter((item) => item.id !== id));
  }

  if (user?.role !== "ADMIN") {
    return (
      <main className="clinic-shell px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl bg-white/80 p-8 text-center shadow-xl">
          Доступ открыт только администратору.
        </div>
      </main>
    );
  }

  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Админка · пациенты</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            База пациентов
          </h1>
          <Link href="/admin" className="clinic-btn-ghost mt-6">
            Назад в админку
          </Link>
        </div>

        {loading ? (
          <div className="clinic-surface rounded-[2rem] p-8 text-slate-600">
            Загрузка пациентов...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-600">
            {error}
          </div>
        ) : (
          <div className="clinic-surface overflow-hidden rounded-[2rem]">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">ФИО</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Зарегистрирован</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-t border-slate-200">
                    <td className="p-4">{patient.fullName}</td>
                    <td className="p-4">{patient.email}</td>
                    <td className="p-4">{formatDateTime(patient.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => removePatient(patient.id)}
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
        )}
      </section>
    </main>
  );
}

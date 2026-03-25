"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/lib/context";
import {
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  normalizeEmail,
  normalizeFullName,
} from "@/lib/validation/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setLogin] = useState("");
  const [fullName, setName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedEmail = normalizeEmail(email);
    const normalizedFullName = normalizeFullName(fullName);

    if (!normalizedEmail || !normalizedFullName || !password) {
      setError("Заполните все поля");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Некорректный формат email");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`,
      );
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/register", {
        email: normalizedEmail,
        fullName: normalizedFullName,
        password,
      });

      const token: string = res.data;

      login(token);
      router.push("/online-appointment");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ?? "Ошибка авторизации. Попробуйте позже",
        );
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="clinic-shell flex items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Регистрация пациента</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight">
            Создание учетной записи в едином интерфейсе клиники
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            После регистрации можно сразу перейти к заказу талона и видеть свои
            записи, заказы и обращения в личном кабинете.
          </p>
        </div>

        <div className="clinic-surface rounded-[2rem] p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-950">Регистрация</h2>
          <p className="mt-2 text-sm text-slate-500">
            Заполните основные данные пациента.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              value={email}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Email"
              className="clinic-input w-full"
            />

            <input
              value={fullName}
              onChange={(e) => setName(e.target.value)}
              placeholder="ФИО"
              className="clinic-input w-full"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="clinic-input w-full"
            />

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="clinic-btn-primary w-full disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Создание..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="font-semibold text-slate-950 underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

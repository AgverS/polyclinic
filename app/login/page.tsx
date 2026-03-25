"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/lib/context";
import { isValidEmail, normalizeEmail } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      setError("Заполните все поля");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Некорректный формат email");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/login", {
        email: normalizedEmail,
        password,
      });

      const token: string = res.data;

      login(token);
      router.push("/");
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
          <div className="clinic-kicker">Авторизация пациента</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight">
            Вход в личный кабинет без перегруженной формы
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            После входа будут доступны талоны, история приемов, вызовы на дом и
            заказы из аптеки.
          </p>
        </div>

        <div className="clinic-surface rounded-[2rem] p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-950">Вход в систему</h2>
          <p className="mt-2 text-sm text-slate-500">
            Используйте email и пароль своей учетной записи пациента.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="font-semibold text-slate-950 underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

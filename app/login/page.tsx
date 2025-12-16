"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!login || !password) {
      setError("Заполните все поля");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Ошибка входа");
      }

      // ⬇️ РОЛЬ РЕШАЕТ БЭК
      if (data.role === "PATIENT") {
        router.push("/online-appointment");
      } else {
        router.push("/admin");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Вход в систему
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Городская поликлиника №26
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин / номер полиса"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400"
          />

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}

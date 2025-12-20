"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { User } from "@/lib/generated/prisma";
import { useAuth } from "@/lib/context";

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

    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/login", {
        email,
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
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Вход в систему
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Городская поликлиника 26
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
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

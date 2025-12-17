"use client";

import { useAuth } from "@/lib/context";
import { IconBuilding, IconMenu, IconTools } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogin = () => {
    if (user) {
      logout();
      router.push("/");
    } else router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 select-none">
          <div className="text-2xl">
            <IconBuilding />
          </div>
          <div>
            <div className="font-bold text-left">Поликлиника 26</div>
            <div className="text-sm text-gray-500">
              Медицинский центр высшей категории
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden xl:flex gap-6">
          <Link href="/">Главная</Link>
          <Link href="/information">Об учреждении</Link>
          <Link href="/raspisanie">Расписание</Link>
          <Link href="/doing">Деятельность</Link>
          <Link href="/platuslugi">Платные услуги</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>

        <div className="space-x-2 flex items-center">
          <button
            onClick={handleLogin}
            className="cursor-pointer hidden xl:inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            {user ? "Выход" : "Вход"}
          </button>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => router.push("/admin")}
              className="cursor-pointer text-gray-400 border-gray-400 border-2 hidden xl:inline-block px-4 py-2 rounded-lg hover:outline-2 transition-all"
            >
              <IconTools />
            </button>
          )}
        </div>

        {/* Burger */}
        <button className="xl:hidden text-2xl" onClick={() => setOpen(!open)}>
          <IconMenu />
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="xl:hidden bg-white border-t">
          {/* TODO: можно добавить анимацию */}
          <nav className="flex flex-col p-4 gap-3">
            <Link href="/">Главная</Link>
            <Link href="/information">Об учреждении</Link>
            <Link href="/raspisanie">Расписание</Link>
            <Link href="/doing">Деятельность</Link>
            <Link href="/platuslugi">Платные услуги</Link>
            <Link href="/contacts">Контакты</Link>
            <Link
              href="/login"
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
            >
              Вход для пациентов
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 select-none">
          <div className="text-2xl">🏥</div>
          <div>
            <div className="font-bold text-left">Поликлиника №26</div>
            <div className="text-sm text-gray-500">
              Медицинский центр высшей категории
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6">
          <Link href="/">Главная</Link>
          <Link href="/information">Об учреждении</Link>
          <Link href="/raspisanie">Расписание</Link>
          <Link href="/doing">Деятельность</Link>
          <Link href="/platuslugi">Платные услуги</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>

        <Link
          href="/login"
          className="hidden md:inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Вход
        </Link>

        {/* Burger */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-white border-t">
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

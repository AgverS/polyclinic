"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <InfoSections />
    </>
  );
}

function PatientsCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/patients/count")
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch(() => setCount(0));
  }, []);

  return (
    <div className="text-3xl font-bold text-blue-600">
      {count !== null ? `${count}+` : "—"}
    </div>
  );
}

function DoctorsCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/doctors/count")
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch(() => setCount(0));
  }, []);

  return (
    <div className="text-3xl font-bold text-blue-600">
      {count !== null ? `${count}+` : "—"}
    </div>
  );
}

function Hero() {
  return (
    <section>
      {/* Banner */}
      <div className="relative h-105">
        <Image
          src="/hero.png"
          alt="Поликлиника"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Городская поликлиника №26
            </h1>
            <p className="text-lg">Медицинский центр высшей категории</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-lg text-center mb-10">
          Мы предоставляем полный спектр медицинских услуг с применением
          современного оборудования и инновационных методик лечения.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-xl shadow">
            <DoctorsCount />
            <div>Врачей</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-3xl font-bold text-blue-600">25</div>
            <div>Лет работы</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <PatientsCount />
            <div>Пациентов</div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/online-appointment"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700"
          >
            Записаться на прием
          </Link>

          <Link
            href="/pharmacy"
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-center hover:bg-green-700"
          >
            Перейти в аптеку
          </Link>

          <a
            href="#services"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-center hover:bg-blue-50"
          >
            Наши услуги
          </a>
        </div>
      </div>
    </section>
  );
}

const services = [
  { title: "Заказ талона онлайн", href: "/online-appointment" },
  { title: "Вызов врача на дом", href: "/home-call" },
  { title: "Список врачей", href: "/doctors" },
  { title: "Аптека", href: "/pharmacy" }, // ✅ добавили аптеку
];

function Services() {
  return (
    <section id="services" className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Наши услуги</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500">Подробнее →</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoSections() {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const isWeekday = day >= 1 && day <= 5;
  const isSaturday = day === 6;

  const isOpen =
    (isWeekday && minutes >= 8 * 60 && minutes < 20 * 60) ||
    (isSaturday && minutes >= 9 * 60 && minutes < 15 * 60);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </span>
              Часы работы
            </h3>
            <p className="text-sm text-gray-500">Регистратура и специалисты</p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isOpen
                ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                : "text-rose-700 bg-rose-50 border-rose-100"
            }`}
          >
            {isOpen ? "Сегодня открыто" : "Сейчас закрыто"}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span className="text-gray-700 font-medium flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-500 border border-gray-200">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
              Пн–Пт
            </span>
            <span className="text-gray-900 font-semibold">08:00 - 20:00</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span className="text-gray-700 font-medium flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-500 border border-gray-200">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 7h8M6 11h12M9 15h6" />
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                </svg>
              </span>
              Сб
            </span>
            <span className="text-gray-900 font-semibold">09:00 - 15:00</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span className="text-gray-700 font-medium flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-500 border border-gray-200">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
              </span>
              Вс
            </span>
            <span className="text-gray-500 font-semibold">выходной</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-blue-800 font-semibold">
          Срочная помощь: круглосуточно
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4">Как нас найти</h3>
        <p>г. Минск, ул. Колесникова 3</p>

        <div className="mt-4 h-48 bg-gray-200 flex items-center justify-center">
          <iframe
            title="map"
            src="https://www.google.com/maps?q=Минск,+ул.+Колесникова+3&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

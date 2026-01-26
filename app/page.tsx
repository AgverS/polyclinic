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
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4">Часы работы</h3>
        <p>Пн–Пт: 08:00–20:00</p>
        <p>Сб: 09:00–15:00</p>
        <p>Вс: выходной</p>
        <p className="mt-2 font-semibold">Срочная помощь: круглосуточно</p>
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

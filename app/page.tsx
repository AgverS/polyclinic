"use client";

import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import heroPhoto from "../6728-medicinskiy-centr-_nordin_-na-behtereva_l.jpg";

const services = [
  {
    title: "Заказ талона",
    text: "Онлайн-запись к врачу с выбором времени без звонка в регистратуру.",
    href: "/online-appointment",
  },
  {
    title: "Публичное расписание",
    text: "Свободные окна и график работы врачей на ближайшие дни.",
    href: "/raspisanie",
  },
  {
    title: "Вызов врача на дом",
    text: "Оформление вызова для пациентов, которым сложно приехать в центр.",
    href: "/home-call",
  },
  {
    title: "Аптека",
    text: "Каталог товаров, корзина, отзывы и оформление заказа онлайн.",
    href: "/pharmacy",
  },
];

export default function Home() {
  return (
    <main
      className="clinic-shell clinic-home-shell"
      style={
        {
          "--clinic-home-hero-image": `url(${heroPhoto.src})`,
        } as CSSProperties
      }
    >
      <Hero />
      <Services />
      <Overview />
    </main>
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

  return <>{count !== null ? `${count}+` : "—"}</>;
}

function DoctorsCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/doctors/count")
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch(() => setCount(0));
  }, []);

  return <>{count !== null ? `${count}+` : "—"}</>;
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
      <div className="clinic-hero relative overflow-hidden rounded-[2.2rem] text-white">
        <div className="relative flex min-h-160 flex-col justify-between p-8 sm:p-10 lg:min-h-180 lg:p-12">
          <div className="max-w-3xl">
            <div className="clinic-kicker">
              Городская поликлиника города Минска
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
              Учреждение здравоохранения поликлиника № 26
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
              Запись к врачу, расписание специалистов, личный кабинет пациента и
              аптечный сервис собраны в одном понятном интерфейсе.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/online-appointment" className="clinic-btn-accent">
                Записаться на прием
              </Link>
              <Link href="/raspisanie" className="clinic-btn-ghost">
                Смотреть расписание
              </Link>
              <Link href="/doctors" className="clinic-btn-ghost">
                Найти врача
              </Link>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.7rem] border border-white/10 bg-[rgba(9,20,38,0.54)] px-5 py-5 backdrop-blur-md">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                Спокойный сценарий записи
              </div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100">
                Без перегруженных экранов: врач, расписание, запись и основные
                сервисы доступны сразу с первого экрана.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <QuickStat
                label="Врачей"
                value={<DoctorsCount />}
                hint="в базе"
              />
              <QuickStat
                label="Пациентов"
                value={<PatientsCount />}
                hint="в системе"
              />
              <QuickStat label="Режим" value="08:00–20:00" hint="Пн–Пт" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-[rgba(9,20,38,0.74)] px-4 py-4 backdrop-blur-md">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-1 text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-100/75">
        {hint}
      </div>
    </div>
  );
}

function Services() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
      <div className="clinic-surface rounded-4xl p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
              Быстрые сценарии
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Основные сервисы в одном стиле и без лишних переходов
            </h2>
          </div>
          <Link href="/contacts" className="clinic-btn-primary">
            Связаться с регистратурой
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="clinic-card rounded-[1.6rem] p-5 transition hover:-translate-y-1"
            >
              <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
                Сервис
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {service.text}
              </p>
              <div className="mt-5 text-sm font-semibold text-slate-900">
                Перейти
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Overview() {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const isSaturday = day === 6;
  const isOpen =
    (isWeekday && minutes >= 8 * 60 && minutes < 20 * 60) ||
    (isSaturday && minutes >= 9 * 60 && minutes < 15 * 60);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="clinic-surface rounded-4xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
              Режим работы
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Регистратура и прием специалистов
            </h2>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              isOpen
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {isOpen ? "Сейчас открыто" : "Сейчас закрыто"}
          </span>
        </div>

        <div className="mt-8 space-y-3">
          {[
            ["Пн–Пт", "08:00 - 20:00"],
            ["Сб", "09:00 - 15:00"],
            ["Вс", "выходной"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4"
            >
              <span className="font-medium text-slate-700">{label}</span>
              <span className="font-semibold text-slate-950">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[1.2rem] border border-cyan-100 bg-cyan-50 px-4 py-4 text-sm font-medium text-cyan-900">
          Срочная помощь: круглосуточно. Для планового приема используйте
          онлайн-запись или телефон регистратуры.
        </div>
      </div>

      <div className="clinic-surface rounded-4xl p-6 sm:p-8">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
          Адрес и ориентиры
        </div>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Поликлиника находится в Минске на улице Колесникова, 3
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Рядом остановки общественного транспорта и удобный подъезд для
          пациентов. На странице контактов доступна форма обратной связи.
        </p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <iframe
            title="map"
            src="https://www.google.com/maps?q=Минск,+ул.+Колесникова+3&output=embed"
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

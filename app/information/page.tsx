"use client";

import Link from "next/link";

const stats = [
  { value: "35+", label: "Лет работы" },
  { value: "50+", label: "Специалистов" },
  { value: "25k+", label: "Пациентов в год" },
  { value: "15+", label: "Направлений" },
];

const directions = [
  "Терапия и профилактика",
  "Консультации узких специалистов",
  "Лабораторная и инструментальная диагностика",
  "Вакцинация и диспансеризация",
  "Онлайн-запись и личный кабинет",
  "Выезд врача на дом",
];

export default function InformationPage() {
  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Об учреждении</div>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Современная поликлиника с понятным маршрутом для пациента
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Поликлиника №26 сочетает амбулаторную помощь, диагностику,
            профилактику и цифровые сервисы, чтобы путь от обращения до приема
            был предсказуемым и быстрым.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
        <div className="clinic-surface rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="clinic-card rounded-[1.5rem] p-5 text-center">
                <div className="text-4xl font-extrabold text-slate-950">
                  {item.value}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="clinic-card rounded-[1.7rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                Наша миссия
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Качественная помощь без лишней сложности
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Мы строим сервис вокруг пациента: понятная запись, прозрачное
                расписание, доступ к профилю, современная коммуникация и единый
                визуальный язык сайта без разрозненных сценариев.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/raspisanie" className="clinic-btn-primary">
                  Смотреть расписание
                </Link>
                <Link href="/contacts" className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-50">
                  Контакты
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {directions.map((item) => (
                <div key={item} className="clinic-card rounded-[1.5rem] p-5">
                  <div className="text-lg font-semibold text-slate-950">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="clinic-card rounded-[1.7rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                История
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Поликлиника была основана в 1985 году и прошла путь от
                локального медицинского подразделения до многопрофильного центра
                с цифровыми сервисами для пациентов.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Сегодня фокус смещен не только на качество медицинской помощи, но
                и на удобство взаимодействия: от поиска врача до получения
                талона и просмотра своих записей.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.7rem] border border-slate-200">
              <iframe
                title="map"
                src="https://www.google.com/maps?q=Минск,+ул.+Колесникова+3&output=embed"
                className="h-full min-h-72 w-full border-0"
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

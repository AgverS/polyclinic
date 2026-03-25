"use client";

import Link from "next/link";

const services = [
  {
    title: "УЗИ органов брюшной полости",
    description: "Диагностика печени, почек и других органов на современном оборудовании.",
    price: "35 BYN",
  },
  {
    title: "Консультация кардиолога",
    description: "Первичный прием, оценка рисков, рекомендации и контроль состояния.",
    price: "40 BYN",
  },
  {
    title: "Лечебный массаж",
    description: "Курс для снятия напряжения и восстановления после нагрузок.",
    price: "25 BYN",
  },
  {
    title: "Общий анализ крови",
    description: "Быстрый базовый скрининг с понятной выдачей результатов.",
    price: "15 BYN",
  },
  {
    title: "Справка для ГАИ",
    description: "Оформление в день обращения при наличии необходимых данных.",
    price: "30 BYN",
  },
  {
    title: "Флюорография",
    description: "Цифровое обследование грудной клетки и оперативная обработка.",
    price: "20 BYN",
  },
];

export default function PaidServicesPage() {
  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Платные услуги</div>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Платные медицинские услуги в том же интерфейсе, что и основные
            сценарии пациента
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Услуги доступны без перегруженных таблиц и случайного визуального
            набора. Главное: понять состав, стоимость и куда обратиться для
            записи.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
        <div className="clinic-surface rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                Актуальные позиции
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Перечень популярных услуг
              </h2>
            </div>
            <Link href="/contacts" className="clinic-btn-primary">
              Уточнить по телефону
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="clinic-card rounded-[1.6rem] p-5">
                <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">
                  Платная услуга
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-950">
                    {service.price}
                  </span>
                  <Link
                    href="/contacts"
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Запросить
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="clinic-card rounded-[1.7rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                Как записаться
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Для уточнения состава услуги, подготовки и времени приема
                свяжитесь с регистратурой. Это пока самый надежный сценарий для
                платных услуг, поэтому он вынесен в понятный блок, а не спрятан
                в случайный текст внизу страницы.
              </p>
            </div>

            <div className="clinic-card rounded-[1.7rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                Контакты
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div>Телефон: +375-25-751-77-10</div>
                <div>Адрес: г. Минск, ул. Колесникова 3</div>
                <div>Пн–Пт: 8:00–20:00, Сб: 9:00–15:00</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Наличный расчет", "Банковская карта", "ЕРИП"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

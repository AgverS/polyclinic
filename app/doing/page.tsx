"use client";

const directions = [
  {
    title: "Терапевтическая помощь",
    text: "Диагностика, наблюдение, оформление больничных и ведение хронических состояний.",
  },
  {
    title: "Педиатрия",
    text: "Осмотры, прививки, контроль развития и маршрутизация детей к профильным врачам.",
  },
  {
    title: "Кардиология",
    text: "Консультации, профилактика осложнений и сопровождение пациентов группы риска.",
  },
  {
    title: "Хирургия",
    text: "Амбулаторные процедуры и послеоперационное наблюдение без лишних направлений.",
  },
  {
    title: "Лаборатория",
    text: "Анализы крови, биохимия, экспресс-тесты и контроль ключевых показателей.",
  },
  {
    title: "Профилактика",
    text: "Диспансеризация, школы здоровья и сезонные программы вакцинации.",
  },
];

const services = [
  "Медицинские справки",
  "Профосмотры",
  "Домашние визиты",
  "Экспресс-анализы",
  "Оформление листков нетрудоспособности",
  "Плановая профилактика",
];

export default function DoingPage() {
  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Деятельность поликлиники</div>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Основные направления помощи, диагностики и профилактики
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Поликлиника №26 закрывает основные ежедневные сценарии пациентов:
            плановый прием, профилактику, наблюдение, консультации и поддержку
            на дому.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
        <div className="clinic-surface rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                Направления
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Чем занимается поликлиника каждый день
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {directions.map((item) => (
              <div key={item.title} className="clinic-card rounded-[1.6rem] p-5">
                <h3 className="text-xl font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="clinic-card rounded-[1.7rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                Дополнительно
              </div>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Сопутствующие услуги без перегруженного интерфейса
              </h3>
              <div className="mt-5 flex flex-wrap gap-3">
                {services.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="clinic-card rounded-[1.7rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
                Подход
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Сайт и очный сервис должны работать одинаково понятно: врач,
                время, запись, профиль пациента, дополнительные услуги и
                контакты находятся в ожидаемых местах и не требуют поиска по
                десяткам однотипных ссылок.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Именно поэтому ключевые сценарии вынесены в отдельные разделы:
                публичное расписание, список врачей, онлайн-талон, вызов на дом
                и аптека.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

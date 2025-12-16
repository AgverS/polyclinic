import Link from "next/link";

export default function DoingPage() {
  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <DoingHero />

      <section className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        <p className="text-center max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
          Городская поликлиника №26 предоставляет широкий спектр
          медицинских услуг для профилактики, диагностики и лечения
          заболеваний. Мы обеспечиваем квалифицированную помощь
          в комфортных условиях.
        </p>

        <DirectionsGrid />
        <DoingStats />
        <ExtraServices />

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </section>
    </main>
  );
}

function DoingHero() {
  return (
    <section className="h-70 bg-linear-to-r from-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold mb-4">
          Направления деятельности
        </h1>
        <p className="text-gray-200 max-w-3xl">
          Широкий спектр медицинских услуг для профилактики,
          диагностики и лечения заболеваний
        </p>
      </div>
    </section>
  );
}

// TODO: заменить на данные из backend (Prisma)
const directions = [
  {
    title: "Терапевтическая помощь",
    text: "Диагностика и лечение заболеваний, диспансерное наблюдение.",
  },
  {
    title: "Педиатрия",
    text: "Медицинское обслуживание детей, вакцинация и осмотры.",
  },
  {
    title: "Кардиология",
    text: "ЭКГ, контроль давления и профилактика осложнений.",
  },
  {
    title: "Хирургия",
    text: "Мелкие вмешательства и послеоперационное наблюдение.",
  },
  {
    title: "Лабораторные исследования",
    text: "Анализы крови, ПЦР, биохимия и экспресс-тесты.",
  },
  {
    title: "Профилактика и вакцинация",
    text: "Прививки, профилактические мероприятия, школы здоровья.",
  },
];

function DirectionsGrid() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-10 text-center">
        Основные направления
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {directions.map((d) => (
          <div
            key={d.title}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition"
          >
            <h3 className="font-semibold text-lg mb-3">
              {d.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {d.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const stats = [
  { value: "35+", label: "Лет успешной работы" },
  { value: "25 000+", label: "Пациентов в год" },
  { value: "50+", label: "Квалифицированных специалистов" },
  { value: "15+", label: "Медицинских направлений" },
];

function DoingStats() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-10 text-center">
        Поликлиника в цифрах
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
          >
            <div className="text-3xl font-bold text-blue-400">
              {s.value}
            </div>
            <div className="text-gray-400 mt-2 text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const services = [
  "Медицинские справки",
  "Выезд врача на дом",
  "Оформление больничных",
  "Профосмотры",
  "Экспресс-анализы",
  "Неотложная помощь",
];

function ExtraServices() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-8 text-center">
        Дополнительные услуги
      </h2>

      <div className="flex flex-wrap justify-center gap-3">
        {services.map((s) => (
          <span
            key={s}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}



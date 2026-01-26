import Link from "next/link";

export default function InformationPage() {
  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <AboutHero />

      <section className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <p className="text-center text-lg text-gray-300 leading-relaxed">
          Городская поликлиника №26 — современное медицинское учреждение,
          предоставляющее широкий спектр амбулаторных услуг. Мы обеспечиваем
          качественную, доступную и своевременную помощь.
        </p>

        {/* Миссия */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Наша миссия</h2>
          <p className="text-gray-300 leading-relaxed">
            Забота о здоровье населения через профессионализм, уважение и
            инновации. Мы объединяем опыт врачей, современные технологии и
            индивидуальный подход.
          </p>
        </div>

        <Stats />
        <Directions />
        <History />
        <ContactInfo />

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </section>
    </main>
  );
}

function AboutHero() {
  return (
    <section className="relative h-80 flex items-center justify-center bg-linear-to-r from-blue-900 to-indigo-900">
      <div className="text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          О нашей поликлинике
        </h1>
        <p className="text-gray-200 max-w-3xl">
          Современное медицинское учреждение, предоставляющее амбулаторные
          услуги жителям Минска с 1985 года
        </p>
      </div>
    </section>
  );
}

const stats = [
  { value: "35+", label: "Лет успешной работы" },
  { value: "50+", label: "Квалифицированных специалистов" },
  { value: "25k+", label: "Пациентов ежегодно" },
  { value: "15+", label: "Медицинских отделений" },
];

function Stats() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-8 text-center">Мы в цифрах</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
          >
            <div className="text-3xl font-bold text-blue-400">{s.value}</div>
            <div className="text-gray-300 mt-2">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const directions = [
  {
    title: "Первичная помощь",
    text: "Комплексное медицинское обслуживание с индивидуальным подходом",
  },
  {
    title: "Профилактика",
    text: "Осмотры и диспансеризация для раннего выявления заболеваний",
  },
  {
    title: "Диагностика",
    text: "Современные лабораторные и инструментальные исследования",
  },
  {
    title: "Вакцинация",
    text: "Плановые и сезонные прививки для детей и взрослых",
  },
  {
    title: "Консультации",
    text: "Консультации узких специалистов по современным протоколам",
  },
  {
    title: "Выезд на дом",
    text: "Медицинская помощь пациентам на дому",
  },
];

function Directions() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-8 text-center">
        Основные направления
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {directions.map((d) => (
          <div
            key={d.title}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <h3 className="font-semibold mb-2">{d.title}</h3>
            <p className="text-gray-300 text-sm">{d.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactInfo() {
  return (
    <section className="grid md:grid-cols-2 gap-8">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold">Контактная информация</h3>

        <p>📍 г. Минск, ул. Колесникова 3</p>
        <p>📞 +375-25-751-77-10</p>
        <p>✉️ info26@gmail.com</p>

        <p className="text-sm text-gray-300">
          Пн–Пт: 8:00–20:00
          <br />
          Сб: 9:00–15:00
          <br />
          Вс: выходной
        </p>
      </div>

      {/* TODO: Leaflet / Yandex / Google map через dynamic import */}
      <div className="bg-gray-700 rounded-xl flex items-center justify-center">
        <iframe
          title="map"
          src="https://www.google.com/maps?q=Минск,+ул.+Колесникова+3&output=embed"
          className="w-full h-full border-0"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}

function History() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-center">Наша история</h2>

      <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-4 text-gray-300">
        <p>
          Поликлиника была основана в 1985 году и прошла путь от небольшого
          медпункта до многопрофильного центра.
        </p>
        <p>
          За годы работы внедрены электронная запись, современные
          диагностические комплексы и расширен спектр услуг.
        </p>
      </div>
    </section>
  );
}

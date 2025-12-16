import Link from "next/link";

export default function PaidServicesPage() {
  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <PaidHero />

      <section className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        <p className="text-center max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed">
          Поликлиника №26 предоставляет платные медицинские услуги без
          направления врача. Все процедуры выполняются квалифицированными
          специалистами с использованием современного оборудования.
        </p>

        <PaidServices />
        <PaidBenefits />
        <PaidContacts />

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

function PaidHero() {
  return (
    <section className="h-70 bg-linear-to-r from-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Платные медицинские услуги</h1>
        <p className="text-gray-200 max-w-3xl">
          Доступные услуги без направления врача. Быстро, качественно и
          профессионально.
        </p>
      </div>
    </section>
  );
}

// TODO: заменить на данные из backend (Prisma)
const services = [
  {
    title: "УЗИ органов брюшной полости",
    description: "Диагностика печени, почек и других органов.",
    price: "35 BYN",
  },
  {
    title: "Консультация кардиолога",
    description: "ЭКГ, рекомендации и профилактика.",
    price: "40 BYN",
  },
  {
    title: "Массаж лечебный (1 сеанс)",
    description: "Снятие напряжения и восстановление.",
    price: "25 BYN",
  },
  {
    title: "Анализ крови (общий)",
    description: "Результаты в течение 2 часов.",
    price: "15 BYN",
  },
  {
    title: "Справка для ГАИ",
    description: "Оформление в день обращения.",
    price: "30 BYN",
  },
  {
    title: "Флюорография",
    description: "Цифровое обследование грудной клетки.",
    price: "20 BYN",
  },
];

function PaidServices() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-8 text-center">Перечень услуг</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.title}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition"
          >
            <h3 className="font-semibold text-lg mb-3">{s.title}</h3>

            <p className="text-gray-400 text-sm mb-6">{s.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-green-400 font-bold text-lg">
                {s.price}
              </span>

              {/* TODO: кнопка записи */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const benefits = [
  {
    title: "Экономия времени",
    text: "Минимальное ожидание и быстрые результаты",
  },
  {
    title: "Квалификация",
    text: "Опытные сертифицированные специалисты",
  },
  {
    title: "Качество",
    text: "Современное оборудование",
  },
  {
    title: "Удобство",
    text: "Гибкий график и комфорт",
  },
];

function PaidBenefits() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-8 text-center">Преимущества</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
          >
            <h4 className="font-semibold mb-2">{b.title}</h4>
            <p className="text-gray-400 text-sm">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaidContacts() {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-8 text-center space-y-6">
      <h3 className="text-xl font-bold">Как записаться на платные услуги?</h3>

      <p className="text-gray-400">Обратитесь в регистратуру или по телефону</p>

      <div className="flex flex-wrap justify-center gap-6 text-gray-300">
        <span>📞 +375-25-751-77-10</span>
        <span>📍 г. Минск, ул. Колесникова 3</span>
        <span>🕒 Пн–Пт: 8:00–20:00, Сб: 9:00–15:00</span>
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        <span className="px-4 py-2 bg-white/10 rounded-full text-sm">
          Наличный расчёт
        </span>
        <span className="px-4 py-2 bg-white/10 rounded-full text-sm">
          Банковская карта
        </span>
        <span className="px-4 py-2 bg-white/10 rounded-full text-sm">ЕРИП</span>
      </div>

      {/* TODO: онлайн-запись + авторизация */}
    </section>
  );
}

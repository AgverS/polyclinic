"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactsPage() {
  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <ContactsHero />

      <section className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <ContactsInfo />
          <ContactsMap />
        </div>

        <EmergencyBlock />
        <FeedbackForm />

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

/* ---------- HERO ---------- */

function ContactsHero() {
  return (
    <section className="h-65 bg-linear-to-r from-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold mb-3">Контактная информация</h1>
        <p className="text-gray-200 max-w-3xl">
          Свяжитесь с нами удобным для вас способом. Мы всегда готовы помочь.
        </p>
      </div>
    </section>
  );
}

/* ---------- INFO ---------- */

function ContactsInfo() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6">
      <h2 className="text-2xl font-bold">Основная информация</h2>

      <div className="space-y-4 text-gray-300">
        <p>
          📍 <strong>Адрес:</strong> г. Минск, ул. Колесникова 3
        </p>
        <p>
          📞 <strong>Справочная:</strong> +375-44-512-22-79
        </p>
        <p>
          ☎️ <strong>Регистратура:</strong> +375-44-512-22-79
        </p>
        <p>
          ✉️ <strong>Email:</strong> info26@gmail.com
        </p>
      </div>

      <div className="pt-6 border-t border-white/10">
        <h3 className="font-semibold mb-3">Часы работы</h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <div className="flex justify-between">
            <span>Пн–Пт</span>
            <span>08:00 – 20:00</span>
          </div>
          <div className="flex justify-between">
            <span>Суббота</span>
            <span>09:00 – 15:00</span>
          </div>
          <div className="flex justify-between">
            <span>Воскресенье</span>
            <span>Выходной</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- MAP ---------- */

function ContactsMap() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl min-h-95 flex items-center justify-center text-gray-400">
      <iframe
        title="map"
        src="https://www.google.com/maps?q=Минск,+ул.+Колесникова+3&output=embed"
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

/* ---------- EMERGENCY ---------- */

function EmergencyBlock() {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
      <h3 className="text-red-400 font-bold mb-2">🚨 Неотложная помощь</h3>
      <p className="text-gray-300">
        В экстренных случаях звоните по номеру{" "}
        <strong className="text-white">103</strong>
      </p>
    </div>
  );
}

/* ---------- FEEDBACK FORM ---------- */

function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Ошибка отправки");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");

      setTimeout(() => setSuccess(false), 4000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Обратная связь</h2>

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          required
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-3"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-3"
        />

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Тема сообщения"
          required
          className="md:col-span-2 bg-white/10 border border-white/20 rounded-lg px-4 py-3"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ваше сообщение"
          rows={4}
          required
          className="md:col-span-2 bg-white/10 border border-white/20 rounded-lg px-4 py-3 resize-none"
        />

        <div className="md:col-span-2 text-center">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Отправка..." : "Отправить сообщение"}
          </button>
        </div>

        {success && (
          <div className="md:col-span-2 text-center text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg py-3">
            ✅ Сообщение отправлено. Мы свяжемся с вами по почте.
          </div>
        )}

        {error && (
          <div className="md:col-span-2 text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg py-3">
            ❌ {error}
          </div>
        )}
      </form>
    </div>
  );
}

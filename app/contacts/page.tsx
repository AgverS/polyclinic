"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactsPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!res.ok) {
        throw new Error(payload.message || "Не удалось отправить сообщение");
      }

      setForm(INITIAL_FORM);
      setStatus({
        type: "success",
        message: payload.message || "Сообщение отправлено",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось отправить сообщение",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(14,23,48,0.96),rgba(20,35,72,0.92))] p-8 shadow-2xl shadow-slate-950/30">
            <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              Контакты поликлиники
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Свяжитесь с регистратурой или оставьте сообщение
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Здесь собраны основные контакты, часы работы и форма обратной
              связи для пациентов.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard
                label="Адрес"
                value="г. Минск, ул. Колесникова 3"
              />
              <InfoCard label="Телефон" value="+375-25-751-77-10" />
              <InfoCard label="Email" value="info26@gmail.com" />
              <InfoCard label="Часы работы" value="Пн–Пт 8:00–20:00, Сб 9:00–15:00" />
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/10">
              <iframe
                title="map"
                src="https://www.google.com/maps?q=Минск,+ул.+Колесникова+3&output=embed"
                className="h-[320px] w-full border-0"
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-950 shadow-xl shadow-slate-200/70">
            <h2 className="text-2xl font-semibold">Обратная связь</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Сообщение попадет в систему обращений. Все поля обязательны.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <Field
                label="Имя"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Ваше имя"
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="example@mail.com"
                type="email"
              />
              <Field
                label="Тема"
                value={form.subject}
                onChange={(value) => updateField("subject", value)}
                placeholder="Тема обращения"
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Сообщение
                </span>
                <textarea
                  required
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="Опишите вопрос или проблему"
                  className="min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </label>

              {status.type !== "idle" ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-600"
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Отправляем..." : "Отправить сообщение"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-medium text-white">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-cyan-400 focus:bg-white"
      />
    </label>
  );
}

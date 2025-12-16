"use client";
import Input from "@/components/ui/input";
import { isFilled } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";

type SuccessData = {
  fullName: string;
  phone: string;
  doctor: string;
  date: string;
  time: string;
  address: string;
};

export default function HomeCallPage() {
  const [data, setData] = useState<SuccessData | null>(null);
  const [send, setSend] = useState<boolean>(false);

  const initialData: SuccessData = {
    fullName: "",
    phone: "",
    doctor: "",
    date: "",
    time: "",
    address: "",
  };

  async function onSubmit() {
    if (!data || !isFilled(data)) {
      alert("Необходимо заполнить все поля");
      return;
    }

    const res = await axios.post("/api/home-call", data);

    if (res.status !== 200) {
      alert("Внутренняя ошибка сервера");
      return;
    }

    setSend(true);
  }

  return (
    <main className="bg-slate-900 text-white min-h-screen">
      <HomeCallHero />

      <section className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        <EmergencyBanner />
        <Features />

        {!send ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">Заявка на вызов врача</h2>

            <Input
              placeholder="ФИО пациента"
              required
              onChange={(e) => {
                const val = e.currentTarget.value;

                setData((prev) => ({
                  ...(prev ?? initialData),
                  fullName: val,
                }));
              }}
            />
            <Input
              placeholder="Телефон"
              required
              onChange={(e) => {
                const val = e.currentTarget.value;

                setData((prev) => ({
                  ...(prev ?? initialData),
                  phone: val,
                }));
              }}
            />
            <Input
              placeholder="Адрес вызова"
              required
              onChange={(e) => {
                const val = e.currentTarget.value;

                setData((prev) => ({
                  ...(prev ?? initialData),
                  address: val,
                }));
              }}
            />

            <div>
              <p className="mb-2">Желаемая дата</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["16.12", "18.12"].map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setData((prev) => ({
                        ...(prev ?? initialData),
                        date: t,
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      data?.date === t
                        ? "bg-blue-600 border-blue-500"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2">Желаемое время</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["09:00–11:00", "11:00–13:00", "13:00–15:00"].map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setData((prev) => ({
                        ...(prev ?? initialData),
                        time: t,
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      data?.time === t
                        ? "bg-blue-600 border-blue-500"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2">Специальность врача</p>
              <div className="flex gap-2">
                {["Терапевт", "Педиатр", "Кардиолог"].map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      setData((prev) => ({
                        ...(prev ?? initialData),
                        doctor: d,
                      }))
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      data?.doctor === d
                        ? "bg-blue-600 border-blue-500"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onSubmit}
              className="bg-blue-600 hover:bg-blue-500 transition rounded-lg px-6 py-3 w-full font-semibold"
            >
              Вызвать врача
            </button>
          </div>
        ) : (
          <div className="text-center py-24">
            <h2 className="text-3xl font-bold mb-4">Заявка принята</h2>

            <Label>Пациент: {data!.fullName}</Label>
            <Label>Специальность врача: {data!.doctor}</Label>
            <Label>Дата: {data!.date}</Label>
            <Label>Время: {data!.time}</Label>

            <div className="flex justify-center gap-4">
              {/* TODO: печать талона */}
              <button className="border border-white/20 px-6 py-3 rounded-lg">
                Распечатать
              </button>
              <Link href="/" className="bg-blue-600 px-6 py-3 rounded-lg">
                На главную
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function HomeCallHero() {
  return (
    <section className="h-65 bg-linear-to-r from-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold mb-3">Вызов врача на дом</h1>
        <p className="text-gray-300 max-w-2xl">
          Если вы не можете посетить поликлинику — специалист приедет к вам
        </p>
      </div>
    </section>
  );
}

function Label({ children }: { children: string | string[] }) {
  return <p className="text-gray-400 mb-2">{children}</p>;
}

function EmergencyBanner() {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
      <h3 className="font-semibold text-red-400 mb-2">
        Срочная медицинская помощь
      </h3>
      <p className="text-gray-300 text-sm">
        При температуре выше 39°C, сильных болях, затруднённом дыхании —
        немедленно вызывайте скорую помощь по номеру <b>103</b>
      </p>
    </div>
  );
}

const features = [
  {
    title: "Квалифицированные врачи",
    text: "Опытные специалисты с медицинским образованием",
  },
  {
    title: "Быстрый выезд",
    text: "Врач приезжает в течение 2–4 часов",
  },
  {
    title: "Полный осмотр",
    text: "Диагностика, консультация, назначения",
  },
  {
    title: "Неотложная помощь",
    text: "Помощь при острых состояниях",
  },
];

function Features() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f) => (
        <div
          key={f.title}
          className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
        >
          <h3 className="font-semibold mb-2">{f.title}</h3>
          <p className="text-gray-400 text-sm">{f.text}</p>
        </div>
      ))}
    </div>
  );
}

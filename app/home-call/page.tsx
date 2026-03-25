"use client";

import Input from "@/components/ui/input";
import { useAuth } from "@/lib/context";
import { isFilled } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

type HomeCallData = {
  fullName: string;
  phone: string;
  address: string;
  doctor: string;
  date: string;
  time: string;
};

type Slot = {
  date: string;
  time: string;
};

export default function HomeCallPage() {
  const { user } = useAuth();
  const [data, setData] = useState<HomeCallData>({
    fullName: "",
    phone: "",
    address: "",
    doctor: "",
    date: "",
    time: "",
  });

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setData((current) => ({
      ...current,
      fullName: user.fullName,
    }));
  }, [user]);

  useEffect(() => {
    const loadOptions = async () => {
      const res = await axios.get("/api/home-call/options");
      setSpecialties(res.data.specialties);
      setSlots(res.data.slots);
    };

    loadOptions();
  }, []);

  async function submit() {
    if (!isFilled(data)) {
      alert("Заполните все поля");
      return;
    }

    const token =
      typeof window === "undefined" ? null : localStorage.getItem("token");

    setSubmitting(true);
    try {
      await axios.post("/api/home-call", data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setSent(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message ?? "Не удалось оформить вызов");
      } else {
        alert("Не удалось оформить вызов");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadTicket() {
    const res = await axios.post("/api/home-call/ticket", data, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "home-call-ticket.pdf";
    a.click();
  }

  return (
    <main className="clinic-shell">
      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Вызов врача на дом</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Оформление домашнего визита в том же стиле, что и запись на прием
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Если пациенту сложно приехать в поликлинику, заявку можно заполнить
            онлайн и сразу получить талон после подтверждения.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-4 sm:px-8">
        {!sent ? (
          <div className="clinic-surface rounded-[2rem] p-8 space-y-6">
            <h2 className="text-2xl font-bold text-slate-950">Заявка</h2>

            <Input
              placeholder="ФИО пациента"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
            />

            <Input
              placeholder="Телефон"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />

            <Input
              placeholder="Адрес"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Специальность врача
              </p>
              <div className="flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <button
                    key={s}
                    onClick={() => setData({ ...data, doctor: s })}
                    className={`px-4 py-2 rounded-lg border ${
                      data.doctor === s
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Дата и время
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={`${slot.date}-${slot.time}`}
                    onClick={() =>
                      setData({
                        ...data,
                        date: slot.date,
                        time: slot.time,
                      })
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      data.date === slot.date && data.time === slot.time
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {slot.date} {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={submit}
              disabled={submitting}
              className="clinic-btn-primary w-full disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "Отправляем..." : "Вызвать врача"}
            </button>
          </div>
        ) : (
          <div className="clinic-surface rounded-[2rem] p-8 text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-950">
              Заявка принята
            </h2>

            <p className="text-slate-600">Пациент: {data.fullName}</p>
            <p className="text-slate-600">Врач: {data.doctor}</p>
            <p className="text-slate-600">
              {data.date} {data.time}
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={downloadTicket}
                className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Скачать талон PDF
              </button>

              <Link href="/" className="clinic-btn-primary">
                На главную
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

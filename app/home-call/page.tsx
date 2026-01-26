"use client";

import Input from "@/components/ui/input";
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

    await axios.post("/api/home-call", data);
    setSent(true);
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
    <main className="bg-slate-900 text-white min-h-screen">
      <section className="h-64 bg-linear-to-r from-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Вызов врача на дом</h1>
          <p className="text-gray-300">
            Если вы не можете прийти в клинику - врач приедет к вам
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        {!sent ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">Заявка</h2>

            <Input
              placeholder="ФИО пациента"
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
            />

            <Input
              placeholder="Телефон"
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />

            <Input
              placeholder="Адрес"
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />

            <div>
              <p className="mb-2">Специальность врача</p>
              <div className="flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <button
                    key={s}
                    onClick={() => setData({ ...data, doctor: s })}
                    className={`px-4 py-2 rounded-lg border ${
                      data.doctor === s
                        ? "bg-blue-600 border-blue-500"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2">Дата и время</p>
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
                        ? "bg-blue-600 border-blue-500"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    {slot.date} {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={submit}
              className="bg-blue-600 hover:bg-blue-500 rounded-lg px-6 py-3 w-full font-semibold"
            >
              Вызвать врача
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Заявка принята</h2>

            <p className="text-gray-300">Пациент: {data.fullName}</p>
            <p className="text-gray-300">Врач: {data.doctor}</p>
            <p className="text-gray-300">
              {data.date} {data.time}
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={downloadTicket}
                className="border border-white/20 px-6 py-3 rounded-lg"
              >
                Распечатать талон
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

/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { Doctor } from "@/lib/generated/prisma";
import { IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function OnlineAppointmentPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // TODO: заменить на реальные данные с backend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Заказ талона онлайн</h1>
          <p className="text-gray-400">Запишитесь на прием без очереди</p>
        </header>

        <Steps step={step} />

        {step === 1 && (
          <StepDoctor
            onNext={() => setStep(2)}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
          />
        )}

        {step === 2 && (
          <StepDateTime
            doctor={selectedDoctor}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            setDate={setSelectedDate}
            setTime={setSelectedTime}
          />
        )}

        {step === 3 && (
          <Success
            doctor={selectedDoctor}
            date={selectedDate}
            time={selectedTime}
          />
        )}
      </div>
    </main>
  );
}

function Steps({ step }: { step: number }) {
  const steps = ["Выбор врача", "Дата и время", "Подтверждение"];

  return (
    <div className="flex justify-center gap-8 mb-12">
      {steps.map((label, i) => {
        const index = i + 1;
        const active = step >= index;

        return (
          <div
            key={label}
            className={`flex items-center gap-3 ${
              active ? "text-blue-400" : "text-gray-500"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border
              ${active ? "border-blue-400" : "border-gray-600"}`}
            >
              {index}
            </div>
            <span className="hidden md:block">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DoctorCard({
  doctor,
  selected,
  onSelect,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
  return (
    <button
      onClick={() => onSelect(doctor)}
      className={`text-left p-5 rounded-xl border transition
        ${
          selected
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/10 hover:border-white/30"
        }`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
          👨‍⚕️
        </div>
        <div>
          <div className="font-semibold">{doctor.name}</div>
          <div className="text-sm text-gray-400">{doctor.specialty}</div>
        </div>
      </div>

      <div className="text-sm text-gray-400 space-y-1">
        <p>Стаж: {doctor.experience} лет</p>
        <p>Рейтинг: {doctor.rating}</p>
        <p>Кабинет: {doctor.room}</p>
      </div>
    </button>
  );
}

// const doctors = [
//   {
//     id: 1,
//     name: "Иванова Мария Петровна",
//     specialty: "Терапевт, высшая категория",
//     experience: 15,
//     rating: 4.8,
//     room: 215,
//   },
//   {
//     id: 2,
//     name: "Петров Алексей Владимирович",
//     specialty: "Хирург",
//     experience: 12,
//     rating: 4.7,
//     room: 312,
//   },
// ];

function StepDoctor({
  onNext,
  selectedDoctor,
  setSelectedDoctor,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get("/api/doctors");
      const data: Doctor[] = res.data;
      setDoctors(data);
    };
    fetch();
  }, []);

  return (
    <section className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            selected={selectedDoctor?.id === doctor.id}
            onSelect={setSelectedDoctor}
          />
        ))}
      </div>

      <aside className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h3 className="font-semibold mb-4">Информация</h3>
        <p className="text-gray-400 text-sm mb-2">
          Доступна запись на ближайшие 14 дней
        </p>

        <button
          disabled={!selectedDoctor}
          onClick={onNext}
          className="mt-6 w-full bg-blue-600 py-3 rounded-lg disabled:opacity-50"
        >
          Продолжить →
        </button>
      </aside>
    </section>
  );
}

function StepDateTime({
  doctor,
  onBack,
  onNext,
  setDate,
  setTime,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
  return (
    <section className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h2 className="font-semibold mb-2">Врач</h2>
          <p>{doctor?.name}</p>
        </div>

        {/* TODO: заменить на реальный календарь */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h2 className="font-semibold mb-4">Дата</h2>
          <button
            onClick={() => setDate("2025-01-17")}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            17 января
          </button>
        </div>

        {/* TODO: реальные слоты времени */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h2 className="font-semibold mb-4">Время</h2>
          <button
            onClick={() => setTime("14:30")}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            14:30
          </button>
        </div>
      </div>

      <aside className="bg-white/5 p-6 rounded-xl border border-white/10">
        <button
          onClick={onNext}
          className="w-full bg-green-600 py-3 rounded-lg mb-3"
        >
          Подтвердить
        </button>

        <button
          onClick={onBack}
          className="w-full border border-white/20 py-3 rounded-lg"
        >
          ← Назад
        </button>
      </aside>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Success({ doctor, date, time }: any) {
  return (
    <div className="text-center py-24 flex flex-col items-center">
      <div className="p-4 mb-6 bg-green-400 rounded-full text-white">
        <IconCheck size={96} stroke={2} />
      </div>
      <h2 className="text-3xl font-bold mb-4">Запись успешно оформлена</h2>

      <p className="text-gray-400 mb-8">
        {doctor?.name}, {date} в {time}
      </p>

      {/* TODO: генерация талона, печать */}
      <div className="flex justify-center gap-4">
        <button className="border px-6 py-3 rounded-lg">
          Распечатать талон
        </button>
        <a href="/" className="bg-blue-600 px-6 py-3 rounded-lg">
          На главную
        </a>
      </div>
    </div>
  );
}

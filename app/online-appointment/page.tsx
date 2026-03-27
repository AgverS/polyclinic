"use client";

import type { FullDoctor } from "@/lib/types";
import { useAuth } from "@/lib/context";
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconUser,
} from "@tabler/icons-react";
import axios from "axios";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

/* =====================
   TYPES
===================== */

type ScheduleSlot = {
  id: number;
  startDateTime: string;
  endDateTime: string;
};

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatTimeLabel(value: string) {
  return new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =====================
   PAGE
===================== */

export default function OnlineAppointmentPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [selectedDoctor, setSelectedDoctor] = useState<FullDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!user) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-6">
        <div className="max-w-xl w-full border border-white/10 bg-white/5 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">
            Запись доступна после входа
          </h1>
          <p className="text-gray-300 mb-6">
            Авторизуйтесь, чтобы создать талон и видеть его в личном кабинете.
          </p>
          <Link
            href="/login"
            className="inline-flex h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 items-center justify-center font-semibold"
          >
            Перейти ко входу
          </Link>
        </div>
      </main>
    );
  }

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

        {step === 2 && selectedDoctor && (
          <StepDateTime
            doctor={selectedDoctor}
            onBack={() => setStep(1)}
            onSuccess={() => setStep(3)}
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

/* =====================
   STEPS
===================== */

function Steps({ step }: { step: number }) {
  const steps = ["Врач", "Дата и время", "Готово"];

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

/* =====================
   STEP 1 - DOCTOR
===================== */

function DoctorCard({
  doctor,
  selected,
  onSelect,
}: {
  doctor: FullDoctor;
  selected: boolean;
  onSelect: Dispatch<SetStateAction<FullDoctor | null>>;
}) {
  return (
    <button
      onClick={() => onSelect(doctor)}
      className={`text-left p-5 rounded-xl border transition ${
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 hover:border-white/30"
      }`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
          <IconUser />
        </div>
        <div>
          <div className="font-semibold">{doctor.user.fullName}</div>
          <div className="text-sm text-gray-400">
            {doctor.doctorSpecialties.map((s) => s.specialty.name).join(", ")}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p>Стаж: {doctor.experience} лет</p>
        <p>Кабинет: {doctor.room}</p>
      </div>
    </button>
  );
}

function StepDoctor({
  onNext,
  selectedDoctor,
  setSelectedDoctor,
}: {
  onNext: () => void;
  selectedDoctor: FullDoctor | null;
  setSelectedDoctor: Dispatch<SetStateAction<FullDoctor | null>>;
}) {
  const [doctors, setDoctors] = useState<FullDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("/api/doctors")
      .then((res) => {
        setDoctors(res.data);
        setError(null);
      })
      .catch(() => {
        setDoctors([]);
        setError("Не удалось загрузить список врачей");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
        {loading ? (
          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
            Загружаем список врачей...
          </div>
        ) : error ? (
          <div className="md:col-span-2 rounded-xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-200">
            {error}
          </div>
        ) : doctors.length === 0 ? (
          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
            Врачи пока не добавлены.
          </div>
        ) : (
          doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              selected={selectedDoctor?.id === doctor.id}
              onSelect={setSelectedDoctor}
            />
          ))
        )}
      </div>

      <aside className="bg-white/5 p-6 rounded-xl border border-white/10">
        <div className="mb-5">
          <div className="text-sm text-gray-400">Выбранный врач</div>
          <div className="mt-2 font-semibold">
            {selectedDoctor?.user.fullName ?? "Пока не выбран"}
          </div>
        </div>
        <button
          disabled={!selectedDoctor}
          onClick={onNext}
          className="w-full bg-blue-600 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
        >
          Далее <IconArrowRight />
        </button>
      </aside>
    </section>
  );
}

/* =====================
   STEP 2 - DATE & TIME
===================== */

function StepDateTime({
  doctor,
  onBack,
  onSuccess,
  setDate,
  setTime,
}: {
  doctor: FullDoctor;
  onBack: () => void;
  onSuccess: () => void;
  setDate: Dispatch<SetStateAction<string | null>>;
  setTime: Dispatch<SetStateAction<string | null>>;
}) {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    axios
      .get(`/api/schedule?doctorId=${doctor.id}`)
      .then((res) => {
        setSlots(res.data);
        setError(null);
      })
      .catch(() => {
        setSlots([]);
        setError("Не удалось загрузить свободные слоты");
      })
      .finally(() => setSlotsLoading(false));
  }, [doctor.id]);

  const grouped = useMemo(
    () =>
      slots.reduce<Record<string, ScheduleSlot[]>>((acc, slot) => {
        const date = slot.startDateTime.slice(0, 10);
        acc[date] ??= [];
        acc[date].push(slot);
        return acc;
      }, {}),
    [slots],
  );

  const submit = async () => {
    if (!selectedSlot) return;

    const date = formatDateLabel(selectedSlot.startDateTime);
    const time = formatTimeLabel(selectedSlot.startDateTime);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Сессия истекла. Войдите заново.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/api/appointment",
        {
          scheduleId: selectedSlot.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDate(date);
      setTime(time);
      onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Ошибка записи. Слот недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {slotsLoading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
            Загружаем доступные слоты...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-6 text-rose-200">
            <div className="flex items-center gap-3">
              <IconAlertCircle />
              <span>{error}</span>
            </div>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
            Для этого врача пока нет доступных окон в ближайшие 14 дней.
          </div>
        ) : (
          Object.entries(grouped).map(([date, daySlots]) => (
            <div
              key={date}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <h3 className="mb-3 font-semibold capitalize">
                {formatDateLabel(date)}
              </h3>

              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => {
                  const time = formatTimeLabel(slot.startDateTime);
                  const selected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded border ${
                        selected
                          ? "bg-blue-600 border-blue-600"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <aside className="bg-white/5 p-6 rounded-xl border border-white/10">
        <div className="mb-5 space-y-2">
          <div>
            <div className="text-sm text-gray-400">Врач</div>
            <div className="font-semibold">{doctor.user.fullName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Специальность</div>
            <div className="text-sm text-gray-200">
              {doctor.doctorSpecialties
                .map((item) => item.specialty.name)
                .join(", ")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Выбранный слот</div>
            <div className="text-sm text-gray-200">
              {selectedSlot
                ? `${formatDateLabel(selectedSlot.startDateTime)}, ${formatTimeLabel(selectedSlot.startDateTime)}`
                : "Слот еще не выбран"}
            </div>
          </div>
        </div>

        <button
          disabled={!selectedSlot || loading}
          onClick={submit}
          className="w-full bg-green-600 py-3 rounded-lg mb-3 disabled:opacity-50"
        >
          Подтвердить
        </button>

        <button
          onClick={onBack}
          className="w-full border border-white/20 py-3 rounded-lg"
        >
          Назад
        </button>
      </aside>
    </section>
  );
}

/* =====================
   STEP 3 - SUCCESS
===================== */

function Success({
  doctor,
  date,
  time,
}: {
  doctor: FullDoctor | null;
  date: string | null;
  time: string | null;
}) {
  return (
    <div className="text-center py-24 flex flex-col items-center">
      <div className="p-4 mb-6 bg-green-600 rounded-full">
        <IconCheck size={64} />
      </div>
      <h2 className="text-3xl font-bold mb-4">Запись создана</h2>

      <p className="text-gray-400 mb-8">
        {doctor?.user.fullName}, {date} в {time}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/profile" className="bg-blue-600 px-6 py-3 rounded-lg">
          Открыть мои талоны
        </Link>
        <Link href="/" className="border border-white/20 px-6 py-3 rounded-lg">
          На главную
        </Link>
      </div>
    </div>
  );
}

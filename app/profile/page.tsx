"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type Appointment = {
  id: number;
  status: AppointmentStatus;
  createdAt: string;
  schedule: {
    startDateTime: string;
    endDateTime: string;
  };
  doctor: {
    id: number;
    room: number;
    experience: number;
    user: {
      fullName: string;
    };
    doctorSpecialties: {
      specialty: {
        name: string;
      };
    }[];
  };
};

type PharmacyOrderItem = {
  id?: number;
  name: string;
  form?: string;
  price: number;
  qty?: number;
  lineTotal?: number;
};

type PharmacyOrder = {
  id: string;
  address?: string;
  phone?: string;
  items: PharmacyOrderItem[];
  total: number;
  createdAt: string;
  status?: string;
  userId?: number | null;
};

type HomeCallHistoryItem = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  doctor: string;
  date: string;
  time: string;
  status?: string;
  createdAt: string;
  userId?: number | null;
};

type TabKey = "overview" | "appointments" | "orders" | "doctors" | "home-calls";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Сводка" },
  { key: "appointments", label: "Талоны" },
  { key: "orders", label: "Заказы аптеки" },
  { key: "doctors", label: "Посещенные врачи" },
  { key: "home-calls", label: "Вызовы на дом" },
];

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "BYN",
    minimumFractionDigits: 2,
  }).format(value);
}

function localStatus(status: AppointmentStatus) {
  if (status === "PENDING") return "Ожидает подтверждения";
  if (status === "CONFIRMED") return "Подтвержден";
  if (status === "COMPLETED") return "Завершен";
  return "Отменен";
}

function statusBadge(status: AppointmentStatus) {
  if (status === "PENDING")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "CONFIRMED")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "COMPLETED") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [tab, setTab] = useState<TabKey>("overview");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [homeCalls, setHomeCalls] = useState<HomeCallHistoryItem[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const rawOrders = safeParse<PharmacyOrder[]>(
      localStorage.getItem("orders"),
      [],
    );
    const visibleOrders = rawOrders
      .filter((order) => order.userId == null || order.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(visibleOrders);

    const rawHomeCalls = safeParse<HomeCallHistoryItem[]>(
      localStorage.getItem("home_calls"),
      [],
    );
    const visibleHomeCalls = rawHomeCalls
      .filter((item) => item.userId == null || item.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    setHomeCalls(visibleHomeCalls);
  }, [user]);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingAppointments(true);
    setAppointmentsError(null);

    fetch("/api/appointment", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Не удалось загрузить талоны");
        }

        return res.json() as Promise<Appointment[]>;
      })
      .then((payload) => setAppointments(payload))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Ошибка загрузки талонов";
        setAppointmentsError(message);
        setAppointments([]);
      })
      .finally(() => setLoadingAppointments(false));
  }, [user]);

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === "PENDING" ||
          appointment.status === "CONFIRMED",
      ),
    [appointments],
  );

  const pastAppointments = useMemo(
    () =>
      appointments.filter((appointment) => appointment.status === "COMPLETED"),
    [appointments],
  );

  const visitedDoctors = useMemo(() => {
    const map = new Map<
      string,
      { name: string; specialties: string[]; visits: number; lastVisit: string }
    >();

    for (const item of pastAppointments) {
      const key = item.doctor.user.fullName;
      const specialties = item.doctor.doctorSpecialties.map(
        (s) => s.specialty.name,
      );

      if (!map.has(key)) {
        map.set(key, {
          name: key,
          specialties,
          visits: 1,
          lastVisit: item.schedule.startDateTime,
        });
        continue;
      }

      const current = map.get(key)!;
      current.visits += 1;
      if (new Date(item.schedule.startDateTime) > new Date(current.lastVisit)) {
        current.lastVisit = item.schedule.startDateTime;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.visits - a.visits);
  }, [pastAppointments]);

  const pharmacySpent = useMemo(
    () => orders.reduce((sum, order) => sum + (order.total || 0), 0),
    [orders],
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">
            Личный кабинет пользователя
          </h1>
          <p className="text-gray-600 mb-6">
            Войдите, чтобы видеть талоны, посещенных врачей и заказы аптеки.
          </p>
          <Link
            href="/login"
            className="inline-flex h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white items-center justify-center font-semibold"
          >
            Войти в систему
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pt-10 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
        <p className="text-gray-600 mb-8">
          {user.fullName}. Здесь собраны талоны, история посещений и заказы.
        </p>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full text-left px-4 py-3 text-sm transition ${
                    tab === item.key
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-6">
            {tab === "overview" && (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    label="Всего талонов"
                    value={appointments.length}
                    hint="Все записи к врачам"
                  />
                  <StatCard
                    label="Активные талоны"
                    value={upcomingAppointments.length}
                    hint="Предстоящие приемы"
                  />
                  <StatCard
                    label="Посещено врачей"
                    value={visitedDoctors.length}
                    hint="По истории приемов"
                  />
                  <StatCard
                    label="Заказы аптеки"
                    value={orders.length}
                    hint={`На сумму ${formatMoney(pharmacySpent)}`}
                  />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Ближайшие талоны
                  </h2>
                  {loadingAppointments ? (
                    <p className="text-gray-500">Загрузка...</p>
                  ) : appointmentsError ? (
                    <p className="text-rose-600">{appointmentsError}</p>
                  ) : upcomingAppointments.length === 0 ? (
                    <EmptyState text="Нет предстоящих талонов" />
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.slice(0, 3).map((item) => (
                        <AppointmentCard key={item.id} appointment={item} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === "appointments" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Все талоны</h2>
                {loadingAppointments ? (
                  <p className="text-gray-500">Загрузка...</p>
                ) : appointmentsError ? (
                  <p className="text-rose-600">{appointmentsError}</p>
                ) : appointments.length === 0 ? (
                  <EmptyState text="Талоны еще не оформлялись" />
                ) : (
                  <div className="space-y-3">
                    {appointments.map((item) => (
                      <AppointmentCard key={item.id} appointment={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "orders" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Заказы из аптеки</h2>
                {orders.length === 0 ? (
                  <EmptyState text="Заказов из аптеки пока нет" />
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div className="font-semibold">Заказ #{order.id}</div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(order.createdAt)}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {order.items.map((item, index) => (
                            <div
                              key={`${order.id}-${index}`}
                              className="flex justify-between gap-4"
                            >
                              <span className="truncate">
                                {item.name} {item.form ? `(${item.form})` : ""}
                              </span>
                              <span className="shrink-0">
                                {formatMoney(
                                  item.lineTotal ??
                                    item.price * (item.qty ?? 1),
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                          {order.address ? `Адрес: ${order.address}` : ""}
                          {order.phone ? ` · Телефон: ${order.phone}` : ""}
                        </div>
                        <div className="mt-2 font-semibold text-indigo-700">
                          Итого: {formatMoney(order.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "doctors" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Кого вы посещали</h2>
                {loadingAppointments ? (
                  <p className="text-gray-500">Загрузка...</p>
                ) : visitedDoctors.length === 0 ? (
                  <EmptyState text="История посещений пока пустая" />
                ) : (
                  <div className="space-y-3">
                    {visitedDoctors.map((doctor) => (
                      <div
                        key={doctor.name}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="font-semibold">{doctor.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {doctor.specialties.join(", ")}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Посещений: {doctor.visits}
                        </div>
                        <div className="text-sm text-gray-500">
                          Последний прием: {formatDate(doctor.lastVisit)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "home-calls" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Вызовы врача на дом
                </h2>
                {homeCalls.length === 0 ? (
                  <EmptyState text="Вы еще не оформляли вызовы на дом" />
                ) : (
                  <div className="space-y-3">
                    {homeCalls.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="font-semibold">{item.doctor}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.date} {item.time}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Адрес: {item.address}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Оформлен: {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      <div className="text-xs text-gray-500 mt-2">{hint}</div>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex flex-wrap justify-between gap-3 items-center mb-2">
        <div className="font-semibold">
          {appointment.doctor.user.fullName} · кабинет {appointment.doctor.room}
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full border ${statusBadge(appointment.status)}`}
        >
          {localStatus(appointment.status)}
        </span>
      </div>

      <div className="text-sm text-gray-600">
        {appointment.doctor.doctorSpecialties
          .map((item) => item.specialty.name)
          .join(", ")}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        Дата приема: {formatDateTime(appointment.schedule.startDateTime)}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Талон создан: {formatDateTime(appointment.createdAt)}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
      {text}
    </div>
  );
}

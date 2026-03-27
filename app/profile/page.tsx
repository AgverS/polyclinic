"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type PharmacyOrderStatus =
  | "CREATED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

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
  id: number;
  address: string;
  phone: string;
  items: PharmacyOrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  status: PharmacyOrderStatus;
  userId: number | null;
  userName: string | null;
  comment: string;
};

type HomeCallHistoryItem = {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  doctor: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
};

type TabKey = "overview" | "appointments" | "orders" | "doctors" | "home-calls";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Сводка" },
  { key: "appointments", label: "Талоны" },
  { key: "orders", label: "Заказы аптеки" },
  { key: "doctors", label: "Посещенные врачи" },
  { key: "home-calls", label: "Вызовы на дом" },
];

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

function pharmacyStatusLabel(status: PharmacyOrderStatus) {
  if (status === "CREATED") return "Создан";
  if (status === "PROCESSING") return "В обработке";
  if (status === "READY") return "Готов к выдаче";
  if (status === "COMPLETED") return "Завершен";
  return "Отменен";
}

function pharmacyStatusClass(status: PharmacyOrderStatus) {
  if (status === "CREATED")
    return "bg-slate-100 text-slate-700 border-slate-200";
  if (status === "PROCESSING")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "READY") return "bg-cyan-50 text-cyan-700 border-cyan-200";
  if (status === "COMPLETED")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [tab, setTab] = useState<TabKey>("overview");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [homeCalls, setHomeCalls] = useState<HomeCallHistoryItem[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingHomeCalls, setLoadingHomeCalls] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null,
  );
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [homeCallsError, setHomeCallsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingAppointments(true);
    setLoadingOrders(true);
    setLoadingHomeCalls(true);
    setAppointmentsError(null);
    setOrdersError(null);
    setHomeCallsError(null);

    Promise.allSettled([
      fetch("/api/appointment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Не удалось загрузить талоны");
        }

        return res.json() as Promise<Appointment[]>;
      }),
      fetch("/api/pharmacy/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload?.message || "Не удалось загрузить заказы аптеки",
          );
        }

        return res.json() as Promise<PharmacyOrder[]>;
      }),
      fetch("/api/home-call", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload?.message || "Не удалось загрузить вызовы на дом",
          );
        }

        return res.json() as Promise<HomeCallHistoryItem[]>;
      }),
    ]).then(([appointmentsResult, ordersResult, homeCallsResult]) => {
      if (appointmentsResult.status === "fulfilled") {
        setAppointments(appointmentsResult.value);
      } else {
        const message =
          appointmentsResult.reason instanceof Error
            ? appointmentsResult.reason.message
            : "Ошибка загрузки талонов";
        setAppointmentsError(message);
        setAppointments([]);
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value);
      } else {
        const message =
          ordersResult.reason instanceof Error
            ? ordersResult.reason.message
            : "Ошибка загрузки заказов";
        setOrdersError(message);
        setOrders([]);
      }

      if (homeCallsResult.status === "fulfilled") {
        setHomeCalls(homeCallsResult.value);
      } else {
        const message =
          homeCallsResult.reason instanceof Error
            ? homeCallsResult.reason.message
            : "Ошибка загрузки вызовов";
        setHomeCallsError(message);
        setHomeCalls([]);
      }

      setLoadingAppointments(false);
      setLoadingOrders(false);
      setLoadingHomeCalls(false);
    });
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
      <main className="clinic-shell flex items-center justify-center px-6 py-20">
        <div className="clinic-surface max-w-xl w-full rounded-[2rem] p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-slate-950">
            Личный кабинет пользователя
          </h1>
          <p className="mb-6 text-slate-600">
            Войдите, чтобы видеть талоны, посещенных врачей и заказы аптеки.
          </p>
          <Link href="/login" className="clinic-btn-primary">
            Войти в систему
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="clinic-shell pt-10 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="clinic-hero rounded-[2rem] p-8 text-white sm:p-10">
          <div className="clinic-kicker">Личный кабинет</div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight">
            Управление талонами, заказами и историей обращений
          </h1>
          <p className="mt-4 text-slate-300">
            {user.fullName}. Здесь собраны талоны, история посещений и заказы.
          </p>
        </div>

        <div className="mt-8 grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="clinic-surface rounded-[1.7rem] overflow-hidden">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full text-left px-4 py-3 text-sm transition ${
                    tab === item.key
                      ? "bg-[var(--clinic-navy)] text-white font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
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

                <div className="clinic-surface rounded-[1.7rem] p-6">
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
              <div className="clinic-surface rounded-[1.7rem] p-6">
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
              <div className="clinic-surface rounded-[1.7rem] p-6">
                <h2 className="text-xl font-semibold mb-4">Заказы из аптеки</h2>
                {loadingOrders ? (
                  <p className="text-gray-500">Загрузка...</p>
                ) : ordersError ? (
                  <p className="text-rose-600">{ordersError}</p>
                ) : orders.length === 0 ? (
                  <EmptyState text="Заказов из аптеки пока нет" />
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-[1.4rem] border border-slate-200 bg-white p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div className="font-semibold">Заказ #{order.id}</div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full border ${pharmacyStatusClass(order.status)}`}
                            >
                              {pharmacyStatusLabel(order.status)}
                            </span>
                            <div className="text-sm text-gray-500">
                              {formatDateTime(order.createdAt)}
                            </div>
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
                          Адрес: {order.address} · Телефон: {order.phone}
                        </div>
                        {order.comment ? (
                          <div className="mt-2 text-sm text-gray-500">
                            Комментарий: {order.comment}
                          </div>
                        ) : null}
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
              <div className="clinic-surface rounded-[1.7rem] p-6">
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
                        className="rounded-[1.4rem] border border-slate-200 bg-white p-4"
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
              <div className="clinic-surface rounded-[1.7rem] p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Вызовы врача на дом
                </h2>
                {loadingHomeCalls ? (
                  <p className="text-gray-500">Загрузка...</p>
                ) : homeCallsError ? (
                  <p className="text-rose-600">{homeCallsError}</p>
                ) : homeCalls.length === 0 ? (
                  <EmptyState text="Вы еще не оформляли вызовы на дом" />
                ) : (
                  <div className="space-y-3">
                    {homeCalls.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.4rem] border border-slate-200 bg-white p-4"
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
    <div className="clinic-surface rounded-[1.4rem] p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      <div className="text-xs text-gray-500 mt-2">{hint}</div>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
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
    <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-gray-500">
      {text}
    </div>
  );
}

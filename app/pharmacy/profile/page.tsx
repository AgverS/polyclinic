"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  total: number;
  createdAt: string;
  items: {
    name: string;
    price: number;
  }[];
};

type Item = {
  id: number;
  name: string;
  form: string;
  price: number;
};

type Tab = "orders" | "wait" | "profile";

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [wait, setWait] = useState<Item[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window === "undefined") return;

    setOrders(JSON.parse(localStorage.getItem("orders") || "[]"));
    setWait(JSON.parse(localStorage.getItem("wait") || "[]"));
  }, []);

  if (!mounted) return null;

  return (
    <div className="px-6 pt-24 pb-16 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-8">Личный кабинет</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* SIDEBAR */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl bg-[#111A2E] border border-white/10 overflow-hidden">
            <MenuItem
              active={tab === "orders"}
              onClick={() => setTab("orders")}
            >
              Мои заказы
            </MenuItem>

            <MenuItem active={tab === "wait"} onClick={() => setTab("wait")}>
              Лист ожидания
            </MenuItem>

            <MenuItem
              active={tab === "profile"}
              onClick={() => setTab("profile")}
            >
              Профиль
            </MenuItem>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="lg:col-span-3">
          {tab === "orders" && <OrdersTab orders={orders} />}
          {tab === "wait" && <WaitTab wait={wait} />}
          {tab === "profile" && <ProfileTab />}
        </section>
      </div>
    </div>
  );
}

function MenuItem({
  children,
  active,
  onClick,
}: {
  children: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 text-sm font-medium transition-colors
        ${
          active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-white/5"
        }`}
    >
      {children}
    </button>
  );
}

/* ===== TABS ===== */

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <EmptyState text="У вас пока нет заказов" />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="p-5 rounded-2xl bg-[#111A2E] border border-white/10"
        >
          <div className="flex justify-between mb-3">
            <div className="text-white font-medium">Заказ #{order.id}</div>
            <div className="text-gray-400 text-sm">
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-400">
            {order.items.map((i, idx) => (
              <div key={idx}>
                {i.name} - {i.price.toFixed(2)} BYN
              </div>
            ))}
          </div>

          <div className="mt-4 text-blue-500 font-semibold">
            Итого: {order.total.toFixed(2)} BYN
          </div>
        </div>
      ))}
    </div>
  );
}

function WaitTab({ wait }: { wait: Item[] }) {
  if (wait.length === 0) {
    return <EmptyState text="Лист ожидания пуст" />;
  }

  return (
    <div className="space-y-4">
      {wait.map((item) => (
        <div
          key={item.id}
          className="p-5 rounded-2xl bg-[#0F172A] border border-white/10"
        >
          <div className="text-white font-medium">{item.name}</div>
          <div className="text-sm text-gray-400">{item.form}</div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="p-6 rounded-2xl bg-[#111A2E] border border-white/10 space-y-4">
      <ProfileField label="Имя" value="Пользователь" />
      <ProfileField label="Email" value="user@example.com" />
      <ProfileField label="Телефон" value="+375 (__) ___-__-__" />
    </div>
  );
}

/* ===== UI ===== */

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="h-12 px-4 flex items-center rounded-xl bg-[#0F172A] border border-white/10 text-white">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-10 rounded-2xl bg-[#111A2E] border border-white/10 text-center text-gray-400">
      {text}
    </div>
  );
}

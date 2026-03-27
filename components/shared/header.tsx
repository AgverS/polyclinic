"use client";

import { useAuth } from "@/lib/context";
import {
  IconBuilding,
  IconChevronDown,
  IconMenu,
  IconTools,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type NavLinkItem = {
  href: string;
  label: string;
  description: string;
};

type NavGroup = {
  key: string;
  label: string;
  links: NavLinkItem[];
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [desktopGroup, setDesktopGroup] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const groups = useMemo<NavGroup[]>(
    () => [
      {
        key: "about",
        label: "О центре",
        links: [
          {
            href: "/",
            label: "Главная",
            description: "Основная страница и быстрые переходы",
          },
          {
            href: "/information",
            label: "Об учреждении",
            description: "История, миссия и общая информация",
          },
          {
            href: "/doing",
            label: "Деятельность",
            description: "Основные направления работы поликлиники",
          },
          {
            href: "/contacts",
            label: "Контакты",
            description: "Телефоны, адрес и форма обратной связи",
          },
        ],
      },
      {
        key: "services",
        label: "Услуги",
        links: [
          {
            href: "/online-appointment",
            label: "Заказ талона",
            description: "Онлайн-запись на прием к врачу",
          },
          {
            href: "/home-call",
            label: "Вызов на дом",
            description: "Оформление вызова врача для пациента",
          },
          {
            href: "/pharmacy",
            label: "Аптека",
            description: "Каталог товаров и оформление заказа",
          },
          {
            href: "/platuslugi",
            label: "Платные услуги",
            description: "Перечень услуг и контакты для записи",
          },
        ],
      },
      {
        key: "doctors",
        label: "Врачи и время",
        links: [
          {
            href: "/raspisanie",
            label: "Расписание",
            description: "Публичное расписание врачей на ближайшие дни",
          },
          {
            href: "/doctors",
            label: "Список врачей",
            description: "Врачи, специальности и опыт работы",
          },
          {
            href: "/online-appointment",
            label: "Записаться",
            description: "Быстрый переход к оформлению талона",
          },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setDesktopGroup(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleLogin = () => {
    setOpen(false);
    setDesktopGroup(null);
    setMobileGroup(null);
    if (user) {
      logout();
      router.push("/");
    } else router.push("/login");
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(245,248,252,0.78)] shadow-sm backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 select-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--clinic-navy) text-2xl text-white shadow-lg shadow-slate-300/30">
            <IconBuilding size={22} />
          </div>
          <div>
            <div className="text-left text-lg font-extrabold tracking-tight text-slate-950">
              Поликлиника 26
            </div>
            <div className="text-sm text-slate-500">
              Медицинский центр высшей категории
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 xl:flex">
          {groups.map((group) => {
            const active = group.links.some((item) =>
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href),
            );

            return (
              <div key={group.key} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setDesktopGroup((current) =>
                      current === group.key ? null : group.key,
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-(--clinic-navy) text-white"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  {group.label}
                  <IconChevronDown size={16} />
                </button>

                {desktopGroup === group.key ? (
                  <div className="absolute left-0 top-full z-[70] mt-3 w-[340px] rounded-[1.5rem] border border-slate-200 bg-white/96 p-3 shadow-2xl shadow-slate-300/35 backdrop-blur">
                    {group.links.map((link) => {
                      const current =
                        link.href === "/"
                          ? pathname === "/"
                          : pathname?.startsWith(link.href);

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setDesktopGroup(null)}
                          className={`block rounded-[1.2rem] px-4 py-3 transition ${
                            current
                              ? "bg-[var(--clinic-navy)] text-white"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <div
                            className={`font-medium ${
                              current ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {link.label}
                          </div>
                          <div
                            className={`mt-1 text-sm ${
                              current ? "text-white/80" : "text-slate-500"
                            }`}
                          >
                            {link.description}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {user ? (
            <Link
              href="/profile"
              onClick={() => setDesktopGroup(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname?.startsWith("/profile")
                  ? "bg-(--clinic-cyan) text-slate-950"
                  : "bg-cyan-50 text-cyan-900 hover:bg-cyan-100"
              }`}
            >
              Личный кабинет
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <Link
            href="/online-appointment"
            onClick={() => setDesktopGroup(null)}
            className="clinic-btn-accent text-sm"
          >
            Заказ талона
          </Link>
          <button
            onClick={handleLogin}
            className="inline-flex items-center justify-center rounded-full bg-[var(--clinic-navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#122547]"
          >
            {user ? "Выход" : "Вход"}
          </button>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => router.push("/admin")}
              className="hidden cursor-pointer rounded-lg border-2 border-gray-400 px-4 py-2 text-gray-400 transition-all hover:outline-2 xl:inline-block"
            >
              <IconTools />
            </button>
          )}
        </div>

        <button
          className="text-2xl text-slate-800 xl:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur xl:hidden">
          <nav className="flex flex-col gap-3 p-4">
            <Link
              href="/online-appointment"
              onClick={() => setOpen(false)}
              className="clinic-btn-accent"
            >
              Заказ талона
            </Link>
            {groups.map((group) => (
              <div
                key={group.key}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() =>
                    setMobileGroup((current) =>
                      current === group.key ? null : group.key,
                    )
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-slate-900"
                >
                  <span>{group.label}</span>
                  <IconChevronDown
                    size={16}
                    className={`transition ${
                      mobileGroup === group.key ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileGroup === group.key ? (
                  <div className="space-y-1 border-t border-slate-200 px-2 py-2">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-3 hover:bg-white"
                      >
                        <div className="font-medium text-slate-900">
                          {link.label}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {link.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {user && (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="rounded-[1.25rem] border border-cyan-200 bg-cyan-50 px-4 py-3 font-medium text-cyan-900"
              >
                Личный кабинет
              </Link>
            )}

            <button
              onClick={handleLogin}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--clinic-navy)] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#122547]"
            >
              {user ? "Выход" : "Вход для пациентов"}
            </button>
            {user?.role === "ADMIN" && (
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/admin");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600"
              >
                Админ-панель
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

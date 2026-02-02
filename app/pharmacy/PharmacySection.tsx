"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Medicine = {
  id: number;
  name: string;
  form: string;
  price: number;
  available: boolean;
  manufacturer: string;
  rating: number;
  reviews: number;
};

const MOCK: Medicine[] = [
  {
    id: 1,
    name: "Парацетамол",
    form: "Таблетки · 500 мг",
    price: 2.45,
    available: true,
    manufacturer: "Фармстандарт",
    rating: 4.7,
    reviews: 214,
  },
  {
    id: 2,
    name: "Ибупрофен",
    form: "Капсулы · 200 мг",
    price: 4.1,
    available: false,
    manufacturer: "Berlin-Chemie",
    rating: 4.8,
    reviews: 302,
  },
  {
    id: 3,
    name: "Нурофен",
    form: "Таблетки · 200 мг",
    price: 6.2,
    available: true,
    manufacturer: "Reckitt",
    rating: 4.9,
    reviews: 1120,
  },
  {
    id: 4,
    name: "Аспирин",
    form: "Таблетки · 500 мг",
    price: 1.9,
    available: true,
    manufacturer: "Bayer",
    rating: 4.5,
    reviews: 640,
  },
  {
    id: 5,
    name: "Цитрамон",
    form: "Таблетки",
    price: 1.3,
    available: true,
    manufacturer: "Фармстандарт",
    rating: 4.4,
    reviews: 410,
  },
  {
    id: 6,
    name: "Анальгин",
    form: "Таблетки · 500 мг",
    price: 1.1,
    available: false,
    manufacturer: "Обновление",
    rating: 4.2,
    reviews: 380,
  },
  {
    id: 7,
    name: "Лоратадин",
    form: "Таблетки · 10 мг",
    price: 3.4,
    available: true,
    manufacturer: "Ozon",
    rating: 4.6,
    reviews: 520,
  },
  {
    id: 8,
    name: "Супрастин",
    form: "Таблетки · 25 мг",
    price: 5.8,
    available: true,
    manufacturer: "Egis",
    rating: 4.7,
    reviews: 690,
  },
  {
    id: 9,
    name: "Амоксициллин",
    form: "Капсулы · 500 мг",
    price: 8.9,
    available: true,
    manufacturer: "Sandoz",
    rating: 4.8,
    reviews: 980,
  },
  {
    id: 10,
    name: "Азитромицин",
    form: "Таблетки · 500 мг",
    price: 9.4,
    available: false,
    manufacturer: "Teva",
    rating: 4.9,
    reviews: 860,
  },
  {
    id: 11,
    name: "Мезим",
    form: "Таблетки",
    price: 7.3,
    available: true,
    manufacturer: "Berlin-Chemie",
    rating: 4.6,
    reviews: 740,
  },
  {
    id: 12,
    name: "Эспумизан",
    form: "Капсулы",
    price: 6.9,
    available: true,
    manufacturer: "Berlin-Chemie",
    rating: 4.7,
    reviews: 560,
  },
  {
    id: 13,
    name: "Фосфалюгель",
    form: "Гель",
    price: 8.1,
    available: true,
    manufacturer: "Ipsen",
    rating: 4.8,
    reviews: 620,
  },
  {
    id: 14,
    name: "Но-шпа",
    form: "Таблетки · 40 мг",
    price: 4.6,
    available: true,
    manufacturer: "Sanofi",
    rating: 4.9,
    reviews: 1450,
  },
  {
    id: 15,
    name: "Пенталгин",
    form: "Таблетки",
    price: 3.9,
    available: true,
    manufacturer: "Отисифарм",
    rating: 4.5,
    reviews: 710,
  },
  {
    id: 16,
    name: "Кларитин",
    form: "Таблетки · 10 мг",
    price: 6.5,
    available: true,
    manufacturer: "Bayer",
    rating: 4.6,
    reviews: 480,
  },
  {
    id: 17,
    name: "Линекс",
    form: "Капсулы",
    price: 10.2,
    available: true,
    manufacturer: "Sandoz",
    rating: 4.7,
    reviews: 830,
  },
  {
    id: 18,
    name: "Витамин C",
    form: "Таблетки · 500 мг",
    price: 2.9,
    available: true,
    manufacturer: "Zentiva",
    rating: 4.3,
    reviews: 390,
  },
  {
    id: 19,
    name: "Магне B6",
    form: "Таблетки",
    price: 12.4,
    available: true,
    manufacturer: "Sanofi",
    rating: 4.8,
    reviews: 920,
  },
  {
    id: 20,
    name: "Цетрин",
    form: "Таблетки · 10 мг",
    price: 4.8,
    available: true,
    manufacturer: "Dr. Reddy’s",
    rating: 4.6,
    reviews: 560,
  },
];

type CartEntry = { item: Medicine; qty: number };
type Cart = Record<string, CartEntry>;

function safeParseCart(raw: string | null): Cart {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Cart;
  } catch {
    return {};
  }
}

function getCart(): Cart {
  if (typeof window === "undefined") return {};
  return safeParseCart(localStorage.getItem("cart_v2"));
}

function setCart(cart: Cart) {
  localStorage.setItem("cart_v2", JSON.stringify(cart));
}

function totalQty(cart: Cart) {
  return Object.values(cart).reduce((sum, e) => sum + (e?.qty ?? 0), 0);
}

function qtyById(cart: Cart, id: number) {
  return cart[String(id)]?.qty ?? 0;
}

type SortKey =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "reviews_desc";

export default function PharmacySection() {
  const [opened, setOpened] = useState<Medicine | null>(null);

  // cart state
  const [cart, setCartState] = useState<Cart>({});
  const [cartCount, setCartCount] = useState(0);

  // UI state
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // search/filter/sort
  const [q, setQ] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  // drawer a11y refs
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // init cart from localStorage
  useEffect(() => {
    const c = getCart();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartState(c);
    setCartCount(totalQty(c));
  }, []);

  // cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2000);
  }

  function addToCart(item: Medicine, delta = 1) {
    const next = { ...cart };
    const key = String(item.id);
    const current = next[key];

    const nextQty = (current?.qty ?? 0) + delta;
    if (nextQty <= 0) {
      delete next[key];
    } else {
      next[key] = { item, qty: nextQty };
    }

    setCart(next);
    setCartState(next);
    setCartCount(totalQty(next));

    const inCart = qtyById(next, item.id);
    showToast(
      delta > 0
        ? `«${item.name}» добавлен в корзину (×${inCart})`
        : `«${item.name}» уменьшен (×${inCart})`,
    );
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = MOCK;

    if (query) {
      list = list.filter((m) => {
        const hay = `${m.name} ${m.manufacturer} ${m.form}`.toLowerCase();
        return hay.includes(query);
      });
    }

    if (onlyAvailable) {
      list = list.filter((m) => m.available);
    }

    const sorted = [...list];
    switch (sort) {
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating_desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews_desc":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case "relevance":
      default:
        // Keep original order (MOCK order) as "relevance"
        break;
    }

    return sorted;
  }, [q, onlyAvailable, sort]);

  // Drawer: lock scroll + focus management + key handling
  useEffect(() => {
    if (!opened) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus first focusable element
    const focusFirst = () => {
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      (focusables[0] ?? root).focus();
    };

    // next tick after render
    const t = window.setTimeout(focusFirst, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!opened) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setOpened(null);
        return;
      }

      if (e.key === "Tab") {
        const root = drawerRef.current;
        if (!root) return;

        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          (el) =>
            !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"),
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;

      // restore focus
      previouslyFocusedRef.current?.focus?.();
      previouslyFocusedRef.current = null;
    };
  }, [opened]);

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <div className="max-w-350 mx-auto px-8 pt-24 pb-28">
        <h1 className="text-4xl font-semibold text-[#111827]">Онлайн-аптека</h1>
        <p className="text-[#6B7280] mt-2">Каталог лекарств</p>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-65">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию, форме, производителю…"
              className="w-full h-11 rounded-2xl border border-black/10 bg-white px-4 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <label className="flex items-center gap-2 bg-white border border-black/10 rounded-2xl px-4 h-11">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-[#111827]">В наличии</span>
          </label>

          <div className="bg-white border border-black/10 rounded-2xl px-3 h-11 flex items-center">
            <select
              title="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 bg-transparent outline-none text-sm text-[#111827]"
            >
              <option value="relevance">Сортировка: по умолчанию</option>
              <option value="price_asc">Цена: по возрастанию</option>
              <option value="price_desc">Цена: по убыванию</option>
              <option value="rating_desc">Рейтинг: высокий → низкий</option>
              <option value="reviews_desc">Отзывы: много → мало</option>
            </select>
          </div>

          <div className="text-sm text-[#6B7280] ml-auto">
            Найдено:{" "}
            <span className="text-[#111827] font-medium">
              {filtered.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6 mt-8">
          {filtered.map((item) => {
            const inCart = qtyById(cart, item.id);

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-xl p-4 cursor-pointer"
                onClick={() => setOpened(item)}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-[#6B7280]">{item.form}</div>
                <div className="text-xs mt-1">{item.manufacturer}</div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-[#6B7280]">
                    ★ {item.rating.toFixed(1)} · {item.reviews}
                  </div>
                  {!item.available && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                      Нет в наличии
                    </span>
                  )}
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="font-semibold">
                    {item.price.toFixed(2)} BYN
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item, 1);
                    }}
                    disabled={!item.available}
                    className={`px-3 py-1.5 rounded-xl text-sm ${
                      item.available
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    aria-label={
                      item.available
                        ? `Добавить ${item.name} в корзину`
                        : `${item.name} недоступен`
                    }
                  >
                    {inCart > 0 ? `В корзине: ${inCart}` : "В корзину"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CART BUTTON */}
      <Link
        href="/pharmacy/cart"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl"
        aria-label={`Корзина: ${cartCount} товаров`}
      >
        {cartCount}
      </Link>

      {/* TOAST */}
      {toast && (
        <div
          className="fixed bottom-24 right-6 bg-white border border-black/10 shadow-lg rounded-xl px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      {/* DRAWER */}
      <AnimatePresence>
        {opened && (
          <>
            <motion.div
              onClick={() => setOpened(null)}
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Товар: ${opened.name}`}
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed right-0 top-0 h-full w-110 bg-white z-50 p-6 overflow-y-auto outline-none"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setOpened(null)}
                  className="h-10 w-10 rounded-xl hover:bg-black/5"
                  aria-label="Закрыть"
                >
                  ✕
                </button>

                <div className="text-xs text-[#6B7280]">Esc — закрыть</div>
              </div>

              <h2 className="text-2xl font-semibold mt-6">{opened.name}</h2>
              <p className="text-[#6B7280]">{opened.form}</p>

              <div className="mt-3 text-sm text-[#6B7280]">
                {opened.manufacturer} · ★ {opened.rating.toFixed(1)} ·{" "}
                {opened.reviews} отзывов
              </div>

              <div className="mt-4 text-3xl font-semibold text-indigo-600">
                {opened.price.toFixed(2)} BYN
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => addToCart(opened, -1)}
                  disabled={qtyById(cart, opened.id) <= 0}
                  className="h-11 w-11 rounded-2xl border border-black/10 bg-white disabled:opacity-40"
                  aria-label="Уменьшить количество"
                >
                  −
                </button>

                <div className="min-w-30 text-center">
                  <div className="text-xs text-[#6B7280]">В корзине</div>
                  <div className="text-lg font-semibold">
                    {qtyById(cart, opened.id)}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(opened, 1)}
                  disabled={!opened.available}
                  className="flex-1 h-11 rounded-2xl bg-indigo-600 text-white disabled:bg-gray-200 disabled:text-gray-400"
                  aria-label="Добавить в корзину"
                >
                  Добавить
                </button>
              </div>

              {!opened.available && (
                <div className="mt-4 text-sm text-gray-500">
                  Сейчас нет в наличии. Можно добавить в избранное или
                  посмотреть аналоги (если добавишь этот функционал).
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

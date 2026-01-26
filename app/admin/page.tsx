import Link from "next/link";

const tabs = [
  { href: "/admin/doctors", label: "Доктора" },
  { href: "/admin/schedule", label: "Расписания" },
  { href: "/admin/patients", label: "Пациенты" },
];

export default function Admin() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-6 pt-12">
        {tabs.map((tab, i) => (
          <Link
            key={i}
            href={tab.href}
            className="
              bg-blue-600 text-white
              px-6 py-5
              rounded-xl
              font-bold text-lg
              w-full max-w-xl
              text-center
              transition-all duration-300
              hover:scale-105
            "
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

const tabs = [
  { href: "/admin/doctors", label: "Доктора" },
  { href: "/admin/schedule", label: "Расписания" },
];

export default function Admin() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-4 pt-4">
        {tabs.map((tab, i) => (
          <Link
            key={i}
            href={tab.href}
            className="bg-blue-600 text-white p-4 rounded-lg font-bold transition-all flex items-center justify-center w-full md:w-1/3 hover:scale-105 duration-500"
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DAY_LABELS: Record<number, string> = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.toLowerCase() || "";
  const specialty = searchParams.get("specialty") || "";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dayFilter = searchParams.get("day") || "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14);

  const schedules = await prisma.schedule.findMany({
    where: {
      date: {
        gte: today,
        lte: maxDate,
      },
      doctor: {
        user: {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        doctorSpecialties: specialty
          ? {
              some: {
                specialty: {
                  name: specialty,
                },
              },
            }
          : undefined,
      },
    },
    include: {
      doctor: {
        include: {
          user: true,
          doctorSpecialties: {
            include: {
              specialty: true,
            },
          },
        },
      },
      appointments: true,
    },
    orderBy: [
  { startDateTime: "asc" }
]

  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new Map<number, any>();

  for (const s of schedules) {
    const d = s.doctor;
    if (!map.has(d.id)) {
      map.set(d.id, {
        name: d.user.fullName,
        specialty: d.doctorSpecialties[0]?.specialty.name ?? "",
        room: d.room,
        days: new Set<string>(),
        times: [],
        exp: d.experience,
        busyCount: 0,
      });
    }

    const item = map.get(d.id);
    const day = DAY_LABELS[s.date.getDay()];
    if (day) item.days.add(day);

    item.times.push(s.startDateTime);
    if (s.appointments.length) item.busyCount++;
  }

  const result = Array.from(map.values()).map((d) => {
    const times = d.times.sort((a: Date, b: Date) => a.getTime() - b.getTime());
    const start = times[0];
    const end = times[times.length - 1];

    return {
      name: d.name,
      specialty: d.specialty,
      room: d.room,
      days: Array.from(d.days),
      time: `${start.getHours().toString().padStart(2, "0")}:${start
        .getMinutes()
        .toString()
        .padStart(2, "0")}–${end.getHours().toString().padStart(2, "0")}:${end
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      status: d.busyCount ? "busy" : "available",
      exp: d.exp,
    };
  });

  return NextResponse.json(result);
}

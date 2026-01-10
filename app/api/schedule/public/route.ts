import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DAY_LABELS: Record<number, string> = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
  7: "Вс",
};

type DoctorAgg = {
  name: string;
  specialties: string[];
  room: number | null;
  days: Set<string>;
  times: Date[];
  exp: number;
  busyCount: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim() || "";
  const specialty = searchParams.get("specialty")?.trim() || "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14);

  const schedules = await prisma.schedule.findMany({
    where: {
      startDateTime: {
        gte: today,
        lte: maxDate,
      },
      doctor: {
        ...(search && {
          user: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
        ...(specialty && {
          doctorSpecialties: {
            some: {
              specialty: {
                name: specialty,
              },
            },
          },
        }),
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
      appointments: {
        select: { id: true },
      },
    },
    orderBy: [{ startDateTime: "asc" }],
  });

  const map = new Map<number, DoctorAgg>();

  for (const s of schedules) {
    const d = s.doctor;

    if (!map.has(d.id)) {
      map.set(d.id, {
        name: d.user.fullName,
        specialties: d.doctorSpecialties.map((ds) => ds.specialty.name),
        room: d.room,
        days: new Set<string>(),
        times: [],
        exp: d.experience,
        busyCount: 0,
      });
    }

    const item = map.get(d.id)!;

    const jsDay = s.startDateTime.getDay(); // 0-6
    const day = DAY_LABELS[jsDay === 0 ? 7 : jsDay];
    if (day) item.days.add(day);

    item.times.push(s.startDateTime);
    if (s.appointments.length) item.busyCount++;
  }

  const result = Array.from(map.values()).map((d) => {
    const times = d.times.sort((a, b) => a.getTime() - b.getTime());

    const start = times[0];
    const end = times[times.length - 1];

    const startHH = start.getHours().toString().padStart(2, "0");
    const startMM = start.getMinutes().toString().padStart(2, "0");
    const endHH = end.getHours().toString().padStart(2, "0");
    const endMM = end.getMinutes().toString().padStart(2, "0");

    return {
      name: d.name,
      specialties: d.specialties,
      room: d.room,
      days: Array.from(d.days),
      time: `${startHH}:${startMM}-${endHH}:${endMM}`,
      status: d.busyCount === d.times.length ? "busy" : "available",
      exp: d.exp,
    };
  });

  return NextResponse.json(result);
}

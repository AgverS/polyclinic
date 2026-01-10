import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* =====================
   HELPERS
===================== */

function getNextMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}

/* =====================
   GET — расписание врача (14 дней)
===================== */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = Number(searchParams.get("doctorId"));

  if (!Number.isInteger(doctorId)) {
    return NextResponse.json(
      { error: "doctorId is required" },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 14);

  const schedules = await prisma.schedule.findMany({
    where: {
      doctorId,
      startDateTime: {
        gte: today,
        lte: maxDate,
      },
    },
    orderBy: { startDateTime: "asc" },
  });

  return NextResponse.json(schedules);
}

/* =====================
   POST — сохранить расписание (перезапись недели)
===================== */

export async function POST(req: Request) {
  const { doctorId, slots } = (await req.json()) as {
    doctorId: number;
    slots: string[];
  };

  if (!Number.isInteger(doctorId) || !Array.isArray(slots)) {
    return NextResponse.json(
      { error: "doctorId and slots are required" },
      { status: 400 }
    );
  }

  const weekStart = getNextMonday();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 5);

  const dayMap: Record<string, number> = {
    mon: 0,
    tue: 1,
    wed: 2,
    thu: 3,
    fri: 4,
  };

  await prisma.$transaction(async (tx) => {
    // удалить старое расписание недели
    await tx.schedule.deleteMany({
      where: {
        doctorId,
        startDateTime: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    // создать новые слоты
    for (const slot of slots) {
      const [dayKey, time] = slot.split("_");
      const dayOffset = dayMap[dayKey];
      if (dayOffset === undefined) continue;

      const [h, m] = time.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) continue;

      const startDateTime = new Date(weekStart);
      startDateTime.setDate(weekStart.getDate() + dayOffset);
      startDateTime.setHours(h, m, 0, 0);

      const endDateTime = addMinutes(startDateTime, 30);

      await tx.schedule.create({
        data: {
          doctorId,
          startDateTime,
          endDateTime,
        },
      });
    }
  });

  return NextResponse.json({ success: true });
}

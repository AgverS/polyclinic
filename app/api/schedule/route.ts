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
   GET — расписание для пользователя / админа
   (пользователь видит максимум 14 дней)
===================== */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = Number(searchParams.get("doctorId"));

  if (!doctorId) {
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
    orderBy: [{ startDateTime: "asc" }],
  });

  return NextResponse.json(schedules);
}

/* =====================
   POST — сохранение расписания (АДМИН)
   Перезаписывает неделю
===================== */

export async function POST(req: Request) {
  const body = await req.json();

  const { doctorId, slots } = body as {
    doctorId: number;
    slots: string[]; // ["mon_09:00", "tue_10:30"]
  };

  if (!doctorId || !Array.isArray(slots)) {
    return NextResponse.json(
      { error: "doctorId and slots are required" },
      { status: 400 }
    );
  }

  const weekStart = getNextMonday();

  const dayMap: Record<string, number> = {
    mon: 0,
    tue: 1,
    wed: 2,
    thu: 3,
    fri: 4,
  };

  await prisma.$transaction(
    async (tx: {
      schedule: {
        deleteMany: (arg0: {
          where: { doctorId: number; date: { gte: Date; lt: Date } };
        }) => unknown;
        create: (arg0: {
          data: {
            doctorId: number;
            date: Date;
            startDateTime: Date;
            endDateTime: Date;
          };
        }) => unknown;
      };
    }) => {
      // 1. удалить старое расписание этой недели
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 5);

      await tx.schedule.deleteMany({
        where: {
          doctorId,
          date: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      });

      // 2. создать новые слоты
      for (const slot of slots) {
        const [dayKey, time] = slot.split("_");
        const dayOffset = dayMap[dayKey];

        if (dayOffset === undefined) continue;

        const [h, m] = time.split(":").map(Number);

        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayOffset);

        const startTime = new Date(date);
        startTime.setHours(h, m, 0, 0);

        const endDateTime = addMinutes(startTime, 30);

        await tx.schedule.create({
          data: {
            doctorId,
            date,
            startDateTime: startTime,
            endDateTime,
          },
        });
      }
    }
  );

  return NextResponse.json({ success: true });
}

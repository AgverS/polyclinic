import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const specialty = searchParams.get("specialty") || "";
    const day = searchParams.get("day") || "";

    const doctors = await prisma.doctor.findMany({
      include: {
        doctorSpecialties: {
          include: {
            specialty: true,
          },
        },
        schedules: true,
      },
    });

    // 👉 трансформация под твой фронт
    const result = doctors
      .map((doctor) => {
        const specialties = doctor.doctorSpecialties.map(
          (ds) => ds.specialty.name
        );

        const schedules = doctor.schedules.map((s) => {
          const weekday = s.date.toLocaleDateString("ru-RU", {
            weekday: "short",
          });

          return {
            day: weekday,
            time: `${s.startTime.toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })} – ${s.endTime.toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
          };
        });

        return {
          name: `Врач №${doctor.id}`, // временно
          specialty: specialties[0] ?? "",
          room: doctor.id * 10, // временно
          days: schedules.map((s) => s.day),
          time: schedules.map((s) => s.time).join(", "),
          status: schedules.length ? "available" : "busy",
          exp: 5 + doctor.id, // временно
        };
      })
      // 🔍 фильтры
      .filter((d) => {
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (specialty && d.specialty !== specialty) return false;
        if (day && !d.days.includes(day)) return false;
        return true;
      });

    return NextResponse.json(result);
  } catch (error) {
    console.error("SCHEDULE_ERROR:", error);
    return NextResponse.json(
      { message: "Ошибка загрузки расписания" },
      { status: 500 }
    );
  }
}

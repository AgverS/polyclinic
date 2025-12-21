import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const specialty = searchParams.get("specialty") ?? "";
    const day = searchParams.get("day") ?? "";

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

    const result = doctors
      .map((doctor) => {
        const specialties = doctor.doctorSpecialties.map(
          (ds) => ds.specialty.name
        );

        const schedules = doctor.schedules.map((s) => {
          const weekday = s.startDateTime.toLocaleDateString("ru-RU", {
            weekday: "short",
          });

          return {
            day: weekday,
            time: `${s.startDateTime.toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })} – ${s.endDateTime.toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
          };
        });

        return {
          name: `Врач №${doctor.id}`,
          specialty: specialties[0] ?? "",
          room: doctor.room,
          days: schedules.map((s) => s.day),
          time: schedules.map((s) => s.time).join(", "),
          status: schedules.length ? "available" : "busy",
          exp: doctor.experience,
        };
      })
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

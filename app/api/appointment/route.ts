import { AppointmentStatus, Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // ВРЕМЕННО. Фикс для учебного проекта
  const user = { id: 1, role: Role.PATIENT };

  const { scheduleId } = await req.json();

  if (!scheduleId) {
    return NextResponse.json(
      { message: "scheduleId не передан" },
      { status: 400 }
    );
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: Number(scheduleId) },
  });

  if (!schedule) {
    return NextResponse.json(
      { message: "Расписание не найдено" },
      { status: 404 }
    );
  }

  if (schedule.startDateTime < new Date()) {
    return NextResponse.json({ message: "Прошедшая дата" }, { status: 400 });
  }

  const exists = await prisma.appointment.findFirst({
    where: { scheduleId: schedule.id },
  });

  if (exists) {
    return NextResponse.json(
      { message: "Расписание уже занято" },
      { status: 409 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: schedule.doctorId,
      scheduleId: schedule.id,
      patientId: user.id,
      status: AppointmentStatus.PENDING,
    },
  });

  return NextResponse.json(appointment);
}

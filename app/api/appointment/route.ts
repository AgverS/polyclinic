import { requireRole } from "@/lib/auth";
import { AppointmentStatus, Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (req as any).user;
  const { doctorId, date, time } = await req.json();

  const startDateTime = buildStartDateTime(date, time);
  const now = new Date();

  if (startDateTime < now) throw new Error("Прошедшая дата");

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);

  if (startDateTime > maxDate) throw new Error("Слишком поздняя дата");

  const schedule = await prisma.schedule.findFirst({
    where: {
      doctorId,
      startDateTime,
    },
  });

  if (!schedule) throw new Error("Расписание не найдено");

  const exists = await prisma.appointment.findFirst({
    where: { scheduleId: schedule.id },
  });

  if (exists) throw new Error("Расписание уже занято");

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      scheduleId: schedule.id,
      patientId: session.patientId,
      status: AppointmentStatus.PENDING,
    },
  });

  return NextResponse.json(appointment);
}

function buildStartDateTime(date: string, time: string): Date {
  // "2025-01-10" + "10:00" → "2025-01-10T10:00:00"
  const dateTimeString = `${date}T${time}:00`;
  const result = new Date(dateTimeString);

  if (isNaN(result.getTime())) {
    throw new Error("Некорректная дата или время");
  }

  return result;
}

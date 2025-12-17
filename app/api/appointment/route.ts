import { requireRole } from "@/lib/auth";
import { AppointmentStatus, Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = (req as any).user;
  const { doctorId, date, time } = await req.json();

  const targetDate = new Date(date);
  const now = new Date();

  if (targetDate < now) throw new Error("Прошедшая дата");

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);

  if (targetDate > maxDate) throw new Error("Слишком поздняя дата");

  const schedule = await prisma.schedule.findFirst({
    where: {
      doctorId,
      date: targetDate,
      startTime: new Date(time),
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

import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { APPOINTMENT_STATUSES, ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== ROLES.PATIENT) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Профиль пациента не найден" },
      { status: 404 },
    );
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
    },
    include: {
      schedule: true,
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
    },
    orderBy: [{ schedule: { startDateTime: "desc" } }, { createdAt: "desc" }],
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== ROLES.PATIENT) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { scheduleId } = await req.json();

  if (!scheduleId) {
    return NextResponse.json(
      { message: "scheduleId не передан" },
      { status: 400 },
    );
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: Number(scheduleId) },
  });

  if (!schedule) {
    return NextResponse.json(
      { message: "Расписание не найдено" },
      { status: 404 },
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
      { status: 409 },
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.id },
    select: { id: true },
  });

  if (!patient) {
    return NextResponse.json(
      { message: "Профиль пациента не найден" },
      { status: 404 },
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: schedule.doctorId,
      scheduleId: schedule.id,
      patientId: patient.id,
      status: APPOINTMENT_STATUSES.PENDING,
    },
  });

  return NextResponse.json(appointment);
}

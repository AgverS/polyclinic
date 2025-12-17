import { AppointmentStatus, Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: any) {
  const session = (req as any).user;
  const { status } = await req.json();

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(params.id) },
  });

  if (!appointment) throw new Error("Not found");

  if (session.role === Role.PATIENT && status !== AppointmentStatus.CANCELLED) {
    throw new Error("Forbidden");
  }

  if (
    session.role === Role.DOCTOR ||
    session.role === Role.ADMIN ||
    status === AppointmentStatus.CANCELLED
  ) {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
    });

    return NextResponse.json(updated);
  }

  throw new Error("Forbidden");
}

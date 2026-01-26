import { AppointmentStatus, Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, { params }: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (req as any).user;
  const { status } = await req.json();

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(params.id) },
  });

  if (!appointment) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (session.role === Role.PATIENT && status !== AppointmentStatus.CANCELLED) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { APPOINTMENT_STATUSES, ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (
    session.role === ROLES.PATIENT &&
    status !== APPOINTMENT_STATUSES.CANCELLED
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (
    session.role === ROLES.DOCTOR ||
    session.role === ROLES.ADMIN ||
    status === APPOINTMENT_STATUSES.CANCELLED
  ) {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { APPOINTMENT_STATUSES, ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

function parseId(id: string) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== ROLES.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const numericId = parseId(id);
  if (!numericId) {
    return NextResponse.json({ message: "Некорректный id" }, { status: 400 });
  }

  const { status } = (await req.json()) as { status?: string };
  if (!status || !(status in APPOINTMENT_STATUSES)) {
    return NextResponse.json(
      { message: "Некорректный статус" },
      { status: 400 },
    );
  }

  const updated = await prisma.homeCall.update({
    where: { id: numericId },
    data: { status: status as keyof typeof APPOINTMENT_STATUSES },
  });

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/types";
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

  const { isRead } = (await req.json()) as { isRead?: boolean };
  if (typeof isRead !== "boolean") {
    return NextResponse.json(
      { message: "Поле isRead обязательно" },
      { status: 400 },
    );
  }

  const updated = await prisma.feedback.update({
    where: { id: numericId },
    data: { isRead },
  });

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const userId = Number(id);

  if (Number.isNaN(userId)) {
    return NextResponse.json({ message: "Некорректный id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Пользователь не найден" },
      { status: 404 }
    );
  }

  const { password: _, ...safeUser } = user;

  return NextResponse.json(safeUser);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, { params }: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (req as any).user;
  const id = Number(params.id);

  if (session.role !== Role.ADMIN && session.id !== id) {
    throw new Error("Forbidden");
  }

  const data = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return NextResponse.json(user);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, { params }: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (req as any).user;
  requireRole(session, [Role.ADMIN]);

  await prisma.user.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ ok: true });
}

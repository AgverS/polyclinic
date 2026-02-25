import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/types";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const role = req.headers.get("x-user-role");

  if (role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/types";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");

  if (role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patients = await prisma.user.findMany({
    where: { role: ROLES.PATIENT },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
  });

  return NextResponse.json(patients);
}

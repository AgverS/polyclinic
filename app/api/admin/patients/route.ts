import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");

  if (role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patients = await prisma.user.findMany({
    where: { role: Role.PATIENT },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
  });

  return NextResponse.json(patients);
}

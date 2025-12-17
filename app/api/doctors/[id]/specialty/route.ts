import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: any) {
  const session = (req as any).user;
  requireRole(session, [Role.ADMIN]);

  const { name } = await req.json();

  const specialty = await prisma.specialty.findFirst({ where: { name } });

  if (!specialty) throw new Error("Специальность не найдена");

  const record = await prisma.doctorSpecialty.create({
    data: {
      doctorId: Number(params.id),
      specialtyId: specialty.id,
    },
  });

  return NextResponse.json(record);
}

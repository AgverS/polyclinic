import { checkRoles } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const res = checkRoles(req, [ROLES.ADMIN]);
  if (res) {
    return NextResponse.json({ message: res.message }, { status: res.status });
  }

  const { name } = await req.json();

  const { id } = await params;

  const specialty = await prisma.specialty.findFirst({ where: { name } });

  if (!specialty) throw new Error("Специальность не найдена");

  const record = await prisma.doctorSpecialty.create({
    data: {
      doctorId: Number(id),
      specialtyId: specialty.id,
    },
  });

  return NextResponse.json(record);
}

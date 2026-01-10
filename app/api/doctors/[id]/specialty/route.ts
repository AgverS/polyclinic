import { checkRoles } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: NextRequest, { params }: any) {
  const res = checkRoles(req, [Role.ADMIN]);
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

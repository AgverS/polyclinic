import { getUserFromRequest, requireRole } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      throw new Error("Unauthorized");
    }

    requireRole(user, [Role.ADMIN]);
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 401 },
    );
  }

  const { name } = await req.json();

  const specialty = await prisma.specialty.findFirst({ where: { name } });

  if (!specialty)
    return NextResponse.json(
      { message: "Специальность не найдена" },
      { status: 404 },
    );

  const { id } = await params;
  const doctorId = Number(id);

  if (Number.isNaN(doctorId)) {
    return NextResponse.json(
      { message: "Некорректный id врача" },
      { status: 400 },
    );
  }

  const record = await prisma.doctorSpecialty.create({
    data: {
      doctorId,
      specialtyId: specialty.id,
    },
  });

  return NextResponse.json(record);
}

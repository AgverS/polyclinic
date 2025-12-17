import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const specId = Number(id);

  if (Number.isNaN(specId)) {
    return NextResponse.json({ message: "Некорректный id" }, { status: 400 });
  }

  const specialty = await prisma.specialty.findFirst({
    where: { doctorSpecialties: { every: { doctorId: specId } } },
  });

  if (!specialty) {
    return NextResponse.json(
      { message: "Специальность не найдена" },
      { status: 404 },
    );
  }

  return NextResponse.json(specialty);
}

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const specId = Number(id);

  if (!Number.isInteger(specId)) {
    return NextResponse.json({ message: "Некорректный id" }, { status: 400 });
  }

  const specialty = await prisma.specialty.findUnique({
    where: { id: specId },
    include: {
      doctorSpecialties: true,
    },
  });

  if (!specialty) {
    return NextResponse.json(
      { message: "Специальность не найдена" },
      { status: 404 }
    );
  }

  return NextResponse.json(specialty);
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const specialties = await prisma.specialty.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const slots = await prisma.homeCallSlot.findMany({
    where: { isActive: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    specialties: specialties.map((s) => s.name),
    slots,
  });
}

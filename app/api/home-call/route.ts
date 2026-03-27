import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.role === ROLES.ADMIN) {
    const calls = await prisma.homeCall.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(calls);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { fullName: true },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Пользователь не найден" },
      { status: 404 },
    );
  }

  const calls = await prisma.homeCall.findMany({
    where: { fullName: user.fullName },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(calls);
}

export async function POST(req: NextRequest) {
  const session = getUserFromRequest(req);
  const body = (await req.json()) as {
    fullName?: string;
    phone?: string;
    address?: string;
    doctor?: string;
    date?: string;
    time?: string;
  };

  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const doctor = String(body.doctor ?? "").trim();
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();

  if (!phone || !address || !doctor || !date || !time) {
    return NextResponse.json(
      { message: "Не все поля заполнены" },
      { status: 400 },
    );
  }

  let resolvedFullName = fullName;
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { fullName: true },
    });
    resolvedFullName = user?.fullName ?? fullName;
  }

  if (!resolvedFullName) {
    return NextResponse.json(
      { message: "ФИО обязательно" },
      { status: 400 },
    );
  }

  const homeCall = await prisma.homeCall.create({
    data: {
      fullName: resolvedFullName,
      phone,
      address,
      doctor,
      date,
      time,
    },
  });

  return NextResponse.json({ success: true, homeCall }, { status: 201 });
}

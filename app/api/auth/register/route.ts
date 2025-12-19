import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function POST(req: NextRequest) {
  const { email, fullName, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email и пароль обязательны" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    return NextResponse.json(
      { message: "Пользователь уже существует" },
      { status: 401 },
    );
  }

  const registered = await prisma.user.create({
    data: {
      email,
      fullName,
      password: await hashPassword(password),
    },
  });

  await prisma.patient.create({
    data: {
      userId: registered.id,
    },
  });

  const { password: _, ...safeUser } = registered;

  return NextResponse.json(safeUser);
}

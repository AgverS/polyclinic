import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import { generateJwt } from "@/lib/jwt";
import { validateRegisterPayload } from "@/lib/validation/auth";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function POST(req: NextRequest) {
  const payload = validateRegisterPayload(
    (await req.json()) as Record<string, unknown>,
  );
  if (!payload.ok) {
    return NextResponse.json({ message: payload.message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (user) {
    return NextResponse.json(
      { message: "Пользователь уже существует" },
      { status: 409 },
    );
  }

  const registered = await prisma.user.create({
    data: {
      email: payload.email,
      fullName: payload.fullName,
      password: await hashPassword(payload.password),
    },
  });

  await prisma.patient.create({
    data: {
      userId: registered.id,
    },
  });

  const token = generateJwt(registered);

  return NextResponse.json(token);
}

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateJwt } from "@/lib/jwt";
import { validateLoginPayload } from "@/lib/validation/auth";

export async function POST(req: NextRequest) {
  const payload = validateLoginPayload(
    (await req.json()) as Record<string, unknown>,
  );
  if (!payload.ok) {
    return NextResponse.json({ message: payload.message }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Неверный логин или пароль" },
      { status: 401 },
    );
  }

  const isValid = await bcrypt.compare(payload.password, user.password);

  if (!isValid) {
    return NextResponse.json(
      { message: "Неверный логин или пароль" },
      { status: 401 },
    );
  }

  const token = generateJwt(user);

  return NextResponse.json(token);
}

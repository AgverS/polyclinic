console.log("FEEDBACK API HIT");

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    const userId = Number(body.userId);

    if (!name || !email || !subject || !message || !userId) {
      return NextResponse.json(
        { message: "Все поля обязательны" },
        { status: 400 }
      );
    }

    await prisma.feedback.create({
      data: {
        name,
        email,
        subject,
        message,
        userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Сообщение отправлено",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("FEEDBACK ERROR:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

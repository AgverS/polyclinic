import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type HomeCallBody = {
  fullName: string;
  phone: string;
  address: string;
  doctor: string;
  date: string;
  time: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: HomeCallBody = await req.json();

    const { fullName, phone, address, doctor, date, time } = body;

    if (!fullName || !phone || !address || !doctor || !date || !time) {
      return NextResponse.json(
        { message: "Не все поля заполнены" },
        { status: 400 },
      );
    }

    const homeCall = await prisma.homeCall.create({
      data: {
        fullName,
        phone,
        address,
        doctor,
        date,
        time,
      },
    });

    return NextResponse.json({ success: true, homeCall }, { status: 200 });
  } catch (error) {
    console.error("HOME_CALL_ERROR:", error);

    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

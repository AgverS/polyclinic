import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: NextRequest) {
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

  if (!fullName || !phone || !address || !doctor || !date || !time) {
    return NextResponse.json(
      { message: "Не все поля заполнены" },
      { status: 400 },
    );
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText("Талон вызова врача на дом", {
    x: 50,
    y: 780,
    size: 20,
    font: boldFont,
    color: rgb(0.07, 0.13, 0.22),
  });

  const lines = [
    `Пациент: ${fullName}`,
    `Телефон: ${phone}`,
    `Адрес: ${address}`,
    "",
    `Специальность врача: ${doctor}`,
    `Дата: ${date}`,
    `Время: ${time}`,
  ];

  let y = 730;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y,
      size: 13,
      font,
      color: rgb(0.15, 0.19, 0.24),
    });
    y -= 28;
  }

  page.drawText("Поликлиника №26", {
    x: 50,
    y: 90,
    size: 12,
    font: boldFont,
    color: rgb(0.07, 0.13, 0.22),
  });

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="home-call-ticket.pdf"',
    },
  });
}

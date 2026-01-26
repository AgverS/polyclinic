import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DoctorCategory, Role } from "@/lib/generated/prisma";
import bcrypt from "bcrypt";

/* =====================
   GET (у тебя уже был, оставляю)
===================== */
export async function GET(req: NextRequest) {
  const { search, specialty, category, quickFilter } = Object.fromEntries(
    req.nextUrl.searchParams
  );

  const doctors = await prisma.doctor.findMany({
    where: {
      ...(category && { category: category as DoctorCategory }),

      ...(search && {
        user: {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),

      ...(specialty && {
        doctorSpecialties: {
          some: {
            specialty: {
              name: specialty,
            },
          },
        },
      }),

      ...(quickFilter === "highest" && { category: "HIGHEST" }),
      ...(quickFilter === "experience" && { experience: { gte: 10 } }),
      ...(quickFilter === "pediatric" && {
        doctorSpecialties: {
          some: { specialty: { name: "Педиатр" } },
        },
      }),
    },

    include: {
      user: true,
      doctorSpecialties: {
        include: { specialty: true },
      },
    },

    orderBy: {
      user: { fullName: "asc" },
    },
  });

  return NextResponse.json(doctors);
}

/* =====================
   POST - добавить врача
===================== */
export async function POST(req: NextRequest) {
  const { fullName, email, password, specialty, room, experience } =
    await req.json();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "Пользователь с таким email уже существует" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: Role.DOCTOR,
      },
    });

    const doctor = await tx.doctor.create({
      data: {
        userId: user.id,
        room,
        experience,
      },
    });

    const spec = await tx.specialty.findFirst({
      where: { name: specialty },
    });

    if (!spec) {
      throw new Error("Специальность не найдена");
    }

    await tx.doctorSpecialty.create({
      data: {
        doctorId: doctor.id,
        specialtyId: spec.id,
      },
    });

    return doctor;
  });

  return NextResponse.json(result);
}

/* =====================
   PUT - редактировать врача
===================== */
export async function PUT(req: NextRequest) {
  const { id, form } = await req.json();

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!doctor) {
    return NextResponse.json({ message: "Врач не найден" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: doctor.userId },
      data: {
        fullName: form.fullName,
        ...(form.password && {
          password: await bcrypt.hash(form.password, 10),
        }),
      },
    });

    await tx.doctor.update({
      where: { id },
      data: {
        room: form.room,
        experience: form.experience,
      },
    });

    const spec = await tx.specialty.findFirst({
      where: { name: form.specialty },
    });

    if (!spec) {
      throw new Error("Специальность не найдена");
    }

    await tx.doctorSpecialty.deleteMany({
      where: { doctorId: id },
    });

    await tx.doctorSpecialty.create({
      data: {
        doctorId: id,
        specialtyId: spec.id,
      },
    });
  });

  return NextResponse.json({ ok: true });
}

/* =====================
   DELETE - удалить врача
===================== */
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const doctor = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!doctor) {
    return NextResponse.json({ message: "Врач не найден" }, { status: 404 });
  }

  // каскадом удалится DoctorSpecialty, Schedule, Appointment
  await prisma.user.delete({
    where: { id: doctor.userId },
  });

  return NextResponse.json({ ok: true });
}

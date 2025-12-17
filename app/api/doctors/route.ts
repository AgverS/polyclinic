import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DoctorCategory, Role } from "@/lib/generated/prisma";
import { hashPassword } from "@/lib/utils";

// GET — список врачей
export async function GET() {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      doctorSpecialties: {
        include: {
          specialty: true,
        },
      },
    },
  });

  return NextResponse.json(doctors);
}

// POST — создание врача
export async function POST(req: Request) {
  const { email, fullName, password, room, experience, specialty } =
    await req.json();

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      fullName: fullName,
      role: Role.DOCTOR,
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      room: room,
      experience: experience,
      category: DoctorCategory.FIRST,
      userId: user.id,
    },
  });

  if (specialty) {
    await prisma.doctorSpecialty.create({
      data: {
        doctorId: doctor.id,
        specialtyId: (
          await prisma.specialty.findFirstOrThrow({
            where: { name: specialty },
          })
        ).id,
      },
    });
  }

  return NextResponse.json({ id: doctor.id });
}

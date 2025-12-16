/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DoctorCategory, Role } from "@/lib/generated/prisma";

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

  const result = doctors.map(
    (d: {
      id: any;
      user: { fullName: any };
      doctorSpecialties: { specialty: { name: any } }[];
      room: any;
      experience: any;
    }) => ({
      id: d.id,
      fullName: d.user.fullName,
      specialty: d.doctorSpecialties[0]?.specialty.name ?? "",
      room: d.room,
      experience: d.experience,
    })
  );

  return NextResponse.json(result);
}

// POST — создание врача
export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.create({
    data: {
      email: body.email, // обязательно!
      password: body.password, // временно, потом хеш
      fullName: body.fullName,
      role: Role.DOCTOR,
    },
  });

  const doctor = await prisma.doctor.create({
    data: {
      room: body.room,
      experience: body.experience,
      category: DoctorCategory.FIRST,
      userId: user.id,
    },
  });

  // привязка специальности
  if (body.specialtyId) {
    await prisma.doctorSpecialty.create({
      data: {
        doctorId: doctor.id,
        specialtyId: body.specialtyId,
      },
    });
  }

  return NextResponse.json({ id: doctor.id });
}

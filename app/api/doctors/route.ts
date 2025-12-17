import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DoctorCategory, Role } from "@/lib/generated/prisma";
import { hashPassword } from "@/lib/utils";
import { FormSchema } from "@/app/admin/doctors/page";

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

export async function POST(req: NextRequest) {
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

export async function PUT(req: NextRequest) {
  const { form, id }: { form: FormSchema; id: number } = await req.json();
  const { email, specialty, experience, fullName, password, room } = form;

  const spec = await prisma.specialty.findFirst({
    where: { name: specialty },
  });

  if (!spec) {
    return NextResponse.json(
      { message: "Специальность не найдена" },
      { status: 404 },
    );
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      doctorSpecialties: true,
    },
  });

  if (!doctor) {
    return NextResponse.json({ message: "Врач не найден" }, { status: 404 });
  }

  let hashedPassword: string | undefined = undefined;

  if (password && password.trim() !== "") {
    hashedPassword = await hashPassword(password);
  }

  await prisma.user.update({
    where: { id: doctor.userId },
    data: {
      email,
      fullName,
      ...(hashedPassword && { password: hashedPassword }),
    },
  });

  await prisma.doctor.update({
    where: { id },
    data: {
      experience,
      room,
    },
  });

  await prisma.doctorSpecialty.update({
    where: {
      id: doctor.doctorSpecialties[0].id,
    },
    data: {
      specialtyId: spec.id,
    },
  });

  return NextResponse.json({ success: true });
}

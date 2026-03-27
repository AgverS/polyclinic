import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import bcrypt from "bcrypt";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import prisma from "../lib/prisma";
import { getUserFromAuthHeader } from "../lib/auth";
import { generateJwt } from "../lib/jwt";
import {
  APPOINTMENT_STATUSES,
  DOCTOR_CATEGORIES,
  ROLES,
  type AppointmentStatus,
  type DoctorCategory,
} from "../lib/types";
import {
  validateLoginPayload,
  validateRegisterPayload,
} from "../lib/validation/auth";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

function wrap(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getSession(req: Request) {
  return getUserFromAuthHeader(headerValue(req.headers.authorization));
}

function getRoleHeader(req: Request) {
  return headerValue(req.headers["x-user-role"]);
}

function getNextMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}

const DAY_LABELS: Record<number, string> = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
  7: "Вс",
};

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      db: "up",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      db: "down",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get(
  "/admin/patients",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== ROLES.ADMIN) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const patients = await prisma.user.findMany({
      where: { role: ROLES.PATIENT },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    res.json(patients);
  }),
);

router.delete(
  "/admin/patients/:id",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== ROLES.ADMIN) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.user.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ ok: true });
  }),
);

router.get(
  "/admin/overview",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== ROLES.ADMIN) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [
      doctors,
      patients,
      appointments,
      homeCalls,
      unreadFeedback,
      pharmacyOrders,
      recentHomeCalls,
      recentFeedback,
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.user.count({ where: { role: ROLES.PATIENT } }),
      prisma.appointment.count(),
      prisma.homeCall.count(),
      prisma.feedback.count({ where: { isRead: false } }),
      prisma.pharmacyOrder.count(),
      prisma.homeCall.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          doctor: true,
          date: true,
          time: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.feedback.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          subject: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      stats: {
        doctors,
        patients,
        appointments,
        homeCalls,
        unreadFeedback,
        pharmacyOrders,
      },
      recentHomeCalls,
      recentFeedback,
    });
  }),
);

router.get(
  "/admin/home-calls",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== ROLES.ADMIN) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const calls = await prisma.homeCall.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(calls);
  }),
);

router.patch(
  "/admin/home-calls/:id",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== ROLES.ADMIN) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { status } = req.body as { status?: AppointmentStatus };
    if (!status || !APPOINTMENT_STATUSES[status]) {
      res.status(400).json({ message: "Некорректный статус" });
      return;
    }

    const updated = await prisma.homeCall.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json(updated);
  }),
);

router.get(
  "/admin/feedback",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== ROLES.ADMIN) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const onlyUnread = String(req.query.onlyUnread || "") === "true";

    const feedback = await prisma.feedback.findMany({
      where: onlyUnread ? { isRead: false } : undefined,
      orderBy: { createdAt: "desc" },
    });

    res.json(feedback);
  }),
);

router.patch(
  "/admin/feedback/:id",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== ROLES.ADMIN) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { isRead } = req.body as { isRead?: boolean };
    if (typeof isRead !== "boolean") {
      res.status(400).json({ message: "isRead должен быть boolean" });
      return;
    }

    const updated = await prisma.feedback.update({
      where: { id: Number(req.params.id) },
      data: { isRead },
    });

    res.json(updated);
  }),
);

router.get(
  "/appointment",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (session.role !== ROLES.PATIENT) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });

    if (!patient) {
      res.status(404).json({ message: "Профиль пациента не найден" });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        schedule: true,
        doctor: {
          include: {
            user: true,
            doctorSpecialties: {
              include: {
                specialty: true,
              },
            },
          },
        },
      },
      orderBy: [{ schedule: { startDateTime: "desc" } }, { createdAt: "desc" }],
    });

    res.json(appointments);
  }),
);

router.post(
  "/appointment",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (session.role !== ROLES.PATIENT) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { scheduleId } = req.body as { scheduleId?: string | number };

    if (!scheduleId) {
      res.status(400).json({ message: "scheduleId не передан" });
      return;
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
    });

    if (!schedule) {
      res.status(404).json({ message: "Расписание не найдено" });
      return;
    }

    if (schedule.startDateTime < new Date()) {
      res.status(400).json({ message: "Прошедшая дата" });
      return;
    }

    const exists = await prisma.appointment.findFirst({
      where: { scheduleId: schedule.id },
    });

    if (exists) {
      res.status(409).json({ message: "Расписание уже занято" });
      return;
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });

    if (!patient) {
      res.status(404).json({ message: "Профиль пациента не найден" });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: schedule.doctorId,
        scheduleId: schedule.id,
        patientId: patient.id,
        status: APPOINTMENT_STATUSES.PENDING,
      },
    });

    res.json(appointment);
  }),
);

router.put(
  "/appointment/:id",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { status } = req.body as { status?: AppointmentStatus };
    if (!status) {
      res.status(400).json({ message: "Статус обязателен" });
      return;
    }
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!appointment) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    if (
      session.role === ROLES.PATIENT &&
      status !== APPOINTMENT_STATUSES.CANCELLED
    ) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    if (
      session.role === ROLES.DOCTOR ||
      session.role === ROLES.ADMIN ||
      status === APPOINTMENT_STATUSES.CANCELLED
    ) {
      const updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status },
      });
      res.json(updated);
      return;
    }

    res.status(403).json({ message: "Forbidden" });
  }),
);

router.post(
  "/auth/login",
  wrap(async (req, res) => {
    const payload = validateLoginPayload(req.body as Record<string, unknown>);
    if (!payload.ok) {
      res.status(400).json({ message: payload.message });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      res.status(401).json({ message: "Неверный логин или пароль" });
      return;
    }

    const isValid = await bcrypt.compare(payload.password, user.password);
    if (!isValid) {
      res.status(401).json({ message: "Неверный логин или пароль" });
      return;
    }

    const token = generateJwt(user);
    res.json(token);
  }),
);

router.post(
  "/auth/register",
  wrap(async (req, res) => {
    const payload = validateRegisterPayload(
      req.body as Record<string, unknown>,
    );
    if (!payload.ok) {
      res.status(400).json({ message: payload.message });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (user) {
      res.status(409).json({ message: "Пользователь уже существует" });
      return;
    }

    const registered = await prisma.user.create({
      data: {
        email: payload.email,
        fullName: payload.fullName,
        password: await bcrypt.hash(payload.password, 10),
      },
    });

    await prisma.patient.create({
      data: { userId: registered.id },
    });

    const token = generateJwt(registered);
    res.json(token);
  }),
);

router.get(
  "/doctors",
  wrap(async (req, res) => {
    const { search, specialty, category, quickFilter } = req.query as Record<
      string,
      string | undefined
    >;

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
              specialty: { name: specialty },
            },
          },
        }),
        ...(quickFilter === "highest" && {
          category: DOCTOR_CATEGORIES.HIGHEST,
        }),
        ...(quickFilter === "experience" && {
          experience: { gte: 10 },
        }),
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

    res.json(doctors);
  }),
);

router.post(
  "/doctors",
  wrap(async (req, res) => {
    const { fullName, email, password, specialty, room, experience } =
      req.body as {
        fullName: string;
        email: string;
        password: string;
        specialty: string;
        room: number;
        experience: number;
      };

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Пользователь с таким email уже существует",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          role: ROLES.DOCTOR,
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

    res.json(result);
  }),
);

router.put(
  "/doctors",
  wrap(async (req, res) => {
    const { id, form } = req.body as {
      id: number;
      form: {
        fullName: string;
        password?: string;
        room: number;
        experience: number;
        specialty: string;
      };
    };

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      res.status(404).json({ message: "Врач не найден" });
      return;
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

    res.json({ ok: true });
  }),
);

router.delete(
  "/doctors",
  wrap(async (req, res) => {
    const { id } = req.body as { id: number };

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      res.status(404).json({ message: "Врач не найден" });
      return;
    }

    await prisma.user.delete({
      where: { id: doctor.userId },
    });

    res.json({ ok: true });
  }),
);

router.post(
  "/doctors/:id/specialty",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (session.role !== ROLES.ADMIN) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { name } = req.body as { name?: string };
    if (!name) {
      res.status(400).json({ message: "Специальность не передана" });
      return;
    }

    const specialty = await prisma.specialty.findFirst({ where: { name } });
    if (!specialty) {
      res.status(404).json({ message: "Специальность не найдена" });
      return;
    }

    const record = await prisma.doctorSpecialty.create({
      data: {
        doctorId: Number(req.params.id),
        specialtyId: specialty.id,
      },
    });

    res.json(record);
  }),
);

router.get(
  "/doctors/count",
  wrap(async (_req, res) => {
    const count = await prisma.doctor.count();
    res.json({ count });
  }),
);

router.post(
  "/feedback",
  wrap(async (req, res) => {
    const { name, email, subject, message } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      res.status(400).json({ message: "Все поля обязательны" });
      return;
    }

    await prisma.feedback.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Сообщение отправлено",
    });
  }),
);

router.get(
  "/home-call/options",
  wrap(async (_req, res) => {
    const specialties = await prisma.specialty.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const slots = await prisma.homeCallSlot.findMany({
      where: { isActive: true },
      orderBy: { date: "asc" },
    });

    res.json({
      specialties: specialties.map((item: { name: string }) => item.name),
      slots,
    });
  }),
);

router.post(
  "/home-call",
  wrap(async (req, res) => {
    const session = getSession(req);
    const { fullName, phone, address, doctor, date, time } = req.body as {
      fullName?: string;
      phone?: string;
      address?: string;
      doctor?: string;
      date?: string;
      time?: string;
    };

    if (!phone || !address || !doctor || !date || !time) {
      res.status(400).json({ message: "Не все поля заполнены" });
      return;
    }

    let resolvedFullName = String(fullName ?? "").trim();

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { fullName: true },
      });
      resolvedFullName = user?.fullName ?? resolvedFullName;
    }

    if (!resolvedFullName) {
      res.status(400).json({ message: "ФИО обязательно" });
      return;
    }

    const homeCall = await prisma.homeCall.create({
      data: {
        fullName: resolvedFullName,
        phone,
        address,
        doctor,
        date,
        time,
      },
    });

    res.json({ success: true, homeCall });
  }),
);

router.get(
  "/home-call",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (session.role === ROLES.ADMIN) {
      const calls = await prisma.homeCall.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(calls);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { fullName: true },
    });

    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    const calls = await prisma.homeCall.findMany({
      where: { fullName: user.fullName },
      orderBy: { createdAt: "desc" },
    });

    res.json(calls);
  }),
);

router.post(
  "/home-call/ticket",
  wrap(async (req, res) => {
    const data = req.body as {
      fullName: string;
      phone: string;
      address: string;
      doctor: string;
      date: string;
      time: string;
    };

    if (
      !data.fullName ||
      !data.phone ||
      !data.address ||
      !data.doctor ||
      !data.date ||
      !data.time
    ) {
      res.status(400).json({ message: "Не все поля заполнены" });
      return;
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
      `Пациент: ${data.fullName}`,
      `Телефон: ${data.phone}`,
      `Адрес: ${data.address}`,
      "",
      `Специальность врача: ${data.doctor}`,
      `Дата: ${data.date}`,
      `Время: ${data.time}`,
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

    const pdfBytes = await pdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="home-call-ticket.pdf"',
    );
    res.send(Buffer.from(pdfBytes));
  }),
);

router.get(
  "/patients/count",
  wrap(async (_req, res) => {
    const count = await prisma.patient.count();
    res.json({ count });
  }),
);

router.get(
  "/schedule",
  wrap(async (req, res) => {
    const doctorId = Number(req.query.doctorId);
    if (!Number.isInteger(doctorId)) {
      res.status(400).json({ error: "doctorId is required" });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 14);

    const schedules = await prisma.schedule.findMany({
      where: {
        doctorId,
        startDateTime: {
          gte: today,
          lte: maxDate,
        },
      },
      orderBy: { startDateTime: "asc" },
    });

    res.json(schedules);
  }),
);

router.post(
  "/schedule",
  wrap(async (req, res) => {
    const { doctorId, slots } = req.body as {
      doctorId: number;
      slots: string[];
    };

    if (!Number.isInteger(doctorId) || !Array.isArray(slots)) {
      res.status(400).json({ error: "doctorId and slots are required" });
      return;
    }

    const weekStart = getNextMonday();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 5);

    const dayMap: Record<string, number> = {
      mon: 0,
      tue: 1,
      wed: 2,
      thu: 3,
      fri: 4,
    };

    await prisma.$transaction(async (tx) => {
      await tx.schedule.deleteMany({
        where: {
          doctorId,
          startDateTime: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      });

      for (const slot of slots) {
        const [dayKey, time] = slot.split("_");
        const dayOffset = dayMap[dayKey];
        if (dayOffset === undefined) continue;

        const [h, m] = time.split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) continue;

        const startDateTime = new Date(weekStart);
        startDateTime.setDate(weekStart.getDate() + dayOffset);
        startDateTime.setHours(h, m, 0, 0);

        const endDateTime = addMinutes(startDateTime, 30);

        await tx.schedule.create({
          data: {
            doctorId,
            startDateTime,
            endDateTime,
          },
        });
      }
    });

    res.json({ success: true });
  }),
);

router.get(
  "/schedule/public",
  wrap(async (req, res) => {
    const search = String(req.query.search || "").trim();
    const specialty = String(req.query.specialty || "").trim();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 14);

    const schedules = await prisma.schedule.findMany({
      where: {
        startDateTime: {
          gte: today,
          lte: maxDate,
        },
        doctor: {
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
        },
      },
      include: {
        doctor: {
          include: {
            user: true,
            doctorSpecialties: {
              include: {
                specialty: true,
              },
            },
          },
        },
        appointments: {
          select: { id: true },
        },
      },
      orderBy: [{ startDateTime: "asc" }],
    });

    type DoctorAgg = {
      name: string;
      specialties: string[];
      room: number | null;
      days: Set<string>;
      times: Date[];
      exp: number;
      busyCount: number;
    };

    const map = new Map<number, DoctorAgg>();

    for (const schedule of schedules) {
      const doctor = schedule.doctor;

      if (!map.has(doctor.id)) {
        map.set(doctor.id, {
          name: doctor.user.fullName,
          specialties: doctor.doctorSpecialties.map(
            (item: { specialty: { name: string } }) => item.specialty.name,
          ),
          room: doctor.room,
          days: new Set<string>(),
          times: [],
          exp: doctor.experience,
          busyCount: 0,
        });
      }

      const item = map.get(doctor.id)!;

      const jsDay = schedule.startDateTime.getDay();
      const day = DAY_LABELS[jsDay === 0 ? 7 : jsDay];
      if (day) item.days.add(day);

      item.times.push(schedule.startDateTime);
      if (schedule.appointments.length) item.busyCount++;
    }

    const result = Array.from(map.values()).map((doctor) => {
      const times = doctor.times.sort((a, b) => a.getTime() - b.getTime());

      const start = times[0];
      const end = times[times.length - 1];

      const startHH = start.getHours().toString().padStart(2, "0");
      const startMM = start.getMinutes().toString().padStart(2, "0");
      const endHH = end.getHours().toString().padStart(2, "0");
      const endMM = end.getMinutes().toString().padStart(2, "0");

      return {
        name: doctor.name,
        specialties: doctor.specialties,
        room: doctor.room,
        days: Array.from(doctor.days),
        time: `${startHH}:${startMM}-${endHH}:${endMM}`,
        status: doctor.busyCount === doctor.times.length ? "busy" : "available",
        exp: doctor.exp,
      };
    });

    res.json(result);
  }),
);

router.get(
  "/specialty",
  wrap(async (_req, res) => {
    const specialties = await prisma.specialty.findMany();
    res.json(specialties);
  }),
);

router.get(
  "/specialty/:id",
  wrap(async (req, res) => {
    const specId = Number(req.params.id);
    if (!Number.isInteger(specId)) {
      res.status(400).json({ message: "Некорректный id" });
      return;
    }

    const specialty = await prisma.specialty.findUnique({
      where: { id: specId },
      include: {
        doctorSpecialties: true,
      },
    });

    if (!specialty) {
      res.status(404).json({ message: "Специальность не найдена" });
      return;
    }

    res.json(specialty);
  }),
);

router.get(
  "/user",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (session.role !== ROLES.ADMIN) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const users = await prisma.user.findMany();
    res.json(users);
  }),
);

router.get(
  "/user/:id",
  wrap(async (req, res) => {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      res.status(400).json({ message: "Некорректный id" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }),
);

router.put(
  "/user/:id",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      res.status(400).json({ message: "Некорректный id" });
      return;
    }

    if (session.role !== ROLES.ADMIN && session.id !== userId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const data = req.body as Record<string, unknown>;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    res.json(user);
  }),
);

router.delete(
  "/user/:id",
  wrap(async (req, res) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (session.role !== ROLES.ADMIN) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      res.status(400).json({ message: "Некорректный id" });
      return;
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ ok: true });
  }),
);

export default router;

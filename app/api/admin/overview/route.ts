import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== ROLES.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        subject: true,
        isRead: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      doctors,
      patients,
      appointments,
      homeCalls,
      unreadFeedback,
      pharmacyOrders,
    },
    recentHomeCalls: recentHomeCalls.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    recentFeedback: recentFeedback.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

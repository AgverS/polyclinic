import { requireRole } from "@/lib/auth";
import { Role, User } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user;
  requireRole(user, [Role.ADMIN]);

  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

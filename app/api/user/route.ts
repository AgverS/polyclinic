import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user;
  requireRole(user, [ROLES.ADMIN]);

  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

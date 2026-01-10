import { NextRequest } from "next/server";
import { Role } from "./generated/prisma";
import { JwtUser } from "./jwt";
import jwt from "jsonwebtoken";

export type SessionUser = {
  id: number;
  role: Role;
};

export function requireRole(user: SessionUser, roles: Role[]) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function getUserFromRequest(req: NextRequest): SessionUser | null {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user: JwtUser };
    return decoded.user;
  } catch {
    return null;
  }
}

export function checkRoles(req: NextRequest, roles: Role[]) {
  try {
    const user = getUserFromRequest(req);
    if (!user) throw new Error("Unauthorized");
    console.log(user);
    requireRole(user, roles);
  } catch (err) {
    return { message: (err as Error).message, status: 401 };
  }
}

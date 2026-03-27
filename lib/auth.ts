import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { JwtUser } from "./jwt";
import type { Role } from "./types";

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

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";

export function getUserFromAuthHeader(
  authHeader: string | null | undefined,
): SessionUser | null {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user: JwtUser };
    return decoded.user;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): SessionUser | null {
  return getUserFromAuthHeader(req.headers.get("authorization"));
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

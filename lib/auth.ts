import { Role } from "./generated/prisma";

export type SessionUser = {
  id: number;
  role: Role;
};

export function requireRole(user: SessionUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}

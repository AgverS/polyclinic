import { jwtDecode } from "jwt-decode";
import { Role, User } from "./generated/prisma";
import jwt from "jsonwebtoken";

type JwtPayload = {
  user: JwtUser;
};

export type JwtUser = {
  id: number;
  email: string;
  fullName: string;
  role: Role;
};

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateJwt(user: User): string {
  const payload: JwtPayload = {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function decodeUserFromToken(token: string): JwtUser | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.user ?? null;
  } catch {
    return null;
  }
}

"use client";

import { User } from "@/lib/generated/prisma";
import { createContext, useContext, useEffect, useState } from "react";
import { decodeUserFromToken } from "./jwt";

type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const user = decodeUserFromToken(token);
    if (!user) {
      localStorage.removeItem("token");
      return null;
    }

    return user;
  });

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setUser(decodeUserFromToken(token));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

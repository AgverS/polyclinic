import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const user = getUserFromRequest(req);

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = user;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

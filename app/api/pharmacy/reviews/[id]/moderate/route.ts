import { getUserFromRequest } from "@/lib/auth";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { isPharmacyStoreError, moderatePharmacyReview } from "../../../_store";

function parseId(id: string) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== ROLES.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const numericId = parseId(id);
  if (!numericId) {
    return NextResponse.json(
      { message: "Некорректный id отзыва" },
      { status: 400 },
    );
  }

  const { action } = (await req.json()) as { action?: string };
  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json(
      { message: "action должен быть APPROVE или REJECT" },
      { status: 400 },
    );
  }

  try {
    const review = await moderatePharmacyReview(numericId, action === "APPROVE");
    return NextResponse.json(review);
  } catch (error) {
    if (isPharmacyStoreError(error)) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status },
      );
    }
    throw error;
  }
}

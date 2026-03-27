import { getUserFromRequest } from "@/lib/auth";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import {
  isPharmacyStoreError,
  PHARMACY_ORDER_STATUSES,
  updatePharmacyOrderStatus,
  type PharmacyOrderStatus,
} from "../../../_store";

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
      { message: "Некорректный id заказа" },
      { status: 400 },
    );
  }

  const { status } = (await req.json()) as { status?: string };
  if (
    !status ||
    !PHARMACY_ORDER_STATUSES.includes(status as PharmacyOrderStatus)
  ) {
    return NextResponse.json(
      { message: "Некорректный статус заказа" },
      { status: 400 },
    );
  }

  try {
    const order = await updatePharmacyOrderStatus(
      numericId,
      status as PharmacyOrderStatus,
    );
    return NextResponse.json(order);
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

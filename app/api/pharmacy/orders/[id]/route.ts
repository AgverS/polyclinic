import { getUserFromRequest } from "@/lib/auth";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { getPharmacyOrderById } from "../../_store";

function parseId(id: string) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = parseId(id);
  if (!numericId) {
    return NextResponse.json(
      { message: "Некорректный id заказа" },
      { status: 400 },
    );
  }

  const order = await getPharmacyOrderById(numericId);
  if (!order) {
    return NextResponse.json({ message: "Заказ не найден" }, { status: 404 });
  }

  if (session.role !== ROLES.ADMIN && order.userId !== session.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

import { getUserFromRequest } from "@/lib/auth";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import {
  createPharmacyOrder,
  isPharmacyStoreError,
  listPharmacyOrders,
  PHARMACY_ORDER_STATUSES,
  type PharmacyOrderStatus,
} from "../_store";

function parsePositiveInt(value: string | null) {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function POST(req: NextRequest) {
  const session = getUserFromRequest(req);
  const body = (await req.json()) as Record<string, unknown>;

  const address = String(body.address ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const userName = String(body.userName ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  const items = Array.isArray(body.items)
    ? body.items.map((item) => item as { productId?: unknown; qty?: unknown })
    : [];

  if (address.length < 8) {
    return NextResponse.json(
      { message: "Адрес должен быть не короче 8 символов" },
      { status: 400 },
    );
  }

  if (phone.replace(/[^\d]/g, "").length < 10) {
    return NextResponse.json(
      { message: "Телефон некорректный" },
      { status: 400 },
    );
  }

  if (!items.length) {
    return NextResponse.json({ message: "Корзина пуста" }, { status: 400 });
  }

  try {
    const order = await createPharmacyOrder({
      userId: session?.id ?? null,
      userName: userName || null,
      address,
      phone,
      comment,
      items: items.map((item) => ({
        productId: Number(item.productId),
        qty: Number(item.qty),
      })),
    });

    return NextResponse.json(order, { status: 201 });
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

export async function GET(req: NextRequest) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const filters: { userId?: number; status?: PharmacyOrderStatus } = {};
  const status = req.nextUrl.searchParams.get("status");
  const userIdParam = req.nextUrl.searchParams.get("userId");

  if (session.role !== ROLES.ADMIN) {
    filters.userId = session.id;
  } else {
    const parsedUserId = parsePositiveInt(userIdParam);
    if (parsedUserId) filters.userId = parsedUserId;
  }

  if (
    status &&
    PHARMACY_ORDER_STATUSES.includes(status as PharmacyOrderStatus)
  ) {
    filters.status = status as PharmacyOrderStatus;
  }

  const orders = await listPharmacyOrders(filters);
  return NextResponse.json(orders);
}

import { getUserFromRequest } from "@/lib/auth";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import {
  deletePharmacyProduct,
  getPharmacyProductById,
  isPharmacyStoreError,
  updatePharmacyProduct,
} from "../../_store";

function parseId(id: string) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = parseId(id);
  if (!numericId) {
    return NextResponse.json(
      { message: "Некорректный id товара" },
      { status: 400 },
    );
  }

  const product = await getPharmacyProductById(numericId);
  if (!product) {
    return NextResponse.json({ message: "Товар не найден" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
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
      { message: "Некорректный id товара" },
      { status: 400 },
    );
  }

  const body = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if ("name" in body) {
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json(
        { message: "name не может быть пустым" },
        { status: 400 },
      );
    }
    patch.name = name;
  }
  if ("form" in body) {
    const form = String(body.form ?? "").trim();
    if (!form) {
      return NextResponse.json(
        { message: "form не может быть пустым" },
        { status: 400 },
      );
    }
    patch.form = form;
  }
  if ("manufacturer" in body) {
    const manufacturer = String(body.manufacturer ?? "").trim();
    if (!manufacturer) {
      return NextResponse.json(
        { message: "manufacturer не может быть пустым" },
        { status: 400 },
      );
    }
    patch.manufacturer = manufacturer;
  }
  if ("category" in body) {
    const category = String(body.category ?? "").trim();
    if (!category) {
      return NextResponse.json(
        { message: "category не может быть пустым" },
        { status: 400 },
      );
    }
    patch.category = category;
  }
  if ("price" in body) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: "price должен быть > 0" },
        { status: 400 },
      );
    }
    patch.price = Number(price.toFixed(2));
  }
  if ("stock" in body) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { message: "stock должен быть целым и >= 0" },
        { status: 400 },
      );
    }
    patch.stock = stock;
  }
  if ("isActive" in body) {
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { message: "isActive должен быть boolean" },
        { status: 400 },
      );
    }
    patch.isActive = body.isActive;
  }
  if ("requiresPrescription" in body) {
    if (typeof body.requiresPrescription !== "boolean") {
      return NextResponse.json(
        { message: "requiresPrescription должен быть boolean" },
        { status: 400 },
      );
    }
    patch.requiresPrescription = body.requiresPrescription;
  }

  try {
    const updated = await updatePharmacyProduct(numericId, patch);
    return NextResponse.json(updated);
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

export async function DELETE(
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
      { message: "Некорректный id товара" },
      { status: 400 },
    );
  }

  try {
    const deleted = await deletePharmacyProduct(numericId);
    return NextResponse.json(deleted);
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

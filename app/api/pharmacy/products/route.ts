import { getUserFromRequest } from "@/lib/auth";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import {
  createPharmacyProduct,
  listPharmacyProducts,
} from "../_store";

function parseBoolean(value: string | null) {
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const category = req.nextUrl.searchParams.get("category")?.trim();
  const sort = req.nextUrl.searchParams.get("sort")?.trim();
  const onlyAvailable = parseBoolean(
    req.nextUrl.searchParams.get("onlyAvailable"),
  );
  const includeInactive = parseBoolean(
    req.nextUrl.searchParams.get("includeInactive"),
  );
  const minPrice = parseNumber(req.nextUrl.searchParams.get("minPrice"));
  const maxPrice = parseNumber(req.nextUrl.searchParams.get("maxPrice"));

  const products = await listPharmacyProducts({
    ...(q && { q }),
    ...(category && { category }),
    ...(typeof onlyAvailable === "boolean" && { onlyAvailable }),
    ...(typeof includeInactive === "boolean" && { includeInactive }),
    ...(typeof minPrice === "number" && { minPrice }),
    ...(typeof maxPrice === "number" && { maxPrice }),
    ...((sort === "price_asc" ||
      sort === "price_desc" ||
      sort === "name_asc" ||
      sort === "name_desc" ||
      sort === "newest") && { sort }),
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== ROLES.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const form = String(body.form ?? "").trim();
  const manufacturer = String(body.manufacturer ?? "").trim();
  const category = String(body.category ?? "").trim();
  const price = Number(body.price);
  const stock = Number(body.stock);
  const isActive = body.isActive !== false;
  const requiresPrescription = body.requiresPrescription === true;

  if (!name || !form || !manufacturer || !category) {
    return NextResponse.json(
      { message: "name/form/manufacturer/category обязательны" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { message: "price должен быть > 0" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return NextResponse.json(
      { message: "stock должен быть целым и >= 0" },
      { status: 400 },
    );
  }

  const product = await createPharmacyProduct({
    name,
    form,
    manufacturer,
    category,
    price: Number(price.toFixed(2)),
    stock,
    isActive,
    requiresPrescription,
  });

  return NextResponse.json(product, { status: 201 });
}

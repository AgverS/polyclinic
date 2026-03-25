import { getUserFromRequest } from "@/lib/auth";
import { ROLES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { createPharmacyReview, listPharmacyReviews } from "../_store";

function parseBoolean(value: string | null) {
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export async function GET(req: NextRequest) {
  const includeUnpublished =
    parseBoolean(req.nextUrl.searchParams.get("includeUnpublished")) ?? false;
  const session = getUserFromRequest(req);

  if (includeUnpublished && session?.role !== ROLES.ADMIN) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const reviews = await listPharmacyReviews(includeUnpublished);
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = getUserFromRequest(req);
  const body = (await req.json()) as Record<string, unknown>;

  const rating = Number(body.rating);
  const userNameRaw = String(body.userName ?? "").trim();
  const title = String(body.title ?? "").trim();
  const text = String(body.text ?? "").trim();
  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag) => String(tag))
    : [];

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "rating должен быть от 1 до 5" },
      { status: 400 },
    );
  }
  if (!title || title.length < 4) {
    return NextResponse.json(
      { message: "title должен быть не короче 4 символов" },
      { status: 400 },
    );
  }
  if (!text || text.length < 10) {
    return NextResponse.json(
      { message: "text должен быть не короче 10 символов" },
      { status: 400 },
    );
  }

  const resolvedName = session?.id ? userNameRaw || "Пользователь" : userNameRaw;
  if (!resolvedName) {
    return NextResponse.json(
      { message: "userName обязателен для гостевого отзыва" },
      { status: 400 },
    );
  }

  const review = await createPharmacyReview({
    userId: session?.id ?? null,
    userName: resolvedName,
    rating,
    title,
    text,
    tags,
  });

  return NextResponse.json(review, { status: 201 });
}

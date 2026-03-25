import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

export type PharmacyOrderStatus =
  | "CREATED"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type PharmacyReviewModeration = "PENDING" | "APPROVED" | "REJECTED";

export const PHARMACY_ORDER_STATUSES: PharmacyOrderStatus[] = [
  "CREATED",
  "PROCESSING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export class PharmacyStoreError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "PHARMACY_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function isPharmacyStoreError(
  error: unknown,
): error is PharmacyStoreError {
  return error instanceof PharmacyStoreError;
}

type ProductFilters = {
  q?: string;
  category?: string;
  onlyAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  includeInactive?: boolean;
  sort?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest";
};

type CreateOrderPayload = {
  userId: number | null;
  userName: string | null;
  address: string;
  phone: string;
  comment?: string;
  items: Array<{
    productId: number;
    qty: number;
  }>;
};

type CreateReviewPayload = {
  userId: number | null;
  userName: string;
  rating: number;
  title: string;
  text: string;
  tags?: string[];
};

type OrderListFilters = {
  userId?: number;
  status?: PharmacyOrderStatus;
};

const DEFAULT_PRODUCTS = [
  {
    name: "Парацетамол",
    form: "Таблетки 500 мг",
    manufacturer: "Фармстандарт",
    category: "Жаропонижающие",
    price: 2.45,
    stock: 120,
    isActive: true,
    requiresPrescription: false,
  },
  {
    name: "Ибупрофен",
    form: "Капсулы 200 мг",
    manufacturer: "Berlin-Chemie",
    category: "Боль и воспаление",
    price: 4.1,
    stock: 90,
    isActive: true,
    requiresPrescription: false,
  },
  {
    name: "Лоратадин",
    form: "Таблетки 10 мг",
    manufacturer: "Ozon",
    category: "Аллергия",
    price: 3.4,
    stock: 74,
    isActive: true,
    requiresPrescription: false,
  },
  {
    name: "Но-шпа",
    form: "Таблетки 40 мг",
    manufacturer: "Sanofi",
    category: "Спазмолитики",
    price: 4.6,
    stock: 0,
    isActive: true,
    requiresPrescription: false,
  },
];

const DEFAULT_REVIEWS = [
  {
    userName: "Марина К.",
    rating: 5,
    title: "Быстро собрали заказ",
    text: "Заказ оформила утром, к обеду уже получила уведомление о готовности.",
    tags: ["Самовывоз", "Сервис"],
  },
  {
    userName: "Алексей Р.",
    rating: 4,
    title: "Удобный каталог",
    text: "Видно наличие и цену, хотелось бы только чаще обновлять остатки.",
    tags: ["Каталог", "Наличие"],
  },
];

let ensured = false;
let ensurePromise: Promise<void> | null = null;

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(value.toString());
}

function mapProduct(product: {
  id: number;
  name: string;
  form: string;
  manufacturer: string;
  category: string;
  price: Prisma.Decimal;
  stock: number;
  isActive: boolean;
  requiresPrescription: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: product.id,
    name: product.name,
    form: product.form,
    manufacturer: product.manufacturer,
    category: product.category,
    price: toNumber(product.price),
    stock: product.stock,
    isActive: product.isActive,
    requiresPrescription: product.requiresPrescription,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function mapOrder(order: {
  id: number;
  userId: number | null;
  userName: string | null;
  address: string;
  phone: string;
  comment: string;
  status: PharmacyOrderStatus;
  total: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    productId: number;
    name: string;
    form: string;
    price: Prisma.Decimal;
    qty: number;
    lineTotal: Prisma.Decimal;
  }>;
}) {
  return {
    id: order.id,
    userId: order.userId,
    userName: order.userName,
    address: order.address,
    phone: order.phone,
    comment: order.comment,
    status: order.status,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      form: item.form,
      price: toNumber(item.price),
      qty: item.qty,
      lineTotal: toNumber(item.lineTotal),
    })),
    total: toNumber(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

function mapReview(review: {
  id: number;
  userId: number | null;
  userName: string;
  rating: number;
  title: string;
  text: string;
  tags: string[];
  moderationStatus: PharmacyReviewModeration;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: review.id,
    userId: review.userId,
    userName: review.userName,
    rating: review.rating,
    title: review.title,
    text: review.text,
    tags: review.tags,
    moderationStatus: review.moderationStatus,
    isPublished: review.isPublished,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

export async function ensurePharmacySeed() {
  if (ensured) return;
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      const productCount = await prisma.pharmacyProduct.count();
      if (productCount === 0) {
        await prisma.pharmacyProduct.createMany({
          data: DEFAULT_PRODUCTS.map((item) => ({
            ...item,
            price: new Prisma.Decimal(item.price),
          })),
        });
      }

      const reviewCount = await prisma.pharmacyReview.count();
      if (reviewCount === 0) {
        await prisma.pharmacyReview.createMany({
          data: DEFAULT_REVIEWS.map((item) => ({
            userName: item.userName,
            rating: item.rating,
            title: item.title,
            text: item.text,
            tags: item.tags,
            moderationStatus: "APPROVED",
            isPublished: true,
          })),
        });
      }
    } catch {
      throw new PharmacyStoreError(
        "Таблицы аптеки не готовы. Выполни prisma generate и prisma db push.",
        500,
        "PHARMACY_SCHEMA_NOT_READY",
      );
    }

    ensured = true;
  })();

  try {
    await ensurePromise;
  } finally {
    ensurePromise = null;
  }
}

export async function listPharmacyProducts(filters: ProductFilters = {}) {
  await ensurePharmacySeed();

  const products = await prisma.pharmacyProduct.findMany({
    where: {
      ...(filters.includeInactive ? {} : { isActive: true }),
      ...(filters.onlyAvailable ? { stock: { gt: 0 } } : {}),
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" } },
              { form: { contains: filters.q, mode: "insensitive" } },
              { manufacturer: { contains: filters.q, mode: "insensitive" } },
              { category: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.category
        ? { category: { equals: filters.category, mode: "insensitive" } }
        : {}),
      ...(typeof filters.minPrice === "number"
        ? { price: { gte: new Prisma.Decimal(filters.minPrice) } }
        : {}),
      ...(typeof filters.maxPrice === "number"
        ? { price: { lte: new Prisma.Decimal(filters.maxPrice) } }
        : {}),
    },
    orderBy:
      filters.sort === "price_asc"
        ? { price: "asc" }
        : filters.sort === "price_desc"
          ? { price: "desc" }
          : filters.sort === "name_desc"
            ? { name: "desc" }
            : filters.sort === "newest"
              ? { id: "desc" }
              : { name: "asc" },
  });

  return products.map(mapProduct);
}

export async function getPharmacyProductById(id: number) {
  await ensurePharmacySeed();
  const product = await prisma.pharmacyProduct.findUnique({ where: { id } });
  return product ? mapProduct(product) : null;
}

export async function createPharmacyProduct(input: {
  name: string;
  form: string;
  manufacturer: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  requiresPrescription: boolean;
}) {
  await ensurePharmacySeed();
  const product = await prisma.pharmacyProduct.create({
    data: {
      ...input,
      price: new Prisma.Decimal(input.price),
    },
  });
  return mapProduct(product);
}

export async function updatePharmacyProduct(
  id: number,
  input: Partial<{
    name: string;
    form: string;
    manufacturer: string;
    category: string;
    price: number;
    stock: number;
    isActive: boolean;
    requiresPrescription: boolean;
  }>,
) {
  await ensurePharmacySeed();
  try {
    const updated = await prisma.pharmacyProduct.update({
      where: { id },
      data: {
        ...(typeof input.name === "string" && { name: input.name }),
        ...(typeof input.form === "string" && { form: input.form }),
        ...(typeof input.manufacturer === "string" && {
          manufacturer: input.manufacturer,
        }),
        ...(typeof input.category === "string" && { category: input.category }),
        ...(typeof input.price === "number" && {
          price: new Prisma.Decimal(input.price),
        }),
        ...(typeof input.stock === "number" && { stock: input.stock }),
        ...(typeof input.isActive === "boolean" && {
          isActive: input.isActive,
        }),
        ...(typeof input.requiresPrescription === "boolean" && {
          requiresPrescription: input.requiresPrescription,
        }),
      },
    });
    return mapProduct(updated);
  } catch {
    throw new PharmacyStoreError("Товар не найден", 404, "PRODUCT_NOT_FOUND");
  }
}

export async function deletePharmacyProduct(id: number) {
  await ensurePharmacySeed();
  try {
    const deleted = await prisma.pharmacyProduct.delete({ where: { id } });
    return mapProduct(deleted);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new PharmacyStoreError(
        "Нельзя удалить товар, который есть в заказах",
        409,
        "PRODUCT_IN_ORDER",
      );
    }
    throw new PharmacyStoreError("Товар не найден", 404, "PRODUCT_NOT_FOUND");
  }
}

export async function createPharmacyOrder(payload: CreateOrderPayload) {
  await ensurePharmacySeed();
  if (!payload.items.length) {
    throw new PharmacyStoreError("Список товаров пуст", 400, "EMPTY_ORDER");
  }

  return prisma.$transaction(async (tx) => {
    const grouped = new Map<number, number>();
    for (const item of payload.items) {
      const productId = Number(item.productId);
      const qty = Number(item.qty);
      if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty <= 0) {
        continue;
      }
      grouped.set(productId, (grouped.get(productId) ?? 0) + qty);
    }
    if (!grouped.size) {
      throw new PharmacyStoreError(
        "Некорректные позиции заказа",
        400,
        "INVALID_ORDER_ITEMS",
      );
    }

    const orderItems: Array<{
      productId: number;
      name: string;
      form: string;
      price: Prisma.Decimal;
      qty: number;
      lineTotal: Prisma.Decimal;
    }> = [];

    for (const [productId, qty] of grouped.entries()) {
      const product = await tx.pharmacyProduct.findUnique({
        where: { id: productId },
      });
      if (!product || !product.isActive) {
        throw new PharmacyStoreError(
          `Товар с id=${productId} не найден`,
          404,
          "PRODUCT_NOT_FOUND",
        );
      }
      if (product.stock < qty) {
        throw new PharmacyStoreError(
          `Недостаточно остатка для товара "${product.name}"`,
          409,
          "INSUFFICIENT_STOCK",
        );
      }

      const updated = await tx.pharmacyProduct.updateMany({
        where: { id: productId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (updated.count !== 1) {
        throw new PharmacyStoreError(
          `Недостаточно остатка для товара "${product.name}"`,
          409,
          "INSUFFICIENT_STOCK",
        );
      }

      const lineTotal = new Prisma.Decimal(product.price).mul(qty);
      orderItems.push({
        productId,
        name: product.name,
        form: product.form,
        price: product.price,
        qty,
        lineTotal,
      });
    }

    let userName = payload.userName?.trim() || null;
    if (!userName && payload.userId) {
      const user = await tx.user.findUnique({
        where: { id: payload.userId },
        select: { fullName: true },
      });
      userName = user?.fullName ?? null;
    }

    const total = orderItems.reduce(
      (sum, item) => sum.add(item.lineTotal),
      new Prisma.Decimal(0),
    );

    const order = await tx.pharmacyOrder.create({
      data: {
        userId: payload.userId,
        userName,
        address: payload.address,
        phone: payload.phone,
        comment: payload.comment?.trim() ?? "",
        status: "CREATED",
        total,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            form: item.form,
            price: item.price,
            qty: item.qty,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true },
    });

    return mapOrder(order as never);
  });
}

export async function listPharmacyOrders(filters: OrderListFilters = {}) {
  await ensurePharmacySeed();
  const orders = await prisma.pharmacyOrder.findMany({
    where: {
      ...(typeof filters.userId === "number" ? { userId: filters.userId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => mapOrder(order as never));
}

export async function getPharmacyOrderById(id: number) {
  await ensurePharmacySeed();
  const order = await prisma.pharmacyOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  return order ? mapOrder(order as never) : null;
}

export async function updatePharmacyOrderStatus(
  id: number,
  status: PharmacyOrderStatus,
) {
  await ensurePharmacySeed();
  return prisma.$transaction(async (tx) => {
    const order = await tx.pharmacyOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new PharmacyStoreError("Заказ не найден", 404, "ORDER_NOT_FOUND");
    }

    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await tx.pharmacyProduct.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } },
        });
      }
    }

    const updated = await tx.pharmacyOrder.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return mapOrder(updated as never);
  });
}

export async function listPharmacyReviews(includeUnpublished = false) {
  await ensurePharmacySeed();
  const reviews = await prisma.pharmacyReview.findMany({
    where: includeUnpublished ? undefined : { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
  return reviews.map(mapReview);
}

export async function createPharmacyReview(payload: CreateReviewPayload) {
  await ensurePharmacySeed();
  const review = await prisma.pharmacyReview.create({
    data: {
      userId: payload.userId,
      userName: payload.userName,
      rating: payload.rating,
      title: payload.title.trim(),
      text: payload.text.trim(),
      tags: (payload.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      moderationStatus: "PENDING",
      isPublished: false,
    },
  });
  return mapReview(review);
}

export async function moderatePharmacyReview(id: number, approve: boolean) {
  await ensurePharmacySeed();
  try {
    const review = await prisma.pharmacyReview.update({
      where: { id },
      data: {
        moderationStatus: approve ? "APPROVED" : "REJECTED",
        isPublished: approve,
      },
    });
    return mapReview(review);
  } catch {
    throw new PharmacyStoreError("Отзыв не найден", 404, "REVIEW_NOT_FOUND");
  }
}

export async function getPharmacyStats() {
  await ensurePharmacySeed();

  const [
    products,
    activeProducts,
    lowStock,
    outOfStock,
    orders,
    reviewsTotal,
    reviewsPublished,
    reviewsPending,
    completedRevenue,
    totalWithoutCancelled,
    grouped,
  ] = await Promise.all([
    prisma.pharmacyProduct.count(),
    prisma.pharmacyProduct.count({ where: { isActive: true } }),
    prisma.pharmacyProduct.count({ where: { stock: { gt: 0, lte: 5 } } }),
    prisma.pharmacyProduct.count({ where: { stock: { lte: 0 } } }),
    prisma.pharmacyOrder.count(),
    prisma.pharmacyReview.count(),
    prisma.pharmacyReview.count({ where: { isPublished: true } }),
    prisma.pharmacyReview.count({ where: { moderationStatus: "PENDING" } }),
    prisma.pharmacyOrder.aggregate({
      where: { status: "COMPLETED" },
      _sum: { total: true },
    }),
    prisma.pharmacyOrder.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.pharmacyOrder.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const ordersByStatus = {
    created: 0,
    processing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const row of grouped) {
    if (row.status === "CREATED") ordersByStatus.created = row._count._all;
    if (row.status === "PROCESSING")
      ordersByStatus.processing = row._count._all;
    if (row.status === "READY") ordersByStatus.ready = row._count._all;
    if (row.status === "COMPLETED") ordersByStatus.completed = row._count._all;
    if (row.status === "CANCELLED") ordersByStatus.cancelled = row._count._all;
  }

  return {
    products,
    activeProducts,
    orders,
    ordersByStatus,
    lowStock,
    outOfStock,
    reviews: {
      total: reviewsTotal,
      published: reviewsPublished,
      pending: reviewsPending,
    },
    revenue: {
      completed: toNumber(completedRevenue._sum.total),
      totalWithoutCancelled: toNumber(totalWithoutCancelled._sum.total),
    },
  };
}

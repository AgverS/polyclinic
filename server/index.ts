import cors from "cors";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import morgan from "morgan";
import next from "next";
import apiRouter from "./api-router";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);

function mapErrorToResponse(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : "";

  if (code === "P1000" || code === "P1001" || code === "ECONNREFUSED") {
    return {
      status: 503,
      message:
        "База данных недоступна. Проверьте, что Postgres запущен и доступен.",
    };
  }

  if (code === "P2002") {
    return {
      status: 409,
      message: "Запись с такими данными уже существует.",
    };
  }

  return {
    status: 500,
    message: "Внутренняя ошибка сервера. Попробуйте позже.",
  };
}

async function bootstrap() {
  const nextApp = next({ dev, dir: process.cwd() });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();
  app.disable("x-powered-by");

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api/pharmacy")) {
      next();
      return;
    }

    await handle(req, res);
  });

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(dev ? "dev" : "combined"));

  app.use("/api", apiRouter);

  app.use(async (req: Request, res: Response) => {
    await handle(req, res);
  });

  app.use(
    (error: unknown, _req: Request, res: Response, next: NextFunction) => {
      void next;
      console.error("EXPRESS_ERROR:", error);
      const { status, message } = mapErrorToResponse(error);
      res.status(status).json({ message });
    },
  );

  app.listen(port, () => {
    console.log(
      `Server started on http://localhost:${port} (${dev ? "dev" : "prod"})`,
    );
  });
}

bootstrap().catch((error) => {
  console.error("BOOTSTRAP_ERROR:", error);
  process.exit(1);
});

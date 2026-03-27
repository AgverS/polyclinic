# Polyclinic

Проект поликлиники на `Next.js + React` (клиентский фронт) и `Express + TypeScript` (бэкенд).

## Review flow

Обязательный процесс ревью:

1. При старте проекта создаётся отдельная пустая ветка `review`.
2. После завершения работ создаётся PR из `main` в `review`.
3. PR не закрывается: в нём собираются комментарии ревью.

## Stack

- Frontend: `Next.js`, `React`, `TypeScript`.
- Backend API: `Express`, `TypeScript`, `Prisma`, `PostgreSQL`.
- Auth: JWT.
- Code quality: `ESLint` + `Prettier`.

## Scripts

```bash
npm run dev           # Express + Next (единый сервер)
npm run dev:next      # только Next dev server
npm run build         # production build Next
npm run start         # Express + Next в production режиме
npm run lint          # eslint
npm run format        # prettier --write
npm run format:check  # prettier --check
```

## Environment

Скопируйте `.env.example` в `.env` и при необходимости измените значения:

```bash
cp .env.example .env
```

Для локальной БД:

```bash
docker compose up -d postgres
```

## API

Бэкенд API обслуживается через Express роутер `server/api-router.ts` и доступен по префиксу `/api/*`.

Диагностический эндпоинт состояния:

- `GET /api/health` -> проверка доступности API и подключения к БД.

## Notes

- Фронт формируется на клиенте и получает данные через API.
- Конфигурация форматирования: `.prettierrc.json`.
- Игнорируемые для форматирования файлы: `.prettierignore`.

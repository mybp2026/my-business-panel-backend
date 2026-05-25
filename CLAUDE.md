# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Workspace context (sibling repos, cross-repo feature order, branching) lives in `../CLAUDE.md`. This file covers backend-only conventions.

## Stack

NestJS 11 + TypeScript 5.7 + Express + PostgreSQL + Redis (BullMQ queues) + JWT cookie auth + class-validator DTOs + Swagger. Stripe for subscriptions. Hacienda Costa Rica e-invoicing (xml-crypto, node-forge, xmlbuilder2). Decimal.js for money — never use native `number` for amounts.

## Commands

```bash
npm run start:dev          # watch mode
npm run start:debug        # --inspect
npm run start:prod         # node dist/main (run npm run build first)
npm run start:staging      # NODE_ENV=staging
npm run build              # nest build
npm run lint               # eslint --fix on {src,apps,libs,test}/**/*.ts
npm run test               # jest (unit, *.spec.ts under src/)
npm run test:watch
npm run test:cov
npm run test:debug         # node --inspect-brk + ts-node
npm run test:e2e           # jest --config ./test/jest-e2e.json
npm run test -- path/to/file.spec.ts        # single file
npm run test -- -t "describe or it name"    # single named test

# CABYS catalog loaders (Costa Rica product tax codes)
npm run cabys:load                 # uses .env
npm run cabys:load:staging         # uses .env.staging
npm run cabys:load:dev             # uses .env.development
npm run cabys:load:native          # ts-node native loader

npm run deploy:local               # build + cabys:load + start:prod
```

Docker (Postgres + pgAdmin :8080 + Redis + RedisInsight :5540) lives here:

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.prod.yml up -d
docker logs my-business-panel-postgres | grep -E "(ERROR|Bootstrap completado|ready to accept)"
```

DB schema auto-bootstraps from `../my-business-panel-database/bootstrap.sql` on first container start. To reset: `docker compose down`, delete `./postgres-data`, `up -d` again.

## Boot / global setup (`src/main.ts`)

- Global prefix: `api/v1`.
- CORS: origins from `ALLOWED_ORIGINS` env (comma-separated, trailing slash stripped); defaults `http://localhost:5173,http://localhost:3000`; `credentials: true`.
- `cookie-parser` mounted globally (`auth_token` cookie carries JWT).
- Global `ValidationPipe({ transform: true, whitelist: true })` — DTOs strip unknown props and coerce types.
- Global `ResponseInterceptor` wraps every response in a standard envelope — frontend consumes via `ApiResponse<T>`.
- Raw body for `/subscription/webhook` (Stripe signature verification).
- Swagger at `/docs`.

## Module / folder layout

```ps
src/
  app/                        # AppModule, root controller
  common/                     # Cross-cutting building blocks
    guards/                   # AuthenticationGuard, RoleAuthorizationGuard
    decorators/               # @Session(), @RequiredRole(...)
    interceptors/             # ResponseFormatter
    errors/                   # Domain error classes
    interfaces/               # IUserSession etc.
    crypto/                   # JWT, password, signing
    utilities/
    constants/
  contexts/
    general/   pos/   purchase/   inventory/   hr/   finances/
      modules/<feature>/
        <feature>.controller.ts
        <feature>.service.ts
        <feature>.module.ts
        dto/
        interfaces/
      errors/                 # context-scoped errors
      tests/
      <context>.queries.ts    # raw SQL strings used by services
  docs/                       # in-repo dev notes
  main.ts
  queries.ts
```

Feature work goes inside `src/contexts/<context>/modules/<feature>/`. Do not invent new top-level folders. Path aliases (`tsconfig.json` + `jest.moduleNameMapper`): `@/* → src/*`, `@pos/* → src/contexts/pos/*`, `@general/*`, `@hr/*`, `@purchase/*`.

## Auth — mandatory pattern

Every protected endpoint:

```ts
@UseGuards(AuthenticationGuard, RoleAuthorizationGuard)
@RequiredRole('admin')
@Post()
create(@Body() dto: CreateThingDto, @Session() user: IUserSession) {
  return this.service.create(dto, user.tenant_id);
}
```

- `AuthenticationGuard` (`src/common/guards/authentication.guard.ts`) — reads `auth_token` cookie, verifies JWT, populates `request.user: IUserSession` (`user_id`, `tenant_id`, `role_id`).
- `RoleAuthorizationGuard` (`src/common/guards/role_authorization.guard.ts`) — reads `@RequiredRole(...names)` metadata, resolves `role_name` via `StateService.getRole(role_id)`.
- `@RequiredRole(...roleNames: string[])` — `src/common/decorators/role_metadata.decorator.ts`.
- `@Session()` — `src/common/decorators/session.decorator.ts`.
- Auth-only (any authed user): `@UseGuards(AuthenticationGuard)` at class level, omit `RoleAuthorizationGuard`.
- Exact `role_name` strings live in `../my-business-panel-database/seeds/catalog/general/005-insert-roles.sql`. `role_id 4 = employee`. Verify the seed before using a new role name.
- Never invent an alternative auth flow — match this stack.

## Multi-tenancy

Every domain row is scoped by `tenant_id`. Pull it from `@Session() user` and pass into the service. **Never** accept a `tenant_id` from a client body or query string. Every query that touches tenant data must include `WHERE tenant_id = $X`.

## DTOs

`class-validator` + `class-transformer`. Common decorators: `@IsNotEmpty`, `@IsUUID`, `@IsOptional`, `@IsString`, `@IsNumber`, `@IsBoolean`, `@IsEnum`, `@Type(() => Date)`, `@ValidateNested`. Representative example: `src/contexts/pos/modules/sale/dto/sales.dto.ts`. Global `ValidationPipe` already strips unknown props (`whitelist`) and coerces types (`transform`) — do not duplicate that work.

## Data access

The repo uses raw SQL via `@crane-technologies/database` (no ORM). Each context has a `<context>.queries.ts` file holding query strings. Services compose queries + run them through the shared DB client. When adding a query:

- Place the SQL string in the matching `*.queries.ts` (not inline in the service).
- Always parameterize (`$1`, `$2`, …) — never string-interpolate user input.
- Money columns: round / handle with `decimal.js`; do not cast to JS `number`.

## Async / scheduling

- BullMQ via `@nestjs/bullmq` + `ioredis` for background queues.
- `@nestjs/schedule` for cron jobs.
- E-invoice cron probe script: `scripts/test-einvoice-cron.ts`.

## Response shape

`ResponseInterceptor` wraps every controller return in:

```ts
{ success: true, data: <return value>, message?: string }
```

Throw domain errors from `src/common/errors/` (or the context's `errors/`) — the interceptor / exception filter maps them to HTTP responses with `{ success: false, message, ... }`. Frontend's `ApiResponse<T>` type mirrors this envelope.

## Tests

Jest. Unit specs live next to source as `*.spec.ts` (`testRegex: '.*\\.spec\\.ts$'`, `rootDir: src`). E2E specs under `test/` with `test/jest-e2e.json`. Run a single file with `npm run test -- path/to/file.spec.ts`; a single named test with `-t "name"`.

## Lint / style

- `npm run lint` runs `eslint --fix`. Prettier integrated via `eslint-plugin-prettier`.
- No emojis in code, comments, log strings, or commit messages.
- Spanish copy in domain text / error messages is intentional — keep it.

## DB changes from the backend side

Backend never owns schema. When a feature needs a DDL change:

1. Author the migration + schema-file edit in `../my-business-panel-database/` first (see that repo's `CLAUDE.md`).
2. Rebuild bootstrap (`build-bootstrap.ps1` in DB repo) and reset the local container if needed.
3. Then write the backend module / queries.

## Branching

Fork → personal `development` → PR into upstream `development` → merge up to `staging` → `master`. Direct push to upstream branches is forbidden. See `contributing.md`.

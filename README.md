# Issue API

A RESTful API for tracking software testing issues with full revision
history. Built with **Node.js**, **Koa**, **Sequelize**, and **MySQL**, and
designed to run in Docker.

Authenticated users can create, list, and update issues. Every update is
recorded as a revision (who changed what, and when), and any two revisions
of the same issue can be compared field-by-field.

## Tech stack

- Node.js 22 + Koa 2
- Sequelize 6 (MySQL dialect via `mysql2`)
- JWT authentication (`jsonwebtoken`) with `bcryptjs` password hashing
- MySQL 8, orchestrated via Docker Compose

## Features

- Create, list, retrieve, and update issues.
- Every issue update is stored as an immutable revision (`created_by`,
  `updated_by`, and a JSON diff of changed fields).
- Field-level comparison between any two revisions of an issue.
- JWT-based authentication (`/auth/signup`, `/auth/login`) with bcrypt
  password hashing.
- `X-Client-ID` header required on every authenticated request.
- Request payload validation on all write endpoints (400 with a clear
  error list on bad input).
- Centralized error handling: unexpected errors are logged server-side and
  never leak internal details (stack traces, DB errors) to the client.
- Fails fast on startup if required configuration is missing.

## Getting started

### Prerequisites

- Node.js 22.1.0+ (see `.nvmrc`) if running locally without Docker.
- Docker and Docker Compose if running via containers.

### Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

`.env.example` documents every variable used by the app (`PORT`,
`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`,
`JWT_EXPIRES_IN`) and by Docker Compose (`MYSQLDB_*`, `NODE_*`). Never
commit `.env` — it's already excluded via `.gitignore`.

### Run with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts a MySQL 8 container (seeded with the `issues` table from
`docker-entrypoint-initdb.d/1_create_table.sql`) and the API container,
wired together using the variables in `.env`. The API listens on
`NODE_LOCAL_PORT` (default `8080`).

### Run locally without Docker

1. Point `DB_HOST`/`DB_PORT`/etc. in `.env` at a MySQL instance you control.
2. Install dependencies and start the server:

   ```bash
   npm install
   npm start
   ```

On startup the app validates required environment variables, connects to
MySQL, and synchronizes the `issues`, `users`, and `revisions` tables via
Sequelize.

### Database migrations

`users` and `revisions` also have versioned migrations (via `sequelize-cli`)
in `migrations/`, useful for evolving the schema without relying on
`sequelize.sync()`:

```bash
npm run migrate       # apply pending migrations
npm run migrate:undo  # roll back the last migration
```

Migrations read the same `DB_*` environment variables as the app
(`config/config.js`), so no separate configuration is needed.

## Authentication

1. `POST /auth/signup` with `{ "email": "...", "password": "..." }` to
   create a user. Passwords are hashed with bcrypt before being stored —
   plaintext passwords are never persisted or logged. Passwords must be at
   least 8 characters.
2. `POST /auth/login` with the same credentials to receive a JWT:
   `{ "token": "..." }`.
3. Every other endpoint requires two headers:
   - `X-Client-ID: <any-non-empty-value>`
   - `Authorization: <token>` — the raw JWT returned by `/auth/login`
     (no `Bearer ` prefix).

`GET /`, `GET /health`, `POST /auth/signup`, and `POST /auth/login` are the
only endpoints that don't require authentication.

## API reference

Base URL defaults to `http://localhost:8080`.

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/` | No | Service discovery info |
| GET | `/health` | No | Health check |
| POST | `/auth/signup` | No | Create a user account |
| POST | `/auth/login` | No | Exchange credentials for a JWT |
| GET | `/issues` | Yes | List all issues |
| POST | `/issues` | Yes | Create an issue |
| GET | `/issues/:id` | Yes | Get an issue with its revisions |
| PUT | `/issues/:id` | Yes | Update an issue (records a revision) |
| GET | `/issues/:id/revisions` | Yes | List all revisions of an issue |
| GET | `/issues/:id/revisions/compare/:revisionA/:revisionB` | Yes | Diff two revisions |

### Example requests

```bash
# Sign up
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"correct-horse-battery"}'

# Log in
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"correct-horse-battery"}'
# => { "token": "<jwt>" }

# Create an issue
curl -X POST http://localhost:8080/issues \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: my-client" \
  -H "Authorization: <jwt>" \
  -d '{"title":"Login button unresponsive","description":"Clicking login does nothing on Safari"}'

# Update an issue (creates a revision)
curl -X PUT http://localhost:8080/issues/1 \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: my-client" \
  -H "Authorization: <jwt>" \
  -d '{"title":"Login button unresponsive on Safari 17"}'

# Compare two revisions
curl http://localhost:8080/issues/1/revisions/compare/1/2 \
  -H "X-Client-ID: my-client" \
  -H "Authorization: <jwt>"
```

### Error responses

All errors are returned as JSON with an appropriate HTTP status code:

```json
{ "message": "Check your request parameters", "errors": ["title is required and must be a non-empty string"] }
```

Unexpected server errors always return a generic message — internal
details are logged server-side only, never sent to the client.

## Project structure

```
index.js                 App entry point: env validation, DB connection, middleware wiring
config.js                 Runtime app config (port, MySQL) sourced from environment variables
config/config.js          Sequelize-CLI config for migrations (same env vars as config.js)
lib/api/                  Route handlers (auth, issues, health, discovery, response helpers)
lib/db/connection.js       Sequelize connection instance
lib/models/                Sequelize models: issue, user, revision, associations
lib/routes.js              Route table
middleware/auth.js         JWT + X-Client-ID enforcement
middleware/errorHandler.js Centralized error handling
migrations/                 Sequelize-CLI schema migrations (users, revisions)
docker-entrypoint-initdb.d/ SQL run once by the MySQL container on first start
```

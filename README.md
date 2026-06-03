# Figuritas Backend

REST API for the Figuritas sticker exchange marketplace.

**Stack:** Node.js · Express 5 · TypeScript · Prisma 5 · PostgreSQL · JWT

---

## Prerequisites

- Node.js 22+
- PostgreSQL running locally
- `npm` or `yarn`

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/figuritas_db"
JWT_SECRET="your_secret_here"
```

### 3. Create the database

```bash
# If the DB doesn't exist yet, create it via psql:
psql -U postgres -c "CREATE DATABASE figuritas_db;"
```

### 4. Run Prisma migrations

```bash
npm run db:migrate
```

This creates all tables (`users`, `user_cards`) and generates the Prisma client.

If you only want to push the schema without creating a migration history:

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon + ts-node (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output from `dist/` |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema to DB without migrations |
| `npm run db:generate` | Regenerate Prisma client |

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT |

### Album
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/album` | ✓ | List all stickers |
| GET | `/api/album/:id` | ✓ | Get a single sticker |

### Collection
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/collection` | ✓ | Get own sticker collection |
| PUT | `/api/collection` | ✓ | Update own collection |
| GET | `/api/collection/search?stickerId=` | ✓ | Find users who have a sticker available (includes location data) |

All protected routes require the header: `Authorization: Bearer <token>`

---

## Project Structure

```
src/
├── controllers/     # Business logic
├── data/            # Hardcoded album data and types
├── lib/             # Prisma client singleton
├── middleware/      # JWT auth middleware
├── routes/          # Express routers
└── index.ts         # App entry point
prisma/
└── schema.prisma    # DB schema
```

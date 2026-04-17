# Flaire — Backend

API and data layer for the Flaire chronic-illness tracking app.

- **Runtime:** Node.js + Express (TypeScript)
- **Database:** SQLite via Prisma ORM (single file — zero external services)
- **Auth:** JWT (bcrypt-hashed passwords)
- **Validation:** Zod

Everything runs locally from one folder. No Docker, no hosted DB.

---

## Quick start

```bash
cd server
npm install
npm run setup     # runs prisma migrate + seeds 6 months of demo data
npm run dev       # starts API on http://localhost:4000
```

That's it. The API is live and the demo account is ready.

### Demo login

| Field    | Value                |
| -------- | -------------------- |
| Email    | `demo@flaire.app`    |
| Username | `flaire_demo`        |
| Password | `FlaireDemo2026!`    |

Demo user: **Maya Patel** — seeded with 6 months (~180 days) of realistic symptom history, so every screen (calendar, pattern insights, trends, etc.) has something to show from day one.

---

## What gets seeded

Running `npm run setup` (or `npm run seed` on an existing DB) creates:

- **1 demo user** (Maya Patel) + 2 peer community users
- **4 medications** with ~180 days of scheduled doses (~85% adherence)
- **~180 daily check-ins** with weekly and monthly cycles for sleep / stress / mood
- **~250 localized symptom logs** across joints + **40 general symptoms** (fatigue, brain fog, etc.)
- **~180 diet log entries** including suspected trigger foods (aged cheese, red wine, tomato sauce, pizza)
- **6 flare events** across the 6-month window
- **7 medical records** (labs, imaging, appointments)
- **5 community posts** with comments
- **Computed insights** (most-affected body part, sleep ↔ flare correlation, food triggers, stress impact, severity trend)

---

## Scripts

| Command                | What it does                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Start API with hot reload (`tsx watch`)                            |
| `npm run setup`        | First-time setup: run migrations + seed demo data                  |
| `npm run seed`         | Re-run the seed (wipes and rebuilds the demo user's data)          |
| `npm run prisma:migrate` | Create / apply a new migration                                   |
| `npm run prisma:reset` | Nuke the SQLite DB and start over                                  |
| `npm run build`        | Compile to `dist/`                                                 |
| `npm run start`        | Run the compiled build                                             |

---

## Environment

Defaults are fine for local dev. Override via `.env` if you need to:

```env
DATABASE_URL="file:./flaire.db"
JWT_SECRET="flaire-dev-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
```

---

## API surface

All routes are prefixed with `/api`. Everything except `/api/auth/*` and `/api/health` requires a `Authorization: Bearer <token>` header.

| Group                   | Routes                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| `auth`                  | `POST /register`, `POST /login`, `GET /me`                          |
| `symptoms`              | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`                      |
| `medications`           | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`, dose endpoints      |
| `checkins`              | `GET /`, `POST /` (upserts by date)                                 |
| `diet`                  | `GET /`, `POST /`, `DELETE /:id`                                    |
| `flares`                | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`                      |
| `medical-records`       | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`                      |
| `community`             | posts + comments                                                    |
| `insights`              | `GET /`, `POST /refresh` (re-runs pattern detection)                |
| `calendar`              | `GET /?from=&to=` — unified feed of everything on the timeline      |
| `health`                | `GET /api/health`                                                   |

### Quick sanity check

Once the server is running:

```bash
curl http://localhost:4000/api/health
# → {"ok":true,"service":"flaire-server","timestamp":"..."}

curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@flaire.app","password":"FlaireDemo2026!"}'
# → {"token":"eyJ...","user":{...}}
```

---

## Project layout

```
server/
├── prisma/
│   ├── schema.prisma        # 13 models (User, Symptom, Medication, Flare, …)
│   └── seed.ts              # 6-month demo data generator
├── src/
│   ├── index.ts             # Express app + route mounting
│   ├── db.ts                # Prisma client + JSON-as-string helpers
│   ├── config/env.ts        # Env parsing
│   ├── middleware/
│   │   ├── auth.ts          # requireAuth (JWT)
│   │   └── error.ts         # errorHandler + HttpError
│   ├── utils/
│   │   ├── password.ts      # bcrypt wrappers
│   │   └── token.ts         # JWT sign/verify
│   ├── routes/              # One router per resource
│   └── services/
│       └── insights.service.ts  # Pattern-detection engine
└── flaire.db                # SQLite file (created on first migrate)
```

---

## Resetting the demo

Want to start over with a fresh 6 months of data?

```bash
npm run prisma:reset   # drops the DB
npm run setup          # migrates + re-seeds
```

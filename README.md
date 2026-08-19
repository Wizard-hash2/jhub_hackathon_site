# JHUB Africa Hackathons

Hackathon discovery site for **JHUB Africa × JKUAT**, built with Next.js (App Router), TypeScript, Tailwind CSS v4, Drizzle ORM and PostgreSQL.

---

## 1. Prerequisites

| Tool       | Version                  | Check with        |
| ---------- | ------------------------ | ----------------- |
| Node.js    | 20.9+ (22 LTS recommended) | `node -v`       |
| npm        | 10+                      | `npm -v`          |
| PostgreSQL | 14+                      | `psql --version`  |

Download Node from [nodejs.org](https://nodejs.org) and Postgres from [postgresql.org/download](https://www.postgresql.org/download/).

---

## 2. Open in VS Code

```bash
# unzip, then:
cd jhub-africa-hackathons
code .
```

Or: **VS Code → File → Open Folder…** and pick the unzipped folder.

Open the built-in terminal with `` Ctrl+` `` (Windows/Linux) or `` Cmd+` `` (macOS) and run the commands below from there.

### Recommended extensions

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Prettier** (`esbenp.prettier-vscode`)

---

## 3. Install dependencies

`node_modules` is not included in the zip, so install first:

```bash
npm install
```

---

## 4. Start PostgreSQL and create the database

**Option A — Docker (easiest):**

```bash
docker run --name jhub-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 -d postgres:16
```

**Option B — local Postgres install:**

```bash
psql -U postgres -c "CREATE DATABASE app_db;"
```

---

## 5. Configure environment variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

It should contain:

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

> ⚠️ **Gotcha:** the connection string also lives in `drizzle.config.json`. If you change your
> Postgres user, password, port or database name, update **both** `.env` and `drizzle.config.json`.

---

## 6. Create the database tables

```bash
npx drizzle-kit push
```

This reads `src/db/schema.ts` and creates the `hackathons` and `sponsors` tables.

---

## 7. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000**.

The database **auto-seeds itself** with 12 hackathons the first time a page queries it
(see `ensureSeeded()` in `src/lib/hackathons.ts`), so you don't need a separate seed command.

---

## 8. Pages to visit

### Public site

| Route                  | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `/`                    | Hackathons homepage — hero, filters, card grid      |
| `/hackathons/[slug]`   | Hackathon detail page (e.g. `/hackathons/ai-for-africa-2024`) |
| `/communities`         | Communities grid with Discord/WhatsApp join links   |
| `/resources`           | Resources with category filters and showcase cards  |
| `/resources/[slug]`    | Resource detail page                                |
| `/support`             | FAQ accordions + "Still need help?" card            |

### Admin portal

| Route                        | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `/admin/hackathons`          | Manage Hackathons — search, tabs, sorting, pagination, row actions |
| `/admin/hackathons/new`      | Create Hackathon form                                     |
| `/admin/hackathons/[id]/edit`| Edit stub (form screens pending)                          |

There is no auth yet — `/admin` is open in development.

---

## 9. Useful commands

```bash
npm run dev        # dev server with hot reload
npm run build      # production build
npm start          # run the production build (after npm run build)
npm run typecheck  # TypeScript check, no emit
npm run lint       # ESLint

npx drizzle-kit push    # apply schema.ts changes to the database
```

Handy raw SQL check:

```bash
psql postgresql://postgres:postgres@127.0.0.1:5432/app_db \
  -c "SELECT admin_status, count(*) FROM hackathons GROUP BY admin_status;"
```

---

## 10. Project structure

```
src/
├─ app/
│  ├─ layout.tsx                 # root layout: fonts, header, footer
│  ├─ page.tsx                   # hackathons homepage
│  ├─ globals.css                # Tailwind v4 theme tokens (dark palette)
│  ├─ hackathons/[slug]/         # public hackathon detail
│  ├─ communities/ resources/ support/
│  ├─ admin/
│  │  ├─ layout.tsx              # admin shell with sidebar
│  │  └─ hackathons/             # list view, actions.ts, new/, [id]/edit/
│  └─ api/health/                # healthcheck endpoint
├─ components/
│  ├─ site-header.tsx            # public nav (hidden on /admin)
│  ├─ site-footer.tsx            # public footer (hidden on /admin)
│  ├─ co-host-badge.tsx          # "Hosted by JHUB Africa & JKUAT"
│  ├─ status-badge.tsx           # Applications Open / Starts Soon / Ended
│  ├─ hackathon-card.tsx  community-card.tsx  resource-card.tsx
│  ├─ faq-accordion.tsx  icons.tsx
│  └─ admin/                     # sidebar, table, form, delete modal, status badge
├─ data/                         # communities.ts, resources.ts, faq.ts
├─ db/                           # index.ts (client), schema.ts, seed-data.ts
└─ lib/                          # hackathons.ts (queries), format.ts, time.ts, slugify.ts
```

### Conventions

- **Dark theme tokens** live in `src/app/globals.css` under `@theme` — use `bg-ink`,
  `bg-panel`, `bg-card`, `text-mist`, `text-fog`, `border-edge`, `text-mint`, `text-rose`, `text-sky`
  instead of raw hex values.
- **Hackathon routes are slug-based** (`/hackathons/[slug]`), never numbered.
- **Cards render from arrays** in `src/data/*` or the database — never hardcode per-page copy.
- **`CoHostBadge` is a standalone shared component** reused across pages.

---

## 11. Troubleshooting

**`DATABASE_URL is required`**
→ `.env` is missing or wasn't picked up. Create it (step 5) and restart `npm run dev`.

**`ECONNREFUSED 127.0.0.1:5432`**
→ Postgres isn't running. Start Docker container or your local Postgres service.

**`relation "hackathons" does not exist`**
→ Run `npx drizzle-kit push`.

**Port 3000 already in use**
→ `npm run dev -- -p 3001`.

**Changed `schema.ts` and things look stale**
→ Re-run `npx drizzle-kit push`. For a clean slate:
`psql $DATABASE_URL -c "DROP TABLE IF EXISTS sponsors, hackathons CASCADE;" && npx drizzle-kit push`
(the app re-seeds automatically on the next request).

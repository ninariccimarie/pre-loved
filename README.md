# Pre-Loved Listings

A TanStack Start web app for browsing pre-loved items, applying friend promo codes, and submitting reserve/waitlist requests via Formspree.

## Features

- **Public catalog** — browse all listings (available, reserved, and sold)
- **Photo carousel** — swipe through multiple photos per item
- **Promo codes** — friends enter a code to see slashed prices (gray) and sale prices (red)
- **Reserve / waitlist** — modal form with name and contact, submitted to Formspree
- **Admin dashboard** — create, edit, and delete listings; configure promo code and discount %

## Quick start

1. Create a free Postgres database on [Neon](https://console.neon.tech)
2. Copy the **pooled** and **direct** connection strings into `.env` (see below)
3. Install and run:

```bash
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install
cp .env.example .env
# Edit .env with Neon URLs, admin password, and Formspree form ID
pnpm exec prisma migrate deploy
pnpm db:seed
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public catalog. Admin is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (not linked in the menu).

Default admin password (development only): `admin123` — change `ADMIN_PASSWORD` in `.env` before deploying.

Sample promo code in seed data: `FRIENDS20` (20% off).

## Database (Neon + Prisma)

Listings and promo settings are stored in **PostgreSQL** via [Prisma](https://www.prisma.io) on [Neon](https://neon.tech) (free tier).

### Neon setup

1. Sign up at [console.neon.tech](https://console.neon.tech) and create a project
2. Open **Connection details**
3. Copy the **pooled** connection string → `DATABASE_URL` (app runtime)
4. Copy the **direct** connection string → `DIRECT_URL` (migrations)
5. Both URLs should include `?sslmode=require`

Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Prisma commands

```bash
pnpm db:generate       # Generate Prisma Client
pnpm db:migrate        # Apply migrations (production / Neon)
pnpm db:migrate:dev    # Create + apply migrations in development
pnpm db:seed           # Seed sample listings + promo settings
pnpm db:studio         # Open Prisma Studio
```

Seed data lives in `data/listings.seed.json` and `data/settings.seed.json`.

## Environment variables

| Variable | Description |
| --- | --- |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_SECRET` | Secret for signing admin session cookies |
| `VITE_FORMSPREE_FORM_ID` | Formspree form ID for reserve/waitlist submissions |
| `DATABASE_URL` | Neon **pooled** Postgres URL (Prisma Client / app) |
| `DIRECT_URL` | Neon **direct** Postgres URL (Prisma Migrate) |

## Formspree setup

1. Create a free form at [formspree.io](https://formspree.io)
2. Copy the form ID from the endpoint URL (`https://formspree.io/f/YOUR_ID`)
3. Set `VITE_FORMSPREE_FORM_ID=YOUR_ID` in `.env`

Submissions include listing title, price, buyer name, contact number, and whether it is a reservation or waitlist request.

## Admin guide

1. Sign in at `/admin/login` (hidden from the public menu — bookmark the URL)
2. Create listings with title, price (SGD or `0` for free), status, condition, description, and photo URLs
3. Set promo code and sale discount % in the dashboard
4. Mark items as reserved or sold as they move through your sale flow

Photo URLs can point to Imgur, Cloudinary, or any public image link (one URL per line in the admin form).

## Scripts

```bash
pnpm run dev      # Development server
pnpm run build    # Production build (includes prisma generate)
pnpm run start    # Run production server (after build)
pnpm run test     # Run tests
```

## Deployment (free options)

This app uses **Nitro** and connects to **Neon Postgres**. No persistent disk is required for the database.

### Recommended: Render (free tier) + Neon

1. Create a Neon project and note `DATABASE_URL` + `DIRECT_URL`
2. Push this repo to GitHub
3. Create a **Web Service** on [Render](https://render.com) and connect the repo
4. Use the included `render.yaml` blueprint, or set manually:
   - **Build command:** `corepack enable && corepack prepare pnpm@11.15.1 --activate && pnpm install --frozen-lockfile && pnpm run build`
   - **Start command:** `pnpm exec prisma migrate deploy && node .output/server/index.mjs`
5. Add environment variables from `.env.example` (including Neon `DATABASE_URL` and `DIRECT_URL`)
6. Redeploy / restart once so migrations create the `listings` and `settings` tables
7. Optionally seed once: `pnpm db:seed` with production env vars set locally
8. Copy the **Deploy Hook** URL into GitHub secret `RENDER_DEPLOY_HOOK` for CI/CD deploys

### Also supported

| Platform | Notes |
| --- | --- |
| [Railway](https://railway.com) | Connect GitHub repo; set Neon env vars |
| [Fly.io](https://fly.io) | Set Neon env vars on the app |
| [Vercel](https://vercel.com) | Works with Neon; use Nitro/Vercel preset if needed |
| [Netlify](https://netlify.com) | Set Neon env vars; add TanStack Start Netlify plugin if needed |

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **CI** — runs on every push/PR to `main`: install, build, test
- **Deploy** — on push to `main`, builds and triggers Render deploy hook (when `RENDER_DEPLOY_HOOK` is set)

### Repository variables (optional for CI)

Under **Settings → Secrets and variables → Actions → Variables**, you can set:

| Variable | Used by | Notes |
| --- | --- | --- |
| `ADMIN_PASSWORD` | CI | Falls back to `ci-test-password` |
| `SESSION_SECRET` | CI | Falls back to `ci-test-session-secret` |
| `VITE_FORMSPREE_FORM_ID` | CI | Falls back to `test_form_id` |

### Production environment secrets (required for deploy)

Create a GitHub Environment named **`production`**, then add these secrets under that environment:

| Secret | Description |
| --- | --- |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_SECRET` | Session signing secret |
| `VITE_FORMSPREE_FORM_ID` | Formspree form ID (client-side) |
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `RENDER_DEPLOY_HOOK` | Render deploy hook URL (optional; skips deploy trigger if empty) |

## Tech stack

- [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router)
- React 19, Vite 8, Nitro, Tailwind CSS 4
- Formspree for form delivery
- [Prisma](https://www.prisma.io) + [Neon](https://neon.tech) PostgreSQL

# Pre-Loved Listings

A TanStack Start web app for browsing pre-loved items, applying friend promo codes, and submitting reserve/waitlist requests via Formspree.

## Features

- **Public catalog** — browse all listings (available, reserved, and sold)
- **Photo carousel** — swipe through multiple photos per item
- **Promo codes** — friends enter a code to see slashed prices (gray) and sale prices (red)
- **Reserve / waitlist** — modal form with name and contact, submitted to Formspree
- **Admin dashboard** — create, edit, and delete listings; configure promo code and discount %

## Quick start

```bash
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install
cp .env.example .env
# Edit .env with your admin password and Formspree form ID
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public catalog. Admin is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (not linked in the menu).

Default admin password (development only): `admin123` — change `ADMIN_PASSWORD` in `.env` before deploying.

Sample promo code in seed data: `FRIENDS20` (20% off).

## Database

Listings and promo settings use **SQLite** through Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) module — free, zero signup, no extra packages.

- Local file: `data/pre-loved.db` (created automatically on first run)
- Sample rows are seeded from `data/listings.seed.json` and `data/settings.seed.json` when the DB is empty
- On Render/Railway, put the file on a persistent disk via `DATA_DIR=/data`

## Environment variables

| Variable | Description |
| --- | --- |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_SECRET` | Secret for signing admin session cookies |
| `VITE_FORMSPREE_FORM_ID` | Formspree form ID for reserve/waitlist submissions |
| `DATA_DIR` | Folder for the SQLite file (default: `./data`) |
| `DATABASE_PATH` | Optional full path to the SQLite DB (default: `$DATA_DIR/pre-loved.db`) |

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
pnpm run build    # Production build
pnpm run start    # Run production server (after build)
pnpm run test     # Run tests
```

## Deployment (free options)

This app uses **Nitro** and runs as a Node server. Listings live in a **SQLite** database file (via Node's built-in `node:sqlite` — no paid database service needed). Use a host with **persistent disk** so the DB survives restarts.

### Recommended: Render (free tier)

1. Push this repo to GitHub
2. Create a **Web Service** on [Render](https://render.com) and connect the repo
3. Use the included `render.yaml` blueprint, or set manually:
   - **Build command:** `corepack enable && corepack prepare pnpm@11.15.1 --activate && pnpm install --frozen-lockfile && pnpm run build`
   - **Start command:** `node .output/server/index.mjs`
   - **Disk:** mount at `/data` and set `DATA_DIR=/data`
4. Add environment variables from `.env.example`
5. Copy the **Deploy Hook** URL into GitHub secret `RENDER_DEPLOY_HOOK` for CI/CD deploys

### Also supported

| Platform | Notes |
| --- | --- |
| [Railway](https://railway.com) | Connect GitHub repo; add a volume for `/data` |
| [Fly.io](https://fly.io) | Attach a volume; set `DATA_DIR` |
| [Cloudflare Workers](https://developers.cloudflare.com/workers/) | Prefer Cloudflare D1 instead of a local SQLite file |
| [Netlify](https://netlify.com) | Prefer Turso/Neon/Supabase free tier instead of a local file |

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
| `ADMIN_PASSWORD` | Admin login password baked into the build |
| `SESSION_SECRET` | Session signing secret |
| `VITE_FORMSPREE_FORM_ID` | Formspree form ID (client-side) |
| `RENDER_DEPLOY_HOOK` | Render deploy hook URL (optional; skips deploy trigger if empty) |

## Tech stack

- [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router)
- React 19, Vite 8, Nitro, Tailwind CSS 4
- Formspree for form delivery
- SQLite (`node:sqlite`) for listings and promo settings — free, no external DB account

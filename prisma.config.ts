import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prefer Neon's direct (non-pooler) URL for migrations; fall back to DATABASE_URL.
// Placeholder allows `prisma generate` in CI without a live database.
const datasourceUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/preloved?sslmode=disable'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: datasourceUrl,
  },
})

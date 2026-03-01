## Commands

```bash
# Lint & format
pnpm lint:fix      # auto-fix

# Build (type check + Vite)
pnpm build

# Data scripts
pnpm scraper       # Run all scrapers (packs, missions, decks)
pnpm sync-locales  # Sync i18n locale files
```

No test framework is configured — there are no unit or integration tests.

## Architecture

**Monorepo** managed with pnpm workspaces:
- `frontend/` — React 19 SPA (the main application)
- `supabase/` — PostgreSQL DB + Deno edge functions (backend)
- `scripts/` — Data scrapers and utilities

### Frontend

React Router (hash-based) + TanStack React Query + Supabase JS client. Pages are lazy-loaded. Code quality enforced by Biome (formatter + linter, 160-char line width, single quotes, no semicolons).

```
frontend/src/
├── pages/        # Route components (lazy-loaded via React.lazy)
├── components/   # Shared UI — shadcn/ui primitives live in components/ui/
├── services/     # All Supabase calls, grouped by domain
├── lib/          # Utilities: CardsDB.ts, filters.ts, stats.ts, supabase.ts
├── context/      # ChatContext/Provider, DialogContext
├── hooks/        # Custom hooks (React Query patterns)
├── types/        # Shared TypeScript types
└── App.tsx       # Root component + router definition
```

**Services pattern:** each domain (collection, decks, trade, friends, chat, scanner…) has its own folder in `services/` with Supabase queries and React Query hooks. Mutations invalidate the relevant query cache.

**Path alias:** `@/*` maps to `frontend/src/*`.

### Backend (Supabase)

- Auth: OTP email + SSO (`supabase/functions/sso/`)
- Edge functions (Deno): `stats-tracker`, `get-trading-partners`, `manage-friend`
- Database schema managed via Supabase migrations

### Data & Card Database

Card/pack/mission data is scraped and stored as static assets. `frontend/src/lib/CardsDB.ts` is the primary interface for querying card data. Expansion sets are identified by codes like `A1`, `A2`, `B1`, `B2`, etc.

## Key Domain Concepts

- **Expansions/Sets:** Game content groups with packs (e.g., Genetic Apex = A1)
- **Rarities:** `◊` `◊◊` `◊◊◊` `◊◊◊◊` `☆` `☆☆` `☆☆☆` `✵` Crown Rare
- **Friend states:** `pending` / `accepted` / `declined` / `revoked`
- **Trade statuses:** `offered` / `accepted` / `declined` / `finished`

## Deployment

- Frontend deployed to GitHub Pages (automatic on push to `main`)
- `pnpm build` output goes to `frontend/dist/`
- Domain: tcgpocketcollectiontracker.com

## Adding a New Set/Pack

See `.claude/projects/.../memory/adding-new-set.md` or use the `/add-set` skill.

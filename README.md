# White-Label Trading Platform Template

A configurable Next.js brokerage-template application with public marketing pages, a customer portal, an admin desk, Prisma-backed data, local uploads, simulated trading, membership packages, wallet funding approval, staking, and optional market data.

> **Important:** This is software infrastructure—not a licensed brokerage, payment processor, trading venue, custodian, or KYC/AML service. Obtain legal, compliance, security, payments, market-data, and operational review before accepting real money, orders, or regulated customer data.

## Contents

- [Quick start](#quick-start)
- [What is included](#what-is-included)
- [Configuration](#configuration)
- [Currency and FX](#currency-and-fx)
- [Database options](#database-options)
- [Market data](#market-data)
- [Useful commands](#useful-commands)
- [Deployment checklist](#deployment-checklist)
- [Before launch](#before-launch)

## Quick start

### Requirements

- Node.js 20 or newer
- npm 10 or newer
- SQLite for local evaluation, or one hosted PostgreSQL provider for deployment
- Optional API accounts: CoinGecko for crypto and Twelve Data for forex, shares, indices, ETFs, and commodities

### Run locally

```bash
npm install
cp .env.example .env
npm run prisma:generate
npx prisma db push
npm run seed
npm run dev
```

On Windows PowerShell, replace the copy command with:

```powershell
Copy-Item .env.example .env
```

The supplied `.env.example` uses SQLite (`file:./dev.db`) and safe mock fallbacks when market-data keys are blank. This is the recommended local evaluation setup.

### Local client demo

A client can clone the repository and run the commands above to use a complete local demo before a hosted database is chosen. `npx prisma db push` creates a private SQLite `dev.db` for that machine; `npm run seed` adds the starting membership packages. New users can then register, sign in, submit KYC or funding requests, and use the other database-backed demo flows locally.

Before sharing the project, replace the `HUMAN_CHALLENGE_SECRET` placeholder in `.env` with a long random value. For example, in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Copy the printed value into `.env` after `HUMAN_CHALLENGE_SECRET=`. Never commit `.env` or the generated `dev.db`. SQLite is only for local evaluation: use hosted PostgreSQL before deploying the shared client backend to Vercel.

## What is included

- Public marketing, instrument, education, legal, FAQ, and contact pages
- Account registration, authentication, onboarding, profile, verification, and support areas
- Customer dashboard with simulated trading, positions, wallet activity, deposits, withdrawals, copy trading, staking, and memberships
- Admin desk for customer operations, payment instruction details, deposit approvals, and membership-package configuration
- Membership payments from a customer’s Live wallet; wallet deposits require administrator approval before the balance changes
- Display-currency selector with indicative FX conversion and a bundled fallback snapshot
- Config-driven branding, theme, content, and asset selection

## Configuration

### Brand and content

| Area | Location |
| --- | --- |
| Primary brand configuration | `config/brand.config.ts` |
| Brand schema | `config/brand.schema.ts` |
| Brand assets | `brands/<brand-name>/` |
| Generated theme variables | `lib/theme.ts` |

Create a starter brand:

```bash
npm run new-brand -- --name "Acme"
```

Run a selected brand:

```bash
BRAND=acme npm run dev
```

PowerShell:

```powershell
$env:BRAND="acme"; npm run dev
```

### Environment variables

Copy `.env.example` to `.env` for local use. In production, use your host’s encrypted environment-variable settings. Never commit `.env`, API keys, database passwords, or connection URLs.

Set `NEXT_PUBLIC_AUTO_TRANSLATE=false` to disable browser-based Google Website Translator.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string. SQLite locally; PostgreSQL for Neon or Supabase deployments. |
| `HUMAN_CHALLENGE_SECRET` | Recommended | Long random, server-only value used to sign the 10-minute registration verification check. The database URL is used only as a compatibility fallback. |
| `MARKET_DATA_PROVIDER` | No | Use `mock` for fully local/demo data. Any other value uses the hybrid live-provider path with safe fallbacks. |
| `CG_API_KEY` | Optional | CoinGecko Demo API key for live crypto quotes and search. |
| `TWELVE_DATA_API_KEY` | Optional | Twelve Data key for non-crypto quotes and historical data. |
| `BRAND` | Optional | Selects a generated brand configuration. |

## Live and Demo account separation

Every customer has isolated **Live** and **Demo** account modes. The Trade Desk selector controls which account receives a simulated order, reserves margin, and records its position and trade ledger events. Assets & Treasury and Wallet each provide the same selector and show only the selected account’s balance, open positions, and activity.

- **Live** is the only mode that accepts deposits and withdrawal requests.
- **Demo** uses virtual allocations only; it cannot be funded, withdrawn, or combined with Live capital.
- Existing local records are classified as Live when the account-mode schema update is applied.

After pulling this change locally, run `npm run prisma:generate` and `npx prisma db push`. For a hosted deployment, apply the corresponding Prisma schema change to the production database before deploying the application.
## Currency and FX

All ledger balances, trades, deposits, and withdrawals settle in USD. The currency selector changes only the displayed, indicative conversion.

The FX adapter uses Exchange Rate API’s open endpoint. The provider requires the visible “Rates By Exchange Rate API” attribution link and has its own rate-limit and redistribution terms. Review the provider’s current terms before production use.

`npm run build` refreshes the bundled fallback snapshot first. A timeout or provider failure keeps the existing snapshot and does not fail the build.

## Database and Vercel deployment

Local development uses SQLite with `prisma/schema.prisma`. Production uses the committed PostgreSQL schema at `prisma/schema.postgres.prisma` and the committed migration in `prisma/migrations/`.

For a new hosted PostgreSQL database (Neon, Supabase, or another managed provider), set `DATABASE_URL` to its PostgreSQL connection string in Vercel. The included Vercel build runs `npm run prisma:deploy` before the Next.js build: it generates the PostgreSQL client and runs `prisma migrate deploy`. Do not change the local SQLite schema when preparing a deployment.

For an existing PostgreSQL database previously created with `prisma db push`, first back it up. Align it to `prisma/schema.postgres.prisma`, then baseline the initial migration using `npx prisma migrate resolve --schema prisma/schema.postgres.prisma --applied 20261016094500_init_postgres`. Do this once only, after verifying the database matches the schema.

### Membership, staking, and copy-trading rules

- Standard includes four staking assets and one copy strategy; Pro includes seven assets and four strategies; VIP includes all ten assets and seven strategies.
- The API, not only the UI, checks each entitlement before creating a stake or strategy subscription.
- A stake reduces the Live balance. Rewards accrue continuously as `principal × (base APY + membership bonus) × elapsed seconds / seconds in a year`. Claiming rewards credits the Live balance; unstaking is permitted only after any configured lock and returns principal plus unclaimed reward.
- A copy subscription reserves its allocation in Live `marginUsed`; pausing keeps it reserved, and stopping releases it. Membership payments and withdrawals cannot spend reserved capital.
- These are deterministic template simulations. They do not connect to an exchange, execute external master-trader orders, or promise investment performance.
## Market data

Without API keys, the app falls back to safe demo/mock data where appropriate. Keep production keys server-side—never use `NEXT_PUBLIC_*` variables, browser code, screenshots, or source control.

### CoinGecko — crypto

1. Create a CoinGecko account and Demo API key.
2. Set `CG_API_KEY` locally and in your deployment host.
3. Restart the development server or redeploy.

The server sends the key as `x-cg-demo-api-key`. Review [CoinGecko authentication documentation](https://docs.coingecko.com/reference/authentication) for current limits and plan rules.

### Twelve Data — forex, shares, indices, ETFs, and commodities

1. Create a Twelve Data account and copy its API key.
2. Set `TWELVE_DATA_API_KEY` locally and in your deployment host.
3. Restart the development server or redeploy.

The application calls Twelve Data’s `/quote` and `/time_series` endpoints from the server. Review [Twelve Data documentation](https://twelvedata.com/docs) for coverage, entitlements, rate limits, and redistribution terms.

## Useful commands

```bash
npm run dev              # Start the Turbopack development server
npm run typecheck        # TypeScript validation
npm run test:fx          # FX-route checks
npm run build            # Refresh fallback FX data and create a production build
npm run start            # Run an existing production build
npm run prisma:generate  # Generate the Prisma client
npm run seed             # Seed plans, admin, and demo records
npm run new-brand -- --name "Acme"
npm run check:brand-leaks
npm run crawl
```

## Deployment checklist

1. Create your own Git repository, hosting account, and database project.
2. Configure `DATABASE_URL`, `CG_API_KEY`, and `TWELVE_DATA_API_KEY` as encrypted deployment variables.
3. Move local `uploads/` storage to durable object storage before handling real KYC, payment proofs, or support attachments on serverless hosting.
4. Run `npm run typecheck` and `npm run build` before deployment.
5. Deploy, then test registration, login, dashboard access, admin authorization, uploads, payment-request approval, membership payment, and market-data fallback.
6. Configure backups, monitoring, HTTPS/domain settings, rate limiting, and incident processes.

### Vercel guidance

Deploy this as a **Next.js** App Router project. Do not add a catch-all SPA rewrite such as `/(.*) -> /index.html`; it would intercept API routes, authenticated dashboards, and Next’s 404 page.

The included `vercel.json` pins the framework, generates the PostgreSQL client, and deploys committed migrations during the build. Set all production variables before deployment, then verify `/`, `/auth/register`, `/auth/login`, `/admin/login`, and an intentionally invalid URL.

Payment QR images uploaded through **Admin → Deposit details** are stored in the database rather than the Vercel filesystem. Keep individual QR images at or below 2 MB.

## Before launch

- Replace all placeholder contact details, legal content, payment instructions, support details, and brokerage claims.
- The trading flows are simulation-oriented template features; they are not live execution connectivity to a broker or exchange.
- Deposits should remain pending until an authorized administrator approves them.
- Verify all provider pricing, quotas, licensing terms, and regional availability directly with the provider.
- Obtain appropriate legal, regulatory, security, privacy, payments, AML/KYC, and operational review before accepting real customer funds or personal data.
"# fx-broker-" 
"# fx-broker-" 

# GameGift Studio

GameGift Studio is a consumer launch build for a self-serve personalized board-game gift business.

It ships a US-only, guest-checkout storefront with five legally distinct customizable templates:

- `Home Turf`
- `Milestone Trail`
- `Face Card`
- `Case File`
- `Trivia Trek`

Customers answer a template-specific questionnaire, generate a personalized preview, edit the result, pay with Stripe Checkout, and receive either:

- an instant digital print kit, or
- a boxed physical game routed through The Game Crafter

All customer-visible text is rendered deterministically in SVG/PDF. OpenAI is used for structured copy generation and optional decorative art only. The product does not clone or reference protected board-game brands, layouts, or trade dress.

## Launch scope

Current launch assumptions:

- US-only physical fulfillment
- guest checkout only
- Stripe as merchant of record
- Neon-compatible Postgres via Prisma
- Replit App Storage in production, local filesystem fallback in development
- The Game Crafter as the single automated physical provider

Launch catalog:

- `Home Turf`: Digital Print Kit `$49`, Retail-ready boxed game `$99`
- `Milestone Trail`: Digital Print Kit `$39`, Retail-ready boxed game `$89`
- `Face Card`: Digital Print Kit `$49`, Retail-ready boxed game `$99`
- `Case File`: Digital Print Kit `$49`, Retail-ready boxed game `$99`
- `Trivia Trek`: Digital Print Kit `$39`, Retail-ready boxed game `$79`

`Premium Gift Box` is intentionally disabled.

## What the app includes

- premium storefront landing page and template catalog
- template-specific create flow at `/create/[templateSlug]`
- guest preview editor with one regeneration allowance
- live shipping quote retrieval for physical orders
- Stripe Checkout session creation with shipping quote selection
- Stripe webhook fulfillment orchestration
- deterministic board, cards, rules, and fulfillment manifest generation
- local or Replit App Storage-backed asset persistence
- guest order lookup by order number and email
- password-protected admin ops console
- transactional email hooks via Resend
- lightweight Sentry reporting, PostHog bootstrapping, and Turnstile verification hooks
- vendor sync endpoint for scheduled polling/reconciliation

## Template architecture

Each template owns its own:

- form schema
- AI generation pipeline
- fallback generation pipeline
- deterministic board renderer
- deck labels and tile types
- pricing
- BOM summary
- The Game Crafter component SKU mapping

This is implemented through the template registry in `lib/templates/registry.ts`.

## Core routes

Storefront and customer experience:

- `/`
- `/create`
- `/create/[templateSlug]`
- `/preview/[projectId]`
- `/order/success`
- `/order/lookup`
- `/faq`
- `/shipping-policy`
- `/refund-policy`
- `/privacy`
- `/terms`
- `/contact-support`

Operations:

- `/admin`

## API routes

- `POST /api/projects`
- `PATCH /api/projects/[projectId]`
- `POST /api/projects/[projectId]/regenerate`
- `POST /api/shipping/quotes`
- `POST /api/checkout/create-session`
- `POST /api/webhooks/stripe`
- `GET /api/orders/lookup`
- `POST /api/admin/login`
- `POST /api/admin/actions`
- `POST /api/internal/vendor-sync`
- `GET /api/files/[...segments]`

## Environment variables

Copy `.env.example` to `.env` and fill in the values you need.

```bash
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_IMAGE_SIZE=2048x2048
OPENAI_IMAGE_QUALITY=high
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ADMIN_PASSWORD=
SUPPORT_EMAIL=support@gamegiftstudio.com
SOFT_LAUNCH_ENABLED=true
LAUNCH_ENABLED_TEMPLATES=home-turf,milestone-trail,face-card,case-file,trivia-trek
PHYSICAL_CHECKOUT_ENABLED=true
ALLOW_MOCK_PHYSICAL_CHECKOUT=
SOFT_LAUNCH_BANNER_COPY=Soft launch: proofs, digital kits, and boxed US orders are open.
LAUNCH_PRODUCTION_ETA_COPY=Boxed games usually enter production within 1 business day after checkout.
LAUNCH_SHIPPING_ETA_COPY=Live shipping options show production plus transit timing before payment.
LAUNCH_SUPPORT_PROMISE_COPY=Founder-run email support replies by the next business day during soft launch.
PHYSICAL_CHECKOUT_DISABLED_MESSAGE=Boxed checkout is temporarily paused while we review production capacity.
REPLIT_APP_STORAGE_BUCKET_ID=
TGC_API_KEY_ID=
TGC_USERNAME=
TGC_PASSWORD=
TGC_PAYMENT_METHOD=shopcredit
TGC_HOME_TURF_BOARD_SKU=
TGC_HOME_TURF_DECK_PRIMARY_SKU=
TGC_HOME_TURF_DECK_SECONDARY_SKU=
TGC_HOME_TURF_RULEBOOK_SKU=
TGC_HOME_TURF_PIECES_KIT_SKU=
TGC_HOME_TURF_BOX_SKU=
TGC_MILESTONE_TRAIL_BOARD_SKU=
TGC_MILESTONE_TRAIL_DECK_PRIMARY_SKU=
TGC_MILESTONE_TRAIL_DECK_SECONDARY_SKU=
TGC_MILESTONE_TRAIL_RULEBOOK_SKU=
TGC_MILESTONE_TRAIL_PIECES_KIT_SKU=
TGC_MILESTONE_TRAIL_BOX_SKU=
TGC_FACE_CARD_BOARD_SKU=
TGC_FACE_CARD_DECK_PRIMARY_SKU=
TGC_FACE_CARD_DECK_SECONDARY_SKU=
TGC_FACE_CARD_RULEBOOK_SKU=
TGC_FACE_CARD_PIECES_KIT_SKU=
TGC_FACE_CARD_BOX_SKU=
TGC_CASE_FILE_BOARD_SKU=
TGC_CASE_FILE_DECK_PRIMARY_SKU=
TGC_CASE_FILE_DECK_SECONDARY_SKU=
TGC_CASE_FILE_RULEBOOK_SKU=
TGC_CASE_FILE_PIECES_KIT_SKU=
TGC_CASE_FILE_BOX_SKU=
TGC_TRIVIA_TREK_BOARD_SKU=
TGC_TRIVIA_TREK_DECK_PRIMARY_SKU=
TGC_TRIVIA_TREK_DECK_SECONDARY_SKU=
TGC_TRIVIA_TREK_RULEBOOK_SKU=
TGC_TRIVIA_TREK_PIECES_KIT_SKU=
TGC_TRIVIA_TREK_BOX_SKU=
RESEND_API_KEY=
EMAIL_FROM=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
CRON_SECRET=
```

Notes:

- `OPENAI_API_KEY` is optional for local development. If missing or if generation fails, the app falls back to deterministic template-specific copy generation.
- `OPENAI_IMAGE_MODEL` defaults to `gpt-image-2`, the latest GPT Image model in the OpenAI Image API.
- `OPENAI_IMAGE_SIZE` defaults to `2048x2048`; `OPENAI_IMAGE_QUALITY` defaults to `high`.
- The committed storefront sample boards in `public/template-showcase/` were produced through Codex local image generation for development proofing, so local showcase images do not require `OPENAI_API_KEY`.
- To regenerate storefront sample boards through the production API path instead, set `OPENAI_API_KEY` and run `npm run images:showcase`. This uses a three-step QA loop for each image: generate the board, run a gameplay/prepress review, run a personalization review against the example inputs, then revise up to three attempts before writing `public/template-showcase/[templateSlug].png`.
- Customer board artwork in production uses the same QA loop before checkout/final export. Each approved generation stores `board-artwork-attempt-[n].png` files plus `board-artwork-review.json`; unapproved art is not promoted to the final `board-artwork.png`.
- Storefront example text is overlaid deterministically by the app, not generated inside the images.
- `LAUNCH_ENABLED_TEMPLATES` controls which formats are visible and creatable.
- `PHYSICAL_CHECKOUT_ENABLED=false` pauses new boxed quotes and checkout without disabling digital orders.
- `ALLOW_MOCK_PHYSICAL_CHECKOUT` is intended for local/dev only. In production, boxed checkout automatically pauses unless live The Game Crafter credentials and SKU maps are configured.
- Physical quoting and fulfillment require the `TGC_*` variables plus live component SKUs for each launch template.
- `REPLIT_APP_STORAGE_BUCKET_ID` enables Replit App Storage. Without it, generated files are stored locally under `public/generated/...`.
- `CRON_SECRET` protects the scheduled vendor-sync endpoint.
- `ADMIN_PASSWORD` protects `/admin`.

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Configure `.env`.

3. Generate Prisma client and push the schema.

```bash
npm run db:generate
npm run db:push
```

4. Seed demo data.

```bash
npm run db:seed
```

5. Start the app.

```bash
npm run dev
```

For the local Codex/browser preview port used during development:

```bash
npm run dev:local
```

Run the local readiness gate:

```bash
npm run launch:check:local
```

Run the strict production readiness gate before opening traffic:

```bash
npm run launch:check
```

## Demo flow

1. Open `http://localhost:3000`
2. Pick a template from `/create`
3. Complete the wizard
4. Generate the preview
5. Edit the copy if needed
6. For physical orders, request shipping quotes and select one
7. Proceed to Stripe Checkout
8. Complete payment
9. Visit `/order/success?session_id=...`

## Stripe setup and local webhook testing

Required for checkout:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

Recommended:

- enable Stripe Tax in your Stripe account
- keep the store in test mode until both digital and physical internal orders pass

Local webhook flow:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the signing secret from Stripe CLI into `STRIPE_WEBHOOK_SECRET`.

Webhook behavior:

- marks the order paid
- generates final assets if needed
- sends digital-ready email for digital orders
- submits physical orders to The Game Crafter when configured
- falls back cleanly if provider setup is incomplete

## The Game Crafter fulfillment model

Physical fulfillment is built around pre-approved component maps, not arbitrary one-off part sourcing.

Each launch template expects live SKUs for:

- board
- primary deck
- secondary deck
- rulebook
- stock pieces kit
- box

Template env groups:

- `TGC_HOME_TURF_*`
- `TGC_MILESTONE_TRAIL_*`
- `TGC_FACE_CARD_*`
- `TGC_CASE_FILE_*`
- `TGC_TRIVIA_TREK_*`

The app currently does all of the following:

- stores template SKU mappings in the database
- collects US shipping details
- creates a The Game Crafter quote cart
- fetches live shipping methods and pricing
- freezes the selected shipping quote on the order
- charges product + shipping in Stripe
- submits the paid physical order to The Game Crafter
- stores vendor cart, receipt, and shipment sync state
- exposes retry/sync actions in admin

Important operational truth:

- this repo assumes you already have the per-template board, deck, booklet, pieces, and box SKUs configured in The Game Crafter
- the app submits those preconfigured SKUs plus the generated asset references/manifest and packout checklist
- this is not a marketplace of arbitrary custom games; it is a controlled product catalog

## Storage

Production target:

- Replit App Storage via `@replit/object-storage`

Development fallback:

- `public/generated/[projectId]/...`

Generated assets include:

- board preview image
- board final PNG
- board final PDF
- primary deck PDF
- secondary deck PDF
- rules PDF
- fulfillment manifest JSON

File delivery is abstracted through `lib/storage/index.ts` and served by `/api/files/[...segments]`.

## Admin and operations

`/admin` is protected by `ADMIN_PASSWORD`.

The admin console supports:

- filtering and reviewing projects/orders
- viewing shipping quote status
- viewing vendor order and shipment state
- viewing generated files
- regenerating final assets
- creating mock fulfillment jobs
- syncing vendor orders
- refunding Stripe orders
- canceling vendor orders
- expiring stale quotes

## Scheduled jobs

Use Replit Scheduled Deployments or another cron runner to call:

- `POST /api/internal/vendor-sync`

Provide `CRON_SECRET` via either:

- `x-cron-secret` header, or
- `?secret=...` query parameter

The scheduled job currently:

- syncs pending vendor orders and shipment status
- expires stale shipping quotes

## Observability and anti-abuse

- server-side error reporting helper for Sentry DSN
- PostHog bootstrap hooks in the app shell
- Cloudflare Turnstile verification on project generation endpoints when configured

## Database overview

Major models:

- `GameTemplate`
- `TemplatePriceBook`
- `VendorSkuMap`
- `Project`
- `ProjectItem`
- `GeneratedAsset`
- `ShippingQuote`
- `Order`
- `FulfillmentJob`
- `VendorOrder`
- `VendorShipment`
- `OperationalEvent`

Schema source:

- `prisma/schema.prisma`

## Tests and verification

Typecheck:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Tests:

```bash
npm run test
```

Production build:

```bash
npm run build
```

## Operational launch checklist

Before taking real consumer orders:

- add real support mailbox and verified sending domain
- configure Neon production database
- configure Replit App Storage bucket
- configure Stripe live keys, tax, and webhook endpoint
- configure The Game Crafter merchant credentials
- assign real live board, deck, rulebook, pieces-kit, and box SKUs for all 5 templates
- confirm shipping/handling ranges and gross margins
- run 1 successful internal digital order per template
- run 1 successful internal physical order per template
- verify guest lookup, emails, refunds, and shipment sync
- schedule `/api/internal/vendor-sync`

## Current known limitations

- The Game Crafter integration is designed around prebuilt component SKU maps; it does not create fully bespoke vendor products on the fly.
- Shipment sync depends on valid live vendor credentials and receipt IDs.
- Email sending is skipped when Resend is not configured.
- Sentry integration is lightweight DSN posting, not the full `@sentry/nextjs` package.
- Customer accounts are intentionally out of scope for launch.

## Additional docs

- `docs/sourcing-delivery.md`
- `docs/launch-operations.md`

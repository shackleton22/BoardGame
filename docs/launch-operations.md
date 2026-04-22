# Launch Operations

This document is the operator checklist for getting GameGift Studio from code-complete to consumer-ready.

## 1. Infrastructure

- deploy the app on Replit Autoscale
- provision Neon Postgres and set `DATABASE_URL`
- configure `NEXT_PUBLIC_APP_URL` with the production domain
- configure `REPLIT_APP_STORAGE_BUCKET_ID`
- add production secrets for Stripe, OpenAI, The Game Crafter, Resend, PostHog, Turnstile, and `CRON_SECRET`

## 2. Stripe

- enable Stripe Tax
- configure the production webhook endpoint
- verify `checkout.session.completed` reaches `/api/webhooks/stripe`
- test one digital and one physical order in test mode
- verify refund flow from `/admin`

## 3. The Game Crafter

- create/confirm merchant credentials
- create one preconfigured boxed bundle SKU per launch template
- fill:
  - `TGC_TEMPLATE_LIFE_QUEST_SKU`
  - `TGC_TEMPLATE_MYSTERY_NIGHT_SKU`
  - `TGC_TEMPLATE_INSIDE_JOKE_SHOWDOWN_SKU`
- verify quote retrieval from `/api/shipping/quotes`
- verify vendor submission after Stripe webhook payment
- verify receipt/shipment sync using `/api/internal/vendor-sync`

## 4. Customer support and email

- replace the default support email with the real production mailbox
- verify sending domain and sender in Resend
- test:
  - preview created
  - order confirmation
  - digital ready
  - physical submitted
  - shipment update
  - refund notice

## 5. Scheduled jobs

Create a scheduled request to:

- `POST /api/internal/vendor-sync`

Recommended cadence:

- every 30 to 60 minutes during launch week

Required auth:

- header `x-cron-secret: <CRON_SECRET>`

## 6. Go-live QA

Run this for each template:

- create preview on desktop
- create preview on mobile
- edit preview copy
- request physical shipping quotes
- create checkout session
- complete test payment
- verify success page
- verify guest order lookup
- verify admin timeline and asset list

## 7. Launch gating

Do not open public traffic until all of these are true:

- all 3 templates generate previews successfully
- live shipping quotes return for physical orders
- Stripe webhook finalization works
- digital asset downloads work
- physical order submission works
- shipment polling works
- support mailbox is monitored
- legal and policy pages are live on the production domain

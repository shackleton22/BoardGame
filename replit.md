# GameGift Studio On Replit

This repository is a Next.js storefront and ops dashboard for GameGift Studio.

Replit should run the app through the `.replit` workflow using:

- `npm run replit:dev` for the workspace run button
- `npm run replit:start` for autoscale deployment

## If Replit still shows the old skills library

That means the Repl is still using an older commit or older `.replit` config.

Fix it by:

1. pulling the latest changes from `main`
2. restarting the Repl
3. rerunning the workspace after dependencies install

## Expected local port

- `3000`

## Required environment variables before the app is truly usable

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_PASSWORD`
- Stripe keys
- optional OpenAI, Turnstile, Resend, PostHog, Sentry, and The Game Crafter keys

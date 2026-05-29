# Web App Template

Full-stack app template with React, Express, Supabase Auth, Stripe Checkout,
Stripe webhooks, server-owned subscription status, and early groundwork for
future API usage limits.

This README is intentionally detailed because this repo is meant to be reused
as a starting point in new projects. It explains not just what exists, but why
certain security-sensitive pieces live where they do.

## Current Architecture

The app is split into:

- `frontend`: Vite, React, TypeScript, React Router, Supabase Auth, Mixpanel.
- `backend`: Express API, Stripe Checkout/webhooks, Supabase service-role client.
- Supabase: Auth, Postgres, RLS-protected app tables.
- Stripe: hosted Checkout and subscription lifecycle webhooks.

The frontend handles UI and Supabase browser auth. The backend handles anything
that requires secrets, trusted writes, billing status checks, and future paid API
usage enforcement.

High-level flow:

```txt
User signs in with Supabase
-> frontend gets a Supabase access token
-> frontend calls backend with Authorization: Bearer <token>
-> backend verifies token with Supabase
-> backend derives user.id itself
-> backend performs trusted work with Stripe/Supabase service role
```

The frontend should not be trusted to provide sensitive identifiers such as
`userId`, plan status, usage limits, Stripe customer ids, or API limits. It can
display those outcomes, but the backend should decide them.

## Environment Variables

Copy the example files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Frontend

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_MIXPANEL_TOKEN=your_mixpanel_project_token
```

Frontend env vars are bundled into browser code. Only put public/browser-safe
values here.

Safe frontend values:

- `VITE_API_URL`: backend API origin.
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable/browser key.
- `VITE_MIXPANEL_TOKEN`: Mixpanel project token.

Never put backend secrets in `frontend/.env`.

### Backend

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_stripe_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

These must stay backend-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- future paid API keys, such as `OPENAI_API_KEY`

The Supabase service-role key bypasses RLS. That is useful for trusted backend
jobs, but dangerous if exposed to users.

## Local Development

Install dependencies in the root, frontend, and backend as needed.

Run the frontend and backend together:

```bash
npm run dev
```

For local Stripe webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` value into `backend/.env` as:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

Stripe dashboard webhooks need a public URL, so local development uses the
Stripe CLI to forward events to the local Express server.

## Supabase Auth

The frontend uses Supabase Auth directly for sign up, sign in, Google OAuth,
and sign out.

The backend verifies authenticated requests using the Supabase access token:

```txt
Authorization: Bearer <supabase_access_token>
```

The backend helper calls `supabase.auth.getUser(token)` and derives the user id
from the verified token. This is important because the backend should not trust
a `userId` sent in a request body.

## Backend Supabase Service Client

`backend/lib/supabase.js` creates a Supabase client with:

```js
auth: {
  persistSession: false,
  autoRefreshToken: false,
}
```

Those options are used because the backend service client is not a browser user
session. It should not store sessions or auto-refresh user tokens.

This service client is used for trusted server-side operations:

- writing Stripe subscription status
- reading billing status for a verified user
- writing future API usage events
- checking future usage limits

Users should never receive or interact with this service-role client.

## Billing Flow

Authenticated users start Stripe Checkout from the main page.

The frontend calls:

```txt
POST /api/create-checkout-session
```

with:

```txt
Authorization: Bearer <supabase_access_token>
```

The backend verifies the token, derives `user.id`, and creates a Stripe Checkout
Session. The verified Supabase user id is attached to Stripe using:

- `client_reference_id`
- Checkout Session metadata
- Subscription metadata

Stripe webhooks then update the server-owned `subscriptions` table in Supabase.

The frontend asks the backend for billing status:

```txt
GET /api/billing/status
```

The backend returns only:

```json
{
  "hasPro": true
}
```

Subscription records, Stripe customer ids, Stripe subscription ids, and other
sensitive billing details should not be exposed directly to the frontend.

## Stripe Webhooks

The webhook route is mounted before `express.json()` because Stripe signature
verification needs the raw request body:

```txt
POST /api/stripe/webhook
```

The handler verifies the Stripe signature using `STRIPE_WEBHOOK_SECRET`.

Useful events currently handled/logged:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Subscription created/updated/deleted events are the main source of truth for
plan access. Invoice events are useful later for payment history or failed
payment behavior, but this template currently uses subscription events for the
core `hasPro` status.

## Supabase Tables And RLS

The sensitive app tables are intended to be server-owned:

- `public.subscriptions`
- `public.usage_events`

Both should have RLS enabled. Normal `anon` and `authenticated` roles should
not have direct access. The backend uses the Supabase service role to read and
write these tables after verifying the user or verifying a Stripe webhook.

### Subscriptions Table

The subscriptions table stores Stripe subscription state:

```sql
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

revoke all on public.subscriptions from anon;
revoke all on public.subscriptions from authenticated;

grant select, insert, update, delete on public.subscriptions to service_role;
```

The webhook uses `upsert` on `stripe_subscription_id`. Upsert means:

```txt
insert the row if it does not exist
update the row if it already exists
```

This matches Stripe webhooks well because the same subscription changes over
time: created, active, past_due, canceled, deleted, and so on.

### Usage Events Table

The usage table is early groundwork for future paid APIs such as OpenAI. The
goal is to prevent users from reading, editing, or faking their own limits.

```sql
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  units integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.usage_events enable row level security;

revoke all on public.usage_events from anon;
revoke all on public.usage_events from authenticated;

grant select, insert, update, delete on public.usage_events to service_role;
```

Current helper:

- `recordUsageEvent`: writes a server-owned usage row.
- `getMonthlyUsage`: sums usage for one user/event type since the start of the
  current UTC month.

For the template stage, `getMonthlyUsage` fetches matching rows and sums them in
Node. That is simple and easy to understand. Eventually, for scale, move this
aggregation into SQL or a Supabase RPC function so the database does the sum.

Future examples of `event_type`:

- `openai_chat_completion`
- `image_generation`
- `transcription`

Future examples of `units`:

- one request
- token count
- credit count
- generated image count

## API Usage Limits And Rate Limits

Usage limits and rate limits are related but different.

Usage limits answer:

```txt
How much paid/external API usage is this user allowed this month?
```

Rate limits answer:

```txt
How quickly can this user or IP hit the backend?
```

For future OpenAI or other paid API features, use this flow:

```txt
Frontend requests an AI action
-> backend verifies Supabase access token
-> backend checks usage allowance
-> backend calls OpenAI with backend-only API key
-> backend records usage
-> backend returns result
```

Do not call paid APIs directly from the frontend. Do not put paid API keys in
`frontend/.env`.

Planned next backend helper:

```js
canUseMonthlyAllowance({
  userId,
  eventType,
  monthlyLimit,
  requestedUnits,
});
```

That helper should check current monthly usage and return whether the requested
usage is allowed before the backend calls an external paid API.

For rate limits, add backend middleware later. A practical future setup:

- per-user limits for authenticated API routes
- per-IP limits for unauthenticated routes
- hard caps to prevent surprise bills
- conservative defaults for expensive routes

## Frontend API Helper

`frontend/src/lib/api.ts` centralizes authenticated backend calls:

- `apiGet(path, accessToken)`
- `apiPost(path, accessToken)`

It uses `VITE_API_URL` internally and attaches:

```txt
Authorization: Bearer <supabase_access_token>
```

This keeps backend URL and auth-header setup out of page components. It is
intentionally basic for now, not a full request framework.

## Mixpanel

Mixpanel is used from the frontend for basic analytics.

The Mixpanel project token is browser-safe. Do not send passwords, raw secrets,
or sensitive billing details to analytics events.

The app identifies users with the Supabase user id and resets analytics on sign
out so another user on the same browser does not inherit the previous identity.

## RevenueCat

RevenueCat was explored and removed from this template.

Reason: the app moved to Stripe-hosted Checkout for the web billing experience.
RevenueCat may be reconsidered later for mobile entitlement syncing, but it is
not part of the current codebase.

## Manual Test Checklist

Auth:

- sign up
- sign in
- refresh main page
- sign out
- signed-out main page redirects to sign-in

Billing:

- Free user sees Upgrade
- billing status loads from `GET /api/billing/status`
- Upgrade opens Stripe Checkout
- successful test payment returns to the app
- Stripe CLI forwards webhook with `200`
- Supabase `subscriptions` row is created/updated
- app shows `Plan: Pro` after webhook completes and page reloads
- cancelled checkout returns with cancelled message and remains Free

Security:

- no `.env` files are tracked
- no real secrets are committed
- RevenueCat references are absent
- subscription and usage tables are not directly readable/writable by users

## Future Improvements

Short-term:

- add `canUseMonthlyAllowance`
- add a safe backend route that demonstrates checking/recording usage
- add rate-limit middleware before paid API routes
- improve checkout success UX by refreshing billing status after return
- remove `?checkout=success` or `?checkout=cancelled` from the URL after showing
  the message

Medium-term:

- add Stripe customer portal
- store/display renewal dates and cancel-at-period-end status
- handle failed payment UX
- move usage aggregation into SQL/RPC for scale
- add backend route tests and webhook tests

Later:

- migrate backend to TypeScript after auth/billing/API-limit shapes are stable
- deploy backend and configure production Stripe webhook endpoint
- keep Stripe test/live env vars clearly separated
- add production monitoring/logging for webhook failures and expensive API usage

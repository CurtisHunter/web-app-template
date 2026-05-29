# Web App Template

Full-stack app template with React, Express, Supabase Auth, Stripe Checkout,
Stripe webhooks, and server-owned subscription status.

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

`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and
`STRIPE_WEBHOOK_SECRET` must stay backend-only.

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

## Billing Flow

Authenticated users start Stripe Checkout from the main page.

Stripe webhooks update the server-owned `subscriptions` table in Supabase.

The frontend asks the backend for billing status and receives only whether the
user has Pro access:

```json
{
  "hasPro": true
}
```

Subscription records and sensitive billing details should not be exposed
directly to the frontend.

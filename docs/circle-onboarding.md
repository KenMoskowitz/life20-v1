# Post-purchase Circle onboarding

Paid Life 2.0 checkout → website verifies the payment → purchaser is invited to Circle → they finish Circle signup → Circle sends its welcome/onboarding emails.

The website never emails purchasers itself. Circle sends the invitation, and Circle sends the welcome/onboarding emails.

## How it works

| Piece | File |
|---|---|
| Stripe webhook (signature check on the raw body, existing installment cap) | `web/src/pages/api/stripe-webhook.ts` |
| Onboarding logic (qualify, dedupe, invite, retry, signup sync) | `web/src/lib/onboarding.ts` |
| Circle Admin API v2 client | `web/src/lib/circle.ts` |
| Durable tracking in Sanity (`circleOnboarding` documents) | `web/src/lib/onboardingStore.ts`, `studio/schemas/circleOnboarding.ts` |
| Daily retry + signup check (Vercel Cron) | `web/src/pages/api/circle-onboarding-sync.ts`, `web/vercel.json` |
| Circle default-access check | `web/scripts/check-circle-access.mjs` |
| Tests | `web/tests/onboarding.test.ts` (`npm test` in `web/`) |

- **Qualifying purchase:** any Checkout Session containing `STRIPE_PRICE_FULL_ID` or `STRIPE_PRICE_INSTALLMENT_ID`. Anything else is ignored.
- **Payment check:** the session is re-read from Stripe. `paid` or `no_payment_required` invites. `unpaid` (bank debit still processing) waits for `checkout.session.async_payment_succeeded`. `async_payment_failed` never invites.
- **Duplicates:** one record per purchaser email. Replayed webhooks, a second purchase and installment renewals all find the person already onboarded. Before inviting, Circle is searched by email, so existing members and people with a pending invite don't get a second invitation.
- **Stages:** `invited` means Circle accepted the invite and sent its email. `signup_completed` means the person finished Circle signup (Circle's `profile_confirmed_at`). The daily sync moves people from one to the other and stops checking after 45 days.
- **Failures:** Circle errors never affect the payment. Temporary errors (outage, rate limit, daily cap) are marked `failed`. The webhook returns 500 so Stripe redelivers, and the daily sync also retries. Permanent errors (invalid email, wrong plan/token) are marked `needs_attention` in the Studio.

Status for every purchaser is visible in Sanity Studio → **Circle Onboarding**.

## Setup

### Circle

1. Circle **Business plan or above** is required (Admin API v2).
2. Circle → Developers → Tokens → create an **Admin V2** token.
3. Make sure new members get the whole community. Run `node --env-file=.env scripts/check-circle-access.mjs` from `web/` with the token in `web/.env`. It lists any private space a new member would not be added to.
4. Customize the invitation email and set up welcome/onboarding emails inside Circle (see below).

### Vercel environment variables (Production)

| Name | Value |
|---|---|
| `CIRCLE_API_TOKEN` | Circle Admin V2 token |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook endpoint (`whsec_…`) |
| `CRON_SECRET` | Any long random string. Vercel sends it to the daily sync. |
| `SANITY_TOKEN` | Sanity token with write access (already used by the site's forms) |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_FULL_ID`, `STRIPE_PRICE_INSTALLMENT_ID` | Already required by checkout |

### Stripe webhook

Endpoint URL: `https://thelife20.com/api/stripe-webhook`

Events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.created` (existing installment cap)

### Retry now (optional)

The sync runs daily at 15:00 UTC. To run it right away:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://thelife20.com/api/circle-onboarding-sync
```

## Circle welcome and onboarding emails

These are set up in Circle, not in this site:

- **Invitation email:** Circle's onboarding settings let you customize the invite with variables like `{first_name}` and `{community_name}`.
- **Welcome/onboarding emails:** create a Circle Workflow triggered when a member joins the community, with a welcome email and optional follow-ups. Because it triggers on joining, it goes out after signup is completed, not when the invite is sent.

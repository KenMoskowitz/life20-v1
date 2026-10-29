// Tells the Life 2.0 client dashboard (portal.thelife20.com) about a paid
// Access Your Next Level checkout. The dashboard adds the buyer as a client
// and, while its Circle invites are switched on, invites them to Circle
// itself. Server-only.
//
// No relative imports on purpose, so the onboarding tests can load this
// file directly with Node.

export type DashboardCircle = 'invited' | 'already_member' | 'off' | 'failed';

export type DashboardClient = {
  // Throws when the dashboard can't be reached or refuses the request.
  reportPurchase(input: {
    email: string;
    name: string | null;
    plan: 'full' | 'installment';
    checkoutSessionId: string;
  }): Promise<DashboardCircle>;
};

export function createDashboardClient(opts: { url: string; secret: string; fetchImpl?: typeof fetch }): DashboardClient {
  const endpoint = `${opts.url.replace(/\/$/, '')}/api/inbound/purchase`;
  const doFetch = opts.fetchImpl ?? fetch;
  return {
    async reportPurchase(input) {
      const res = await doFetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${opts.secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`Dashboard purchase report failed (${res.status})`);
      const body = (await res.json()) as { circle?: string };
      const circle = body.circle;
      return circle === 'invited' || circle === 'already_member' || circle === 'failed' ? circle : 'off';
    },
  };
}

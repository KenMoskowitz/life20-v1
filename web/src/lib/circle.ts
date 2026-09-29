// Minimal Circle Admin API v2 client for post-purchase onboarding.
// Admin API v2 needs Circle's Business plan (or above) and an "Admin V2"
// token from Circle → Developers → Tokens. Server-only: never import this
// into anything that ships to the browser.
//
// No relative imports on purpose, so the onboarding tests can load this
// file directly with Node.

export type CircleMember = {
  id: number;
  email: string;
  name?: string | null;
  // Set once the person finishes Circle signup. Circle's own definition:
  // "active" members have profile_confirmed_at; invited members who haven't
  // completed profile setup don't.
  profile_confirmed_at?: string | null;
  active?: boolean;
};

// Thrown for any non-success Circle response. `retryable` tells the caller
// whether trying again later could help (outage, rate limit, daily cap)
// versus a request Circle will keep rejecting (bad email, bad token).
export class CircleApiError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = 'CircleApiError';
    this.status = status;
    this.retryable = retryable;
  }
}

export type CircleClient = {
  findMemberByEmail(email: string): Promise<CircleMember | null>;
  inviteMember(input: { email: string; name?: string | null }): Promise<CircleMember>;
};

export function isSignupComplete(member: CircleMember) {
  return Boolean(member.profile_confirmed_at);
}

type FetchLike = typeof fetch;

export function createCircleClient(opts: {
  token: string;
  baseUrl?: string;
  fetchImpl?: FetchLike;
}): CircleClient {
  const baseUrl = (opts.baseUrl ?? 'https://app.circle.so/api/admin/v2').replace(/\/$/, '');
  const doFetch = opts.fetchImpl ?? fetch;

  async function request(path: string, init: RequestInit = {}) {
    let res: Response;
    try {
      res = await doFetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${opts.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      throw new CircleApiError(`Circle request failed: ${(err as Error).message}`, 0, true);
    }
    return res;
  }

  // Circle's error bodies carry a human message in `message` or `errors`.
  // Only that message is kept, never headers, so the token can't leak into
  // logs or the onboarding record.
  async function toError(res: Response, action: string) {
    let detail = '';
    try {
      const body = await res.json();
      detail = String(body?.message ?? body?.errors ?? '').slice(0, 300);
    } catch {
      // Non-JSON body; the status code is enough.
    }
    const retryable =
      res.status === 429 ||
      res.status >= 500 ||
      // Business plan caps how many members the API can add per day.
      (res.status === 403 && /daily member limit/i.test(detail));
    return new CircleApiError(`Circle ${action} failed (${res.status})${detail ? `: ${detail}` : ''}`, res.status, retryable);
  }

  return {
    // Returns invited-but-unconfirmed members too, which is what lets us
    // spot a pending invitation and not send a second one.
    async findMemberByEmail(email) {
      const res = await request(`/community_members/search?email=${encodeURIComponent(email)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw await toError(res, 'member search');
      const body = await res.json();
      return (body?.community_member ?? body) as CircleMember;
    },

    // skip_invitation: false makes Circle send its own invitation email.
    // No space_ids: the member lands in the community's default spaces,
    // which is how everyone gets the same access.
    async inviteMember({ email, name }) {
      const res = await request('/community_members', {
        method: 'POST',
        body: JSON.stringify({ email, ...(name ? { name } : {}), skip_invitation: false }),
      });
      if (!res.ok) throw await toError(res, 'invite');
      const body = await res.json();
      return (body?.community_member ?? body) as CircleMember;
    },
  };
}

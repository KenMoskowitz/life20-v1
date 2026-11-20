// Adds people to Laura's email list in Kit (kit.com), tagged by where they
// signed up (webinar, wheel, confidence, newsletter...). Uses Kit's v4 API
// with the KIT_API_KEY Vercel environment variable (server-only).
//
// Never throws: a sign-up must still succeed if Kit is down or the key is
// missing. Failures are logged so they show up in Vercel's logs.

const API = 'https://api.kit.com/v4';
const apiKey = import.meta.env.KIT_API_KEY as string | undefined;

export const kitConfigured = Boolean(apiKey);

async function kit(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'X-Kit-Api-Key': apiKey!, 'Content-Type': 'application/json', Accept: 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Kit ${init.method ?? 'GET'} ${path} failed: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// Tag name -> id, cached for the life of the server instance.
const tagIds = new Map<string, number>();

async function tagId(name: string): Promise<number> {
  const cached = tagIds.get(name);
  if (cached) return cached;
  // Look for an existing tag first, page by page.
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const q = new URLSearchParams({ per_page: '500' });
    if (after) q.set('after', after);
    const data = (await kit(`/tags?${q}`)) as { tags: Array<{ id: number; name: string }>; pagination?: { has_next_page?: boolean; end_cursor?: string } };
    for (const t of data.tags ?? []) tagIds.set(t.name, t.id);
    if (tagIds.has(name)) return tagIds.get(name)!;
    if (!data.pagination?.has_next_page || !data.pagination.end_cursor) break;
    after = data.pagination.end_cursor;
  }
  const created = (await kit('/tags', { method: 'POST', body: JSON.stringify({ name }) })) as { tag: { id: number } };
  tagIds.set(name, created.tag.id);
  return created.tag.id;
}

/** The last Kit error, without any secrets, so alerts can explain a failure. */
export let lastKitError = '';

/** Add (or update) a subscriber and apply tags. Returns true if it worked. */
export async function addToKit(email: string, firstName: string | undefined, tags: string[]): Promise<boolean> {
  lastKitError = '';
  if (!kitConfigured) {
    lastKitError = 'KIT_API_KEY is not set on this deployment.';
    console.warn('[kit] KIT_API_KEY not set; subscriber not added:', tags.join(', '));
    return false;
  }
  try {
    await kit('/subscribers', {
      method: 'POST',
      body: JSON.stringify({ email_address: email, ...(firstName ? { first_name: firstName.split(/\s+/)[0] } : {}) }),
    });
    for (const t of tags) {
      const id = await tagId(t);
      await kit(`/tags/${id}/subscribers`, { method: 'POST', body: JSON.stringify({ email_address: email }) });
    }
    return true;
  } catch (err) {
    lastKitError = String(err instanceof Error ? err.message : err).slice(0, 400);
    console.error('[kit] Could not add subscriber:', err);
    return false;
  }
}

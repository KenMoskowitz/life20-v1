// Registers people for a Zoom webinar from the site's own form, so sign-ups
// stay on thelife20.com (where the Meta Pixel can count them) while Zoom still
// sends the joining link and reminders.
//
// Needs a Zoom "Server-to-Server OAuth" app with the webinar:write:registrant
// scope, and these Vercel environment variables (server-only):
//   ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET
// Without them, zoomConfigured is false and callers fall back to Zoom's own
// registration page.

const accountId = import.meta.env.ZOOM_ACCOUNT_ID as string | undefined;
const clientId = import.meta.env.ZOOM_CLIENT_ID as string | undefined;
const clientSecret = import.meta.env.ZOOM_CLIENT_SECRET as string | undefined;

export const zoomConfigured = Boolean(accountId && clientId && clientSecret);

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId!)}`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}` },
    },
  );
  if (!res.ok) throw new Error(`Zoom token request failed: ${res.status} ${await res.text()}`);
  const { access_token } = (await res.json()) as { access_token: string };
  return access_token;
}

/** Returns the registrant's personal join link. Throws on any Zoom error. */
export async function registerForZoomWebinar(webinarId: string, name: string, email: string): Promise<string | null> {
  const token = await getAccessToken();
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const res = await fetch(`https://api.zoom.us/v2/webinars/${encodeURIComponent(webinarId)}/registrants`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, first_name: firstName, last_name: rest.join(' ') || undefined }),
  });
  if (!res.ok) throw new Error(`Zoom registration failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { join_url?: string };
  return data.join_url ?? null;
}

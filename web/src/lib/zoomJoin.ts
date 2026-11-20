// A registrant's personal Zoom joining link, passed from the sign-up handler
// to the thank-you page (and its calendar file) in a short-lived cookie, so
// the "add to calendar" buttons can include the link.

export const JOIN_COOKIE = 'l20_zoom_join';

/** Only accept real Zoom joining links, never anything else from the cookie. */
export function isZoomJoinUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && (u.hostname === 'zoom.us' || u.hostname.endsWith('.zoom.us'));
  } catch {
    return false;
  }
}

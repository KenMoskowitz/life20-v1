// Webinars whose details live in code rather than Sanity. Shared by the
// landing page and /api/webinar-registration so the date on the page and
// the date in the confirmation email can never drift apart.

export interface WebinarEvent {
  slug: string;
  title: string;
  /** ISO timestamps with an explicit offset, so they mean one instant everywhere. */
  startsAt: string;
  endsAt: string;
  /** IANA zone the event is announced in; used for the no-JS fallback and the email. */
  timeZone: string;
  /**
   * Zoom webinar ID (the digits in the Zoom webinar's link). When set and the
   * Zoom API credentials are configured, the site's own form registers people
   * with Zoom directly, so Zoom sends the joining link and its reminders.
   */
  zoomWebinarId?: string;
  /** Zoom's own registration page. Used as the fallback if the API isn't set up. */
  zoomRegistrationUrl?: string;
}

// Oct 29, 2026 is before US daylight saving ends (Nov 1), so Pacific is PDT, UTC-7.
export const betterMentalHealth: WebinarEvent = {
  slug: 'better-mental-health',
  title: 'A Practical Guide to Better Mental Health',
  startsAt: '2026-10-29T11:00:00-07:00',
  endsAt: '2026-10-29T12:15:00-07:00',
  timeZone: 'America/Los_Angeles',
};

// The monthly free training at /blueprint. Change the date
// and Zoom details here each month; the page, the confirmation email and the
// calendar invite all read from this one place.
// Nov 19, 2026 is after US daylight saving ends (Nov 1), so Pacific is PST, UTC-8.
export const findYourNextLevel: WebinarEvent = {
  slug: 'blueprint',
  title: 'How to Stop Feeling Stuck (Even Though You’re Already Successful)',
  startsAt: '2026-11-19T11:00:00-08:00',
  endsAt: '2026-11-19T12:15:00-08:00',
  timeZone: 'America/Los_Angeles',
  zoomWebinarId: '81086897900',
  zoomRegistrationUrl: 'https://us02web.zoom.us/webinar/register/WN_hc_DQ_aBRvqlA4uUG3_kng',
};

export const codeWebinars: Record<string, WebinarEvent> = {
  [betterMentalHealth.slug]: betterMentalHealth,
  [findYourNextLevel.slug]: findYourNextLevel,
};

export function durationMinutes(event: WebinarEvent) {
  return Math.round((new Date(event.endsAt).getTime() - new Date(event.startsAt).getTime()) / 60000);
}

/** "Thursday, October 29, 11:00 AM – 12:15 PM EDT" in the event's own zone. */
export function formatEventRange(event: WebinarEvent, opts: { year?: boolean } = {}) {
  const day = new Date(event.startsAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    ...(opts.year ? { year: 'numeric' } : {}),
    timeZone: event.timeZone,
  });
  const start = new Date(event.startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: event.timeZone,
  });
  const end = new Date(event.endsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: event.timeZone, timeZoneName: 'short',
  });
  return `${day}, ${start} – ${end}`;
}

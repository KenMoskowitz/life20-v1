import type { APIRoute } from 'astro';
import { findYourNextLevel as event } from '../../data/webinars';
import { JOIN_COOKIE, isZoomJoinUrl } from '../../lib/zoomJoin';

// Includes the person's own Zoom link (from the sign-up cookie) when present.
export const prerender = false;

// Escape text for an .ics field (RFC 5545).
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// Calendar file for the current /blueprint training. Works with Apple
// Calendar, Outlook and anything else that opens .ics files.

function icsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export const GET: APIRoute = ({ cookies }) => {
  const cookieJoin = cookies.get(JOIN_COOKIE)?.value;
  const joinUrl = isZoomJoinUrl(cookieJoin) ? cookieJoin : null;
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Life 2.0//Webinar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.slug}-${icsDate(event.startsAt)}@thelife20.com`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(event.startsAt)}`,
    `DTEND:${icsDate(event.endsAt)}`,
    `SUMMARY:${event.title} (free live training with Laura Kelly)`,
    `DESCRIPTION:${icsText(joinUrl ? `Live on Zoom. Join here: ${joinUrl}\n\nThis is your personal link, so please don't share it.` : 'Live on Zoom. Your personal joining link is in your confirmation email from Zoom.')}`,
    `LOCATION:${icsText(joinUrl ?? 'Zoom (link in your confirmation email)')}`,
    ...(joinUrl ? [`URL:${joinUrl}`] : []),
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Starting in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="life20-live-training.ics"',
      'Cache-Control': 'private, no-store',
    },
  });
};

import type { APIRoute } from 'astro';
import { findYourNextLevel as event } from '../../data/webinars';

// Calendar file for the current /blueprint training. Works with Apple
// Calendar, Outlook and anything else that opens .ics files.

function icsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export const GET: APIRoute = () => {
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
    `SUMMARY:${event.title}: free live training with Laura Kelly`,
    'DESCRIPTION:Live on Zoom. Your personal joining link is in your confirmation email.',
    'LOCATION:Zoom (link in your confirmation email)',
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
      'Content-Disposition': 'attachment; filename="find-your-next-level.ics"',
    },
  });
};

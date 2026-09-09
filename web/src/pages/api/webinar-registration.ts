import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { sanityWriteClient, getWebinar } from '../../lib/sanity';

export const prerender = false;

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const webinarTitle = String(form.get('webinarTitle') ?? '').trim() || 'The High Achievers Fulfillment Blueprint';

  if (!name || !isValidEmail(email)) {
    return redirect('/blueprint?error=missing-fields#register');
  }

  // Pull the event so the confirmation email can carry real details when they
  // exist, and stay deliberately vague when they don't.
  const webinar = (await getWebinar('blueprint')) as Record<string, any> | null;
  const startsAt: string | null = webinar?.startsAt ?? null;
  const isLive = webinar?.status === 'upcoming' || webinar?.status === 'replay';

  const whenLine =
    isLive && startsAt
      ? new Date(startsAt).toLocaleString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short',
        })
      : null;

  let confirmationSent = false;
  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const from = (import.meta.env.RESEND_FROM as string | undefined) ?? 'Life 2.0 <results@thelife20.com>';
      const { error } = await resend.emails.send({
        from,
        to: email,
        subject: whenLine ? `You're registered: ${webinarTitle}` : `You're on the list: ${webinarTitle}`,
        html: `
          <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; color:#2A322B;">
            <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#C79A56;">Life 2.0</p>
            <h1 style="font-size:24px; color:#1D2E22; margin:8px 0 18px;">${esc(webinarTitle)}</h1>
            <p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6;">Hi ${esc(name)}, you're registered.</p>
            ${whenLine
              ? `<div style="background:#1D2E22; color:#FBF7EF; border-radius:14px; padding:20px; margin:20px 0;">
                   <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#E4C688; margin:0 0 6px;">When</p>
                   <p style="margin:0; font-size:18px;">${esc(whenLine)}</p>
                 </div>
                 <p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6;">We'll send the joining link and a reminder before it starts.</p>`
              : `<p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6;">The date is being finalized. You'll hear from us as soon as it's set, and not before.</p>`}
            <p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6;">In the meantime, the free assessment is the best place to start.</p>
            <a href="https://thelife20.com/assessment" style="display:inline-block; background:#1D2E22; color:#FBF7EF; font-family:Arial,sans-serif; font-size:13px; padding:14px 24px; border-radius:30px; text-decoration:none; margin-top:8px;">Take the free assessment &rarr;</a>
            <p style="font-family:Arial,sans-serif; font-size:12px; color:#8A9A7C; margin-top:30px;">Life 2.0 &middot; thelife20.com</p>
          </div>`,
      });
      confirmationSent = !error;
      if (error) console.error('[webinar-registration] Resend error:', error);
    } catch (err) {
      console.error('[webinar-registration] Resend threw:', err);
    }
  } else {
    console.error('[webinar-registration] RESEND_API_KEY not configured; no confirmation sent.');
  }

  // Saving the registration matters more than the email. If Sanity is
  // unavailable we surface a real error rather than pretending it worked.
  if (!sanityWriteClient) {
    console.error('[webinar-registration] SANITY_TOKEN not configured; registration dropped.');
    return redirect('/blueprint?error=unavailable#register');
  }

  try {
    await sanityWriteClient.create({
      _type: 'webinarRegistration',
      name,
      email,
      webinarTitle,
      submittedAt: new Date().toISOString(),
      confirmationSent,
    });
  } catch (err) {
    console.error('[webinar-registration] Sanity write failed:', err);
    return redirect('/blueprint?error=unavailable#register');
  }

  return redirect('/blueprint?registered=1#register');
};

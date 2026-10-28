import { Resend } from 'resend';

// Emails Laura (and anyone else listed) the moment a lead comes in, so
// nothing sits unseen in Sanity. Set LEAD_ALERT_EMAILS in Vercel to a
// comma-separated list of addresses. Never throws: an alert failing must not
// break the visitor's sign-up.

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function notifyTeam(subject: string, rows: Array<[string, string | number | null | undefined]>) {
  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  const to = String(import.meta.env.LEAD_ALERT_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!apiKey || to.length === 0) {
    console.warn('[notify] RESEND_API_KEY or LEAD_ALERT_EMAILS not set; no lead alert sent:', subject);
    return;
  }

  const body = rows
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0; color:#8A9A7C; font-family:Arial,sans-serif; font-size:13px; vertical-align:top; white-space:nowrap;">${esc(k)}</td><td style="padding:8px 0; color:#1D2E22; font-family:Arial,sans-serif; font-size:15px;">${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('');

  try {
    const resend = new Resend(apiKey);
    const from = (import.meta.env.RESEND_FROM as string | undefined) ?? 'Life 2.0 <results@thelife20.com>';
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html: `<div style="max-width:560px; margin:0 auto;"><h2 style="font-family:Georgia,serif; color:#1D2E22;">${esc(subject)}</h2><table style="border-collapse:collapse;">${body}</table></div>`,
    });
    if (error) console.error('[notify] Resend error:', error);
  } catch (err) {
    console.error('[notify] Resend threw:', err);
  }
}

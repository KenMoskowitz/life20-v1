import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { sanityWriteClient } from '../../lib/sanity';
import { notifyTeam } from '../../lib/notify';

export const prerender = false;

// Emails someone a copy of their Wheel of Life (thelife20.com/wheel), saves
// them as a lead, and alerts Laura. The page sends the finished wheel as a PNG
// so the email carries exactly what they saw.

interface ScoreRow {
  area: string;
  score: number;
}

interface RequestBody {
  email: string;
  name?: string;
  scores: ScoreRow[];
  strongest?: string;
  opportunity?: string;
  working?: string;
  actions?: string[];
  image?: string;
}

const MAX_IMAGE_CHARS = 4_000_000;

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderEmailHtml(b: RequestBody, hasImage: boolean) {
  const rows = b.scores
    .map(
      (s) =>
        `<tr><td style="padding:8px 0; border-bottom:1px solid #e5ded0; color:#1D2E22;">${esc(s.area)}</td><td style="padding:8px 0; border-bottom:1px solid #e5ded0; text-align:right; color:#5B645C; font-family:monospace;">${s.score}/10</td></tr>`,
    )
    .join('');
  const p = (label: string, value?: string) =>
    value ? `<p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6; margin:0 0 10px;"><strong style="color:#1D2E22;">${label}</strong> ${esc(value).replace(/\n/g, '<br>')}</p>` : '';
  const acts = (b.actions ?? []).filter(Boolean);

  return `
  <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; color:#2A322B;">
    <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#C79A56;">Life 2.0 &middot; Wheel of Life</p>
    <h1 style="font-size:24px; color:#1D2E22; margin:8px 0 18px;">${b.name ? `${esc(b.name)}, here’s your wheel` : 'Here’s your Wheel of Life'}</h1>
    <p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6;">Thank you for taking the time to look at your life this honestly. ${hasImage ? 'Your full wheel is attached, ready to save or print.' : ''}</p>
    ${p('Strongest:', b.strongest)}
    ${p('Biggest opportunity:', b.opportunity)}
    <table style="width:100%; border-collapse:collapse; margin:18px 0 24px;">${rows}</table>
    ${p('What is already working:', b.working)}
    ${acts.length ? `<p style="font-family:Arial,sans-serif; font-size:15px; color:#1D2E22; margin:18px 0 6px;"><strong>Your next steps</strong></p><ol style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6; margin:0 0 24px; padding-left:20px;">${acts.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>` : ''}
    <p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6;">Small steps count. One point higher in one area can change how the whole week feels.</p>
    <a href="https://thelife20.com/clarity" style="display:inline-block; background:#1D2E22; color:#FBF7EF; font-family:Arial,sans-serif; font-size:13px; padding:14px 24px; border-radius:30px; text-decoration:none; margin-top:8px;">Talk it through with Laura &rarr;</a>
    <p style="font-family:Arial,sans-serif; font-size:12px; color:#8A9A7C; margin-top:30px;">Life 2.0 &middot; thelife20.com</p>
  </div>`;
}

export const POST: APIRoute = async ({ request }) => {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-json' }), { status: 400 });
  }

  const email = String(body?.email ?? '').trim();
  if (!isValidEmail(email) || !Array.isArray(body.scores) || body.scores.length === 0 || body.scores.length > 20) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid' }), { status: 400 });
  }
  const b: RequestBody = {
    email,
    name: String(body.name ?? '').trim().slice(0, 100),
    scores: body.scores.map((s) => ({
      area: String(s?.area ?? '').slice(0, 60),
      score: Math.max(1, Math.min(10, Math.round(Number(s?.score) || 0))),
    })),
    strongest: String(body.strongest ?? '').slice(0, 200),
    opportunity: String(body.opportunity ?? '').slice(0, 200),
    working: String(body.working ?? '').trim().slice(0, 3000),
    actions: (Array.isArray(body.actions) ? body.actions : []).slice(0, 2).map((a) => String(a).trim().slice(0, 500)),
  };

  // Only accept a PNG data URL of a sane size as the attachment.
  const image = typeof body.image === 'string' && body.image.length < MAX_IMAGE_CHARS && body.image.startsWith('data:image/png;base64,')
    ? body.image.slice('data:image/png;base64,'.length)
    : null;

  // Save the lead first, so Laura has it even if the email fails.
  if (sanityWriteClient) {
    try {
      await sanityWriteClient.create({
        _type: 'wheelLead',
        email: b.email,
        name: b.name || undefined,
        scores: b.scores.map((s, i) => ({ _key: `a${i}`, area: s.area, score: s.score })),
        strongest: b.strongest || undefined,
        opportunity: b.opportunity || undefined,
        working: b.working || undefined,
        actions: b.actions?.length ? b.actions : undefined,
        submittedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[wheel] Sanity lead capture failed:', err);
    }
  } else {
    console.error('[wheel] SANITY_TOKEN not configured; lead not saved.');
  }

  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  let emailError: string | null = null;
  if (!apiKey) {
    console.error('[wheel] RESEND_API_KEY not configured; email not sent.');
    emailError = 'unavailable';
  } else {
    const resend = new Resend(apiKey);
    const from = (import.meta.env.RESEND_FROM as string | undefined) ?? 'Life 2.0 <results@thelife20.com>';
    const { error } = await resend.emails.send({
      from,
      to: b.email,
      subject: 'Your Wheel of Life',
      html: renderEmailHtml(b, Boolean(image)),
      attachments: image ? [{ filename: 'wheel-of-life.png', content: image }] : undefined,
    });
    if (error) {
      console.error('[wheel] Resend error:', error);
      emailError = 'send-failed';
    }
  }

  await notifyTeam(`New Wheel of Life: ${b.name || b.email}`, [
    ['Name', b.name],
    ['Email', b.email],
    ['Biggest opportunity', b.opportunity],
    ['Strongest', b.strongest],
    ['All scores', b.scores.map((s) => `${s.area}: ${s.score}`).join('\n')],
    ['What is working', b.working],
    ['Next steps', (b.actions ?? []).filter(Boolean).join('\n')],
    ['Wheel email', emailError ? 'FAILED to send, so send them their wheel personally' : 'Sent'],
  ]);

  if (emailError) {
    return new Response(JSON.stringify({ ok: false, error: emailError }), { status: emailError === 'unavailable' ? 503 : 502 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

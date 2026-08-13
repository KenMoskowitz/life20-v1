import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { sanityWriteClient } from '../../lib/sanity';

export const prerender = false;

interface ScoreRow {
  skill: string;
  score: number;
}

interface RequestBody {
  email: string;
  currentLevel: number;
  overflowCapacity: number;
  bandLevel: number;
  bandLabel: string;
  bandSubtitle: string;
  leverageSkill: string;
  leverageScore: number;
  supportSkill: string;
  supportScore: number;
  scores: ScoreRow[];
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderEmailHtml(body: RequestBody) {
  const ledgerRows = body.scores
    .map(
      (s) =>
        `<tr><td style="padding:8px 0; border-bottom:1px solid #e5ded0; color:#1D2E22;">${s.skill}</td><td style="padding:8px 0; border-bottom:1px solid #e5ded0; text-align:right; color:#5B645C; font-family:monospace;">${s.score}/10</td></tr>`
    )
    .join('');

  return `
  <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; color:#2A322B;">
    <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#C79A56;">Life 2.0 &middot; The Overflow Assessment</p>
    <h1 style="font-size:24px; color:#1D2E22; margin:8px 0 24px;">Your Overflow Assessment results</h1>

    <table style="width:100%; margin-bottom:24px;">
      <tr>
        <td style="font-family:Arial,sans-serif; font-size:12px; color:#5B645C;">Current level<br/><strong style="font-size:22px; color:#1D2E22;">${body.currentLevel.toFixed(1)}/10</strong></td>
        <td style="font-family:Arial,sans-serif; font-size:12px; color:#5B645C;">Overflow capacity<br/><strong style="font-size:22px; color:#1D2E22;">${body.overflowCapacity.toFixed(1)}/10</strong></td>
      </tr>
    </table>

    <div style="background:#1D2E22; color:#FBF7EF; border-radius:16px; padding:24px; margin-bottom:24px;">
      <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#E4C688; margin:0 0 8px;">${String(body.bandLevel).padStart(2, '0')} / ${body.bandLabel.toUpperCase()}</p>
      <p style="margin:0; font-size:18px;">${body.bandSubtitle}</p>
    </div>

    <p style="font-family:Arial,sans-serif; font-size:14px; color:#5B645C;"><strong style="color:#1D2E22;">Primary leverage point:</strong> ${body.leverageSkill} (${body.leverageScore}/10)</p>
    <p style="font-family:Arial,sans-serif; font-size:14px; color:#5B645C; margin-bottom:24px;"><strong style="color:#1D2E22;">Source of support:</strong> ${body.supportSkill} (${body.supportScore}/10)</p>

    <table style="width:100%; border-collapse:collapse; margin-bottom:32px;">
      ${ledgerRows}
    </table>

    <a href="https://thelife20.com/private-advisory#apply" style="display:inline-block; background:#1D2E22; color:#FBF7EF; font-family:Arial,sans-serif; font-size:13px; padding:14px 24px; border-radius:30px; text-decoration:none;">Apply for a Clarity Call &rarr;</a>

    <p style="font-family:Arial,sans-serif; font-size:12px; color:#8A9A7C; margin-top:32px;">Life 2.0 &middot; The Overflow Assessment &middot; A starting point, not a diagnosis.</p>
  </div>`;
}

export const POST: APIRoute = async ({ request }) => {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-json' }), { status: 400 });
  }

  if (!body.email || !isValidEmail(body.email) || !Array.isArray(body.scores)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-email' }), { status: 400 });
  }

  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  if (!apiKey) {
    console.error('[assessment-email] RESEND_API_KEY not configured; email not sent.');
    return new Response(JSON.stringify({ ok: false, error: 'unavailable' }), { status: 503 });
  }

  const resend = new Resend(apiKey);
  const from = (import.meta.env.RESEND_FROM as string | undefined) ?? 'Life 2.0 <results@thelife20.com>';

  const { error } = await resend.emails.send({
    from,
    to: body.email,
    subject: 'Your Life 2.0 Overflow Assessment results',
    html: renderEmailHtml(body),
  });

  if (error) {
    console.error('[assessment-email] Resend error:', error);
    return new Response(JSON.stringify({ ok: false, error: 'send-failed' }), { status: 502 });
  }

  if (sanityWriteClient) {
    try {
      await sanityWriteClient.create({
        _type: 'assessmentLead',
        email: body.email,
        currentLevel: body.currentLevel,
        overflowCapacity: body.overflowCapacity,
        bandLabel: body.bandLabel,
        leverageSkill: body.leverageSkill,
        supportSkill: body.supportSkill,
        scores: body.scores.map((s) => ({ _key: s.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-'), skill: s.skill, score: s.score })),
        submittedAt: new Date().toISOString(),
      });
    } catch (err) {
      // Lead capture is best-effort; never fail the user-facing email send over it.
      console.error('[assessment-email] Sanity lead capture failed:', err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

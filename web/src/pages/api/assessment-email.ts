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
  exploreSkill: string;
  exploreScore: number;
  strengthSkill: string;
  strengthScore: number;
  experiment: string;
  reflectionQuestions: string[];
  scores: ScoreRow[];
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderEmailHtml(body: RequestBody) {
  const rows = body.scores
    .map(
      (s) =>
        `<tr><td style="padding:8px 0; border-bottom:1px solid #e5ded0; color:#1D2E22;">${esc(s.skill)}</td><td style="padding:8px 0; border-bottom:1px solid #e5ded0; text-align:right; color:#5B645C; font-family:monospace;">${s.score}/10</td></tr>`
    )
    .join('');

  const questions = (body.reflectionQuestions || [])
    .map((q) => `<li style="margin-bottom:8px;">${esc(q)}</li>`)
    .join('');

  return `
  <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; color:#2A322B;">
    <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#C79A56;">Life 2.0 &middot; The Fulfillment Assessment</p>
    <h1 style="font-size:24px; color:#1D2E22; margin:8px 0 20px;">Your 9 Skills snapshot</h1>

    <div style="background:#1D2E22; color:#FBF7EF; border-radius:16px; padding:24px; margin-bottom:24px;">
      <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#E4C688; margin:0 0 8px;">Your skill to explore first</p>
      <p style="margin:0 0 10px; font-size:22px;">${esc(body.exploreSkill)}</p>
      <p style="font-family:Arial,sans-serif; font-size:14px; color:rgba(251,247,239,0.78); margin:0;">Your results suggest ${esc(body.exploreSkill)} may deserve some attention right now. This is an invitation to investigate, not a verdict.</p>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">${rows}</table>

    <p style="font-family:Arial,sans-serif; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; color:#8A9A7C;">One small experiment</p>
    <p style="font-size:18px; font-style:italic; color:#1D2E22; margin-top:6px;">${esc(body.experiment)}</p>

    ${questions ? `<p style="font-family:Arial,sans-serif; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; color:#8A9A7C; margin-top:28px;">Three questions to sit with</p>
    <ul style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; padding-left:20px;">${questions}</ul>` : ''}

    <p style="font-family:Arial,sans-serif; font-size:14px; color:#5B645C; margin-top:28px;">Your most developed skill today is <strong style="color:#1D2E22;">${esc(body.strengthSkill)}</strong>. Worth protecting, since it is part of what lets the rest of your life work.</p>

    <a href="https://thelife20.com/private-advisory" style="display:inline-block; background:#1D2E22; color:#FBF7EF; font-family:Arial,sans-serif; font-size:13px; padding:14px 24px; border-radius:30px; text-decoration:none; margin-top:20px;">Book a Life 2.0 Clarity Call &rarr;</a>

    <p style="font-family:Arial,sans-serif; font-size:12px; color:#8A9A7C; margin-top:32px;">Life 2.0 &middot; The Fulfillment Assessment &middot; A starting point, not a diagnosis.</p>
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
    subject: 'Your Life 2.0 Fulfillment Assessment results',
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
        exploreSkill: body.exploreSkill,
        exploreScore: body.exploreScore,
        strengthSkill: body.strengthSkill,
        strengthScore: body.strengthScore,
        scores: body.scores.map((s) => ({
          _key: s.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          skill: s.skill,
          score: s.score,
        })),
        submittedAt: new Date().toISOString(),
      });
    } catch (err) {
      // Lead capture is best-effort; never fail the user-facing send over it.
      console.error('[assessment-email] Sanity lead capture failed:', err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

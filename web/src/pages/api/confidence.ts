import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { sanityWriteClient } from '../../lib/sanity';
import { notifyTeam } from '../../lib/notify';

export const prerender = false;

// Emails someone a copy of their Confidence Gap worksheet answers
// (thelife20.com/confidence), saves them as a lead, and alerts Laura.

interface Body {
  email: string;
  name?: string;
  lifeChange?: Array<{ prompt: string; answer: string }>;
  ratings?: Array<{ value: string; rating: string }>;
  topSix?: string[];
  domains?: Record<string, Record<string, string>>;
}

const DOMAIN_ORDER = ['love', 'work', 'play', 'health'];
const FIELD_ORDER = ['My Values', 'Short Term Goals', 'Medium Term Goals', 'Long Term Goals'];

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const br = (s: string) => esc(s).replace(/\n/g, '<br>');

function clean(raw: Body): Body {
  const domains: Record<string, Record<string, string>> = {};
  for (const d of DOMAIN_ORDER) {
    const src = (raw.domains && typeof raw.domains === 'object' ? raw.domains[d] : null) ?? {};
    domains[d] = {};
    for (const f of FIELD_ORDER) domains[d][f] = str((src as Record<string, unknown>)[f], 2000);
  }
  return {
    email: str(raw.email, 200),
    name: str(raw.name, 100),
    lifeChange: (Array.isArray(raw.lifeChange) ? raw.lifeChange : []).slice(0, 12).map((x) => ({ prompt: str(x?.prompt, 300), answer: str(x?.answer, 3000) })),
    ratings: (Array.isArray(raw.ratings) ? raw.ratings : []).slice(0, 70).map((x) => ({ value: str(x?.value, 60), rating: ['V', 'Q', 'N'].includes(String(x?.rating)) ? String(x.rating) : '' })),
    topSix: (Array.isArray(raw.topSix) ? raw.topSix : []).slice(0, 6).map((v) => str(v, 60)),
    domains,
  };
}

function renderEmail(b: Body) {
  const h2 = (t: string) => `<h2 style="font-size:20px; color:#1D2E22; margin:28px 0 10px;">${t}</h2>`;
  const para = (t: string) => `<p style="font-family:Arial,sans-serif; font-size:15px; color:#5B645C; line-height:1.6; margin:0 0 12px;">${t}</p>`;
  const lc = (b.lifeChange ?? []).filter((x) => x.answer)
    .map((x) => `<p style="font-family:Arial,sans-serif; font-size:14px; color:#1D2E22; margin:14px 0 4px;"><strong>${esc(x.prompt)}</strong></p>${para(br(x.answer))}`).join('');
  const very = (b.ratings ?? []).filter((r) => r.rating === 'V').map((r) => esc(r.value));
  const domains = DOMAIN_ORDER.map((d) => {
    const rows = FIELD_ORDER.filter((f) => b.domains?.[d]?.[f])
      .map((f) => `<p style="font-family:Arial,sans-serif; font-size:14px; color:#5B645C; line-height:1.6; margin:0 0 8px;"><strong style="color:#1D2E22;">${f}:</strong> ${br(b.domains![d][f])}</p>`).join('');
    return rows ? `<div style="border:1px solid #e5ded0; border-radius:12px; padding:14px 16px; margin:0 0 12px;"><p style="font-family:Arial,sans-serif; font-size:12px; letter-spacing:0.08em; color:#C79A56; margin:0 0 8px;"><strong>${d.toUpperCase()}</strong></p>${rows}</div>` : '';
  }).join('');

  return `
  <div style="font-family:Georgia,serif; max-width:580px; margin:0 auto; color:#2A322B;">
    <p style="font-family:Arial,sans-serif; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#C79A56;">Life 2.0 &middot; The Confidence Gap worksheets</p>
    <h1 style="font-size:24px; color:#1D2E22; margin:8px 0 18px;">${b.name ? `${esc(b.name)}, here are your answers` : 'Here are your answers'}</h1>
    ${para('Thank you for giving yourself the time to do this. Keep these somewhere you’ll see them. What you wrote here is what you want to stand for.')}
    ${b.topSix?.length ? `${h2('Your top six values')}${para(`<strong style="color:#1D2E22;">${b.topSix.map(esc).join(' &middot; ')}</strong>`)}` : ''}
    ${lc ? h2('The Life Change List') + para('<em>As I develop genuine confidence . . .</em>') + lc : ''}
    ${domains ? h2('Love, work, play and health') + domains : ''}
    ${very.length ? h2('Values you marked Very important') + para(very.join(', ')) : ''}
    <a href="https://thelife20.com/clarity" style="display:inline-block; background:#1D2E22; color:#FBF7EF; font-family:Arial,sans-serif; font-size:13px; padding:14px 24px; border-radius:30px; text-decoration:none; margin-top:12px;">Talk it through with Laura &rarr;</a>
    <p style="font-family:Arial,sans-serif; font-size:12px; color:#8A9A7C; margin-top:30px;">Worksheets from <em>The Confidence Gap</em> by Russ Harris. Copyright Russ Harris, 2010. thehappinesstrap.com &middot; actmindfully.com.au<br>Life 2.0 &middot; thelife20.com</p>
  </div>`;
}

export const POST: APIRoute = async ({ request }) => {
  let raw: Body;
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-json' }), { status: 400 });
  }
  const b = clean(raw ?? ({} as Body));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-email' }), { status: 400 });
  }

  if (sanityWriteClient) {
    try {
      await sanityWriteClient.create({
        _type: 'confidenceLead',
        email: b.email,
        name: b.name || undefined,
        topSix: b.topSix?.length ? b.topSix : undefined,
        veryImportant: (b.ratings ?? []).filter((r) => r.rating === 'V').map((r) => r.value),
        lifeChange: (b.lifeChange ?? []).filter((x) => x.answer).map((x, i) => ({ _key: `lc${i}`, prompt: x.prompt, answer: x.answer })),
        domains: DOMAIN_ORDER.map((d) => ({ _key: d, area: d, ...Object.fromEntries(FIELD_ORDER.map((f) => [f.replace(/ /g, '').replace(/^./, (c) => c.toLowerCase()), b.domains![d][f] || undefined])) })),
        submittedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[confidence] Sanity lead capture failed:', err);
    }
  } else {
    console.error('[confidence] SANITY_TOKEN not configured; lead not saved.');
  }

  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  let emailError: string | null = null;
  if (!apiKey) {
    console.error('[confidence] RESEND_API_KEY not configured; email not sent.');
    emailError = 'unavailable';
  } else {
    const resend = new Resend(apiKey);
    const from = (import.meta.env.RESEND_FROM as string | undefined) ?? 'Life 2.0 <results@thelife20.com>';
    const { error } = await resend.emails.send({ from, to: b.email, subject: 'Your Confidence Gap answers', html: renderEmail(b) });
    if (error) {
      console.error('[confidence] Resend error:', error);
      emailError = 'send-failed';
    }
  }

  await notifyTeam(`New Confidence worksheets: ${b.name || b.email}`, [
    ['Name', b.name],
    ['Email', b.email],
    ['Top six values', (b.topSix ?? []).join(', ')],
    ['Goals (love)', b.domains?.love?.['Short Term Goals']],
    ['Goals (work)', b.domains?.work?.['Short Term Goals']],
    ['Goals (play)', b.domains?.play?.['Short Term Goals']],
    ['Goals (health)', b.domains?.health?.['Short Term Goals']],
    ['Answers email', emailError ? 'FAILED to send, so send them their answers personally' : 'Sent'],
  ]);

  if (emailError) {
    return new Response(JSON.stringify({ ok: false, error: emailError }), { status: emailError === 'unavailable' ? 503 : 502 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

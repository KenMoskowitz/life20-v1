import { skills, skillGroups } from '../data/skills';
import { assessmentIntro, assessmentQuestionCopy, resultsCopy } from '../data/assessmentCopy';
import { getSiteSettings } from '../lib/sanity';

const FALLBACK_CLARITY_CALL_URL = 'https://calendly.com/laura-thelaurakelly/clarity-call-with-laura';

type Screen = 'intro' | 'questions' | 'results';

const root = document.getElementById('assessment-app');
if (!root) throw new Error('assessment root not found');

// answers[skillIndex][questionIndex] = 1-10, null until touched.
let answers: (number | null)[][] = skills.map((s) => s.questions.map(() => null));
let screen: Screen = 'intro';
let currentSkill = 0;
let cupUid = 0;

function escapeHtml(s: string) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// Glass-and-water illustration for the brand's capacity metaphor.
// `percent` (0-100) sets the water level; `overflow` adds a spilling droplet.
function cupSvg(percent: number, opts: { overflow?: boolean; size?: number } = {}) {
  const { overflow = false, size = 120 } = opts;
  const id = `cup-${cupUid++}`;
  const clampPct = Math.max(0, Math.min(100, percent));
  const glassTop = 14;
  const glassBottom = 150;
  const waterY = glassBottom - ((glassBottom - glassTop) * clampPct) / 100;
  const glassPath = `M22 ${glassTop} L98 ${glassTop} L88 ${glassBottom} Q60 ${glassBottom + 10} 32 ${glassBottom} Z`;

  return `
    <svg viewBox="0 0 120 168" width="${size}" height="${size * 1.4}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Filled to ${Math.round(clampPct)} percent">
      <defs>
        <linearGradient id="${id}-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--gold-light)" />
          <stop offset="100%" stop-color="var(--gold)" />
        </linearGradient>
        <clipPath id="${id}-clip"><path d="${glassPath}" /></clipPath>
      </defs>
      <g clip-path="url(#${id}-clip)">
        <g class="dz-cup-water" style="--dz-fill:${(glassBottom - waterY).toFixed(1)}px">
          <rect x="10" y="${waterY}" width="100" height="${glassBottom - glassTop + 20}" fill="url(#${id}-water)" />
          <path d="M10 ${waterY} Q30 ${waterY - 4} 60 ${waterY} T110 ${waterY}" stroke="var(--gold-light)" stroke-width="2" fill="none" />
        </g>
      </g>
      <path d="${glassPath}" stroke="var(--forest)" stroke-width="3" stroke-linejoin="round" />
      ${overflow ? `
      <g class="dz-cup-spill">
        <path d="M30 ${glassTop} Q26 2 34 -6" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" fill="none" />
        <circle cx="35" cy="-10" r="3" fill="var(--gold)" />
        <path d="M88 ${glassTop} Q94 4 86 -4" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" fill="none" />
        <circle cx="85" cy="-8" r="2.5" fill="var(--gold)" />
      </g>` : ''}
    </svg>`;
}

function triggerCupFill() {
  if (!root) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root!.querySelectorAll('.assess-intro-cup, .snapshot-cup').forEach((el) => el.classList.add('dz-cup-filled'));
    });
  });
}

/** A skill's score is the mean of its four statements. */
function skillScore(i: number): number {
  const vals = answers[i].map((v) => v ?? 5);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function render() {
  if (screen === 'intro') renderIntro();
  else if (screen === 'questions') renderQuestions();
  else renderResults();
}

function renderIntro() {
  root!.innerHTML = `
    <div class="assess-shell">
      <div class="assess-card assess-intro">
        <div class="assess-intro-copy">
          <div class="eyebrow">${escapeHtml(assessmentIntro.eyebrow)}</div>
          <h2>${escapeHtml(assessmentIntro.kicker)}</h2>
          <p class="reflection" style="font-style:normal;">${escapeHtml(assessmentIntro.supportingLine)}</p>
          ${assessmentIntro.body.map((p) => `<p class="research">${escapeHtml(p)}</p>`).join('')}
          <div style="margin-top:32px;">
            <button class="btn-primary" id="assess-begin" type="button">${escapeHtml(assessmentIntro.ctaLabel)} &rarr;</button>
          </div>
          <p class="assess-hint" style="text-align:left;">${escapeHtml(assessmentIntro.privacyNote)}</p>
        </div>
        <div class="assess-intro-cup">${cupSvg(78, { overflow: true, size: 130 })}</div>
      </div>
      <p class="assess-hint" style="margin-top:24px;">${escapeHtml(assessmentIntro.disclaimer)}</p>
    </div>`;

  triggerCupFill();
  document.getElementById('assess-begin')!.addEventListener('click', () => {
    screen = 'questions';
    currentSkill = 0;
    render();
  });
}

function renderQuestions() {
  const skill = skills[currentSkill];
  const total = skills.length;
  const isLast = currentSkill === total - 1;
  const progressPct = Math.round((currentSkill / total) * 100);
  const group = skillGroups.find((g) => g.id === skill.group)!;

  root!.innerHTML = `
    <div class="assess-shell">
      <div class="assess-progress">
        <span>${escapeHtml(assessmentQuestionCopy.progressLabel(currentSkill + 1, total))}</span>
        <div class="assess-progress-bar"><div style="width:${progressPct}%"></div></div>
      </div>
      <div class="assess-card">
        <div class="eyebrow">${escapeHtml(group.title)}</div>
        <h2>${escapeHtml(skill.name)}</h2>
        <p class="research">${escapeHtml(skill.definition)}</p>
        <p class="reflection">${escapeHtml(skill.coreQuestion)}</p>
        <p class="assess-hint" style="text-align:left; margin-top:24px;">${escapeHtml(assessmentQuestionCopy.instruction)}</p>

        <div class="statement-list">
          ${skill.questions
            .map((q, qi) => {
              const val = answers[currentSkill][qi] ?? 5;
              return `
              <div class="statement">
                <p class="statement-text">${escapeHtml(q)}</p>
                <div class="statement-scale">
                  <span class="scale-end">${escapeHtml(assessmentQuestionCopy.scaleLow)}</span>
                  <input
                    type="range" min="1" max="10" step="1" value="${val}"
                    class="assess-slider" data-q="${qi}"
                    style="--fill:${((val - 1) / 9) * 100}%"
                    aria-label="${escapeHtml(q)}" />
                  <span class="scale-end">${escapeHtml(assessmentQuestionCopy.scaleHigh)}</span>
                  <output class="statement-value" data-out="${qi}">${val}</output>
                </div>
              </div>`;
            })
            .join('')}
        </div>

        <p class="assess-hint">${escapeHtml(assessmentQuestionCopy.encouragement)}</p>
        <div class="assess-nav">
          <button type="button" class="btn-text" id="assess-back" ${currentSkill === 0 ? 'style="visibility:hidden;"' : ''}>&larr; ${escapeHtml(assessmentQuestionCopy.back)}</button>
          <button type="button" class="btn-primary" id="assess-next">
            ${isLast ? escapeHtml(assessmentQuestionCopy.finish) : escapeHtml(assessmentQuestionCopy.continue)}
          </button>
        </div>
      </div>
    </div>`;

  root!.querySelectorAll<HTMLInputElement>('.assess-slider').forEach((slider) => {
    slider.addEventListener('input', () => {
      const qi = Number(slider.dataset.q);
      const v = Number(slider.value);
      answers[currentSkill][qi] = v;
      slider.style.setProperty('--fill', `${((v - 1) / 9) * 100}%`);
      const out = root!.querySelector(`[data-out="${qi}"]`);
      if (out) out.textContent = String(v);
    });
  });

  document.getElementById('assess-next')!.addEventListener('click', () => {
    // Untouched sliders keep their visible default of 5 rather than blocking progress.
    answers[currentSkill] = answers[currentSkill].map((v, qi) => {
      if (v !== null) return v;
      const el = root!.querySelector<HTMLInputElement>(`.assess-slider[data-q="${qi}"]`);
      return el ? Number(el.value) : 5;
    });
    if (isLast) {
      screen = 'results';
    } else {
      currentSkill += 1;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    render();
  });

  const back = document.getElementById('assess-back');
  if (back && currentSkill > 0) {
    back.addEventListener('click', () => {
      currentSkill -= 1;
      window.scrollTo({ top: 0, behavior: 'auto' });
      render();
    });
  }
}

async function renderResults() {
  const settings = (await getSiteSettings()) as Record<string, any> | null;
  const clarityCallUrl = settings?.clarityCallUrl ?? FALLBACK_CLARITY_CALL_URL;

  const scores = skills.map((_, i) => skillScore(i));
  const lowest = Math.min(...scores);
  const highest = Math.max(...scores);
  const exploreIdx = scores.indexOf(lowest);
  const strengthIdx = scores.indexOf(highest);
  const explore = skills[exploreIdx];
  const strength = skills[strengthIdx];

  // The brief warns against presenting a small gap as a meaningful finding,
  // so anything within half a point of the lowest is surfaced as equally valid.
  const nearTies = skills
    .map((s, i) => ({ s, score: scores[i] }))
    .filter((x, i) => i !== exploreIdx && x.score - lowest <= 0.5)
    .map((x) => x.s.name);

  const snapshot = skills
    .map((s, i) => `
      <div class="snapshot-item">
        <div class="snapshot-cup">${cupSvg((scores[i] / 10) * 100, { size: 54 })}</div>
        <div class="snapshot-meta">
          <span class="snapshot-name">${escapeHtml(s.name)}</span>
          <span class="snapshot-score">${scores[i].toFixed(1)}<small>/10</small></span>
        </div>
      </div>`)
    .join('');

  root!.innerHTML = `
    <div class="assess-shell">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:24px; flex-wrap:wrap;">
        <div class="eyebrow" style="margin-bottom:0;">${escapeHtml(resultsCopy.eyebrow)}</div>
        <button type="button" class="btn-text" id="assess-restart">${escapeHtml(resultsCopy.startOver)}</button>
      </div>

      <div class="assess-card">
        <h2>${escapeHtml(resultsCopy.snapshotHeading)}</h2>
        <p class="research">${escapeHtml(resultsCopy.snapshotIntro)}</p>
        <div class="snapshot-grid">${snapshot}</div>
      </div>

      <div class="capacity-band">
        <div class="eyebrow">${escapeHtml(resultsCopy.exploreHeading)}</div>
        <h2>${escapeHtml(explore.name)}</h2>
        <p class="body-copy">${escapeHtml(resultsCopy.exploreBody(explore.name))}</p>
        <p class="body-copy">${escapeHtml(resultsCopy.exploreCaveat)}</p>
        ${nearTies.length ? `<p class="body-copy" style="color:var(--gold-light);">${escapeHtml(resultsCopy.nearTieNote([explore.name, ...nearTies]))}</p>` : ''}
      </div>

      <div class="assess-card" style="margin-top:24px;">
        <div class="eyebrow">${escapeHtml(resultsCopy.meansHeading)}</div>
        <p class="research" style="margin-top:0;">${escapeHtml(explore.definition)}</p>
        <p class="reflection">${escapeHtml(explore.coreQuestion)}</p>
      </div>

      <div class="result-pair">
        <div class="assess-card">
          <div class="eyebrow">${escapeHtml(resultsCopy.lowerHeading)}</div>
          <p class="research" style="margin-top:0;">${escapeHtml(explore.lowerFeelsLike)}</p>
        </div>
        <div class="assess-card">
          <div class="eyebrow">${escapeHtml(resultsCopy.strongerHeading)}</div>
          <p class="research" style="margin-top:0;">${escapeHtml(explore.strongerCreates)}</p>
        </div>
      </div>

      <div class="assess-card" style="margin-top:24px;">
        <div class="eyebrow">${escapeHtml(resultsCopy.reflectionHeading)}</div>
        <div class="next-moves">
          ${explore.reflectionQuestions
            .map((q, i) => `<div class="next-move-item"><span class="num">${String(i + 1).padStart(2, '0')}</span><p style="color:var(--ink-soft);">${escapeHtml(q)}</p></div>`)
            .join('')}
        </div>
      </div>

      <div class="assess-card experiment-card" style="margin-top:24px;">
        <div class="eyebrow">${escapeHtml(resultsCopy.experimentHeading)}</div>
        <p class="reflection" style="margin-top:12px;">${escapeHtml(explore.experiment)}</p>
      </div>

      <div class="assess-card" style="margin-top:24px;">
        <div class="eyebrow">${escapeHtml(resultsCopy.strengthHeading)}</div>
        <h2 style="font-size:26px;">${escapeHtml(strength.name)}</h2>
        <p class="research">${escapeHtml(resultsCopy.strengthBody(strength.name))}</p>
      </div>

      <div class="assess-card" style="margin-top:40px; text-align:center;">
        <h2 style="font-size:26px;">${escapeHtml(resultsCopy.ctaHeading)}</h2>
        <p class="research">${escapeHtml(resultsCopy.ctaBody)}</p>
        <a class="btn-primary" href="${clarityCallUrl}" target="_blank" rel="noopener" style="margin-top:24px; display:inline-flex;">${escapeHtml(resultsCopy.ctaLabel)}</a>
      </div>

      <div class="assess-card" style="margin-top:24px;">
        <h2 style="font-size:24px;">${escapeHtml(resultsCopy.emailHeading)}</h2>
        <form class="email-copy-form" id="assess-email-form">
          <input type="email" id="assess-email-input" placeholder="you@email.com" required />
          <button type="submit" class="btn-primary">${escapeHtml(resultsCopy.emailCta)}</button>
        </form>
        <div id="assess-email-status"></div>
      </div>

      <p class="assess-hint" style="margin-top:40px;">${escapeHtml(resultsCopy.footer)}</p>
    </div>`;

  triggerCupFill();

  document.getElementById('assess-restart')!.addEventListener('click', () => {
    answers = skills.map((s) => s.questions.map(() => null));
    currentSkill = 0;
    screen = 'intro';
    window.scrollTo({ top: 0, behavior: 'auto' });
    render();
  });

  document.getElementById('assess-email-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('assess-email-input') as HTMLInputElement;
    const submitBtn = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    const status = document.getElementById('assess-email-status')!;
    const email = input.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.className = 'email-copy-status email-copy-status--error';
      status.textContent = resultsCopy.emailError;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.style.opacity = '.6';
    status.className = 'email-copy-status';
    status.textContent = resultsCopy.emailSending;

    try {
      const res = await fetch('/api/assessment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          exploreSkill: explore.name,
          exploreScore: Number(lowest.toFixed(1)),
          strengthSkill: strength.name,
          strengthScore: Number(highest.toFixed(1)),
          experiment: explore.experiment,
          reflectionQuestions: explore.reflectionQuestions,
          scores: skills.map((s, i) => ({ skill: s.name, score: Number(scores[i].toFixed(1)) })),
        }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (res.ok && data.ok) {
        status.textContent = resultsCopy.emailSent(email);
      } else {
        status.className = 'email-copy-status email-copy-status--error';
        status.textContent = resultsCopy.emailFailed;
      }
    } catch {
      status.className = 'email-copy-status email-copy-status--error';
      status.textContent = resultsCopy.emailFailed;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  });
}

render();

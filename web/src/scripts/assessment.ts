import { assessmentVariables } from '../data/assessmentVariables';
import { assessmentIntro, assessmentQuestionCopy, resultsCopy, bandForCapacity } from '../data/assessmentCopy';
import { getSiteSettings } from '../lib/sanity';

const FALLBACK_CLARITY_CALL_URL = 'https://calendly.com/laura-thelaurakelly/clarity-call-with-laura';

type Screen = 'intro' | 'question' | 'results';

const root = document.getElementById('assessment-app');
if (!root) throw new Error('assessment root not found');

let screen: Screen = 'intro';
let currentIndex = 0;
let scores: (number | null)[] = assessmentVariables.map(() => null);
let pendingScore = 5;
let cupUid = 0;

function escapeHtml(s: string) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// A simple glass-and-water illustration used for the brand's "cup must
// overflow" metaphor. `percent` (0-100) sets the water level; `overflow`
// draws a spilling droplet above the rim.
function cupSvg(percent: number, opts: { overflow?: boolean; size?: number } = {}) {
  const { overflow = false, size = 120 } = opts;
  const id = `cup-${cupUid++}`;
  const clampPct = Math.max(0, Math.min(100, percent));
  const glassTop = 14;
  const glassBottom = 150;
  const glassHeight = glassBottom - glassTop;
  const waterY = glassBottom - (glassHeight * clampPct) / 100;

  return `
    <svg viewBox="0 0 120 168" width="${size}" height="${size * 1.4}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cup filled to ${Math.round(clampPct)} percent">
      <defs>
        <linearGradient id="${id}-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--gold-light)" />
          <stop offset="100%" stop-color="var(--gold)" />
        </linearGradient>
        <clipPath id="${id}-clip">
          <path d="M22 ${glassTop} L98 ${glassTop} L88 ${glassBottom} Q60 ${glassBottom + 10} 32 ${glassBottom} Z" />
        </clipPath>
      </defs>
      <g clip-path="url(#${id}-clip)">
        <rect x="10" y="${waterY}" width="100" height="${glassBottom - glassTop + 20}" fill="url(#${id}-water)" />
        <path d="M10 ${waterY} Q30 ${waterY - 4} 60 ${waterY} T110 ${waterY}" stroke="var(--gold-light)" stroke-width="2" fill="none" />
      </g>
      <path d="M22 ${glassTop} L98 ${glassTop} L88 ${glassBottom} Q60 ${glassBottom + 10} 32 ${glassBottom} Z" stroke="var(--forest)" stroke-width="3" stroke-linejoin="round" />
      ${overflow ? `
        <path d="M30 ${glassTop} Q26 2 34 -6" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" fill="none" />
        <circle cx="35" cy="-10" r="3" fill="var(--gold)" />
        <path d="M88 ${glassTop} Q94 4 86 -4" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" fill="none" />
        <circle cx="85" cy="-8" r="2.5" fill="var(--gold)" />
      ` : ''}
    </svg>
  `;
}

function render() {
  if (screen === 'intro') renderIntro();
  else if (screen === 'question') renderQuestion();
  else renderResults();
}

function renderIntro() {
  root!.innerHTML = `
    <div class="assess-shell">
      <div class="assess-card assess-intro">
        <div class="assess-intro-copy">
          <div class="eyebrow">${escapeHtml(assessmentIntro.eyebrow)}</div>
          <h2>${escapeHtml(assessmentIntro.kicker)}</h2>
          <p class="reflection" style="font-style:normal;">
            ${escapeHtml(assessmentIntro.heading)}
            <em style="color:var(--gold);">${escapeHtml(assessmentIntro.headingEmphasis)}</em>
          </p>
          <p class="research">${escapeHtml(assessmentIntro.body1)}</p>
          <p class="research">${escapeHtml(assessmentIntro.body2)}</p>
          <div style="margin-top:32px;">
            <button class="btn-primary" id="assess-begin" type="button">${escapeHtml(assessmentIntro.ctaLabel)} &rarr;</button>
          </div>
          <p class="assess-hint" style="text-align:left;">${escapeHtml(assessmentIntro.privacyNote)}</p>
        </div>
        <div class="assess-intro-cup">${cupSvg(78, { overflow: true, size: 130 })}</div>
      </div>
      <p class="assess-hint" style="margin-top:24px;">${escapeHtml(assessmentIntro.disclaimer)}</p>
    </div>
  `;
  document.getElementById('assess-begin')!.addEventListener('click', () => {
    screen = 'question';
    currentIndex = 0;
    pendingScore = scores[0] ?? 5;
    render();
  });
}

function renderQuestion() {
  const v = assessmentVariables[currentIndex];
  const total = assessmentVariables.length;
  const answered = scores.filter((s) => s !== null).length;
  const isLast = currentIndex === total - 1;
  const progressPct = Math.round(((currentIndex) / total) * 100);

  root!.innerHTML = `
    <div class="assess-shell">
      <div class="assess-progress">
        <span>${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
        <div class="assess-progress-bar"><div style="width:${progressPct}%"></div></div>
        <span>${answered} answered</span>
      </div>
      <div class="assess-card">
        <div class="eyebrow">Skill ${String(currentIndex + 1).padStart(2, '0')}</div>
        <h2>${escapeHtml(v.name)}</h2>
        <p class="research">${escapeHtml(v.definition)}</p>
        ${currentIndex > 0 ? `<p class="assess-hint" style="text-align:left; margin-top:24px;">${escapeHtml(assessmentQuestionCopy.encouragement)}</p>` : ''}
        <div class="eyebrow" style="margin-top:28px;">${escapeHtml(assessmentQuestionCopy.eyebrow)}</div>
        <p class="reflection">${escapeHtml(v.reflectionQuestion)}</p>

        <div class="eyebrow" style="justify-content:center; margin-top:36px;">${escapeHtml(assessmentQuestionCopy.chooseLabel)}</div>
        <div class="assess-slider-value" id="assess-slider-value">${pendingScore}</div>
        <div class="assess-slider-wrap">
          <input type="range" min="1" max="10" step="1" value="${pendingScore}" id="assess-slider" class="assess-slider" style="--fill:${((pendingScore - 1) / 9) * 100}%" aria-label="Score for ${escapeHtml(v.name)}, 1 to 10" />
        </div>
        <div class="assess-anchors">
          <div class="low"><strong>1&ndash;4</strong><br />${escapeHtml(v.lowAnchor)}</div>
          <div class="high"><strong>8&ndash;10</strong><br />${escapeHtml(v.highAnchor)}</div>
        </div>
        <p class="assess-hint">${escapeHtml(assessmentQuestionCopy.hint1)}</p>
        <p class="assess-hint">${escapeHtml(assessmentQuestionCopy.hint2)}</p>
        <div class="assess-nav">
          <button type="button" class="btn-text" id="assess-back" ${currentIndex === 0 ? 'style="visibility:hidden;"' : ''}>&larr; ${escapeHtml(assessmentQuestionCopy.back)}</button>
          <button type="button" class="btn-primary" id="assess-next">
            ${isLast ? escapeHtml(assessmentQuestionCopy.finish) : escapeHtml(assessmentQuestionCopy.continue)}
          </button>
        </div>
      </div>
    </div>
  `;

  const slider = document.getElementById('assess-slider') as HTMLInputElement;
  const valueLabel = document.getElementById('assess-slider-value')!;
  slider.addEventListener('input', () => {
    pendingScore = Number(slider.value);
    valueLabel.textContent = String(pendingScore);
    slider.style.setProperty('--fill', `${((pendingScore - 1) / 9) * 100}%`);
  });

  document.getElementById('assess-next')!.addEventListener('click', () => {
    scores[currentIndex] = pendingScore;
    if (isLast) {
      screen = 'results';
    } else {
      currentIndex += 1;
      pendingScore = scores[currentIndex] ?? 5;
    }
    render();
  });
  const backBtn = document.getElementById('assess-back');
  if (backBtn && currentIndex > 0) {
    backBtn.addEventListener('click', () => {
      currentIndex -= 1;
      pendingScore = scores[currentIndex] ?? 5;
      render();
    });
  }
}

async function renderResults() {
  const settings = (await getSiteSettings()) as Record<string, any> | null;
  const clarityCallUrl = settings?.clarityCallUrl ?? FALLBACK_CLARITY_CALL_URL;

  const finalScores = scores as number[];
  const arithmeticMean = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
  const harmonicMean = finalScores.length / finalScores.reduce((a, b) => a + 1 / b, 0);
  const band = bandForCapacity(harmonicMean);

  const minScore = Math.min(...finalScores);
  const maxScore = Math.max(...finalScores);
  const leverageIdx = finalScores.findIndex((s) => s === minScore);
  const supportIdx = finalScores.findIndex((s) => s === maxScore);
  const leverage = assessmentVariables[leverageIdx];
  const support = assessmentVariables[supportIdx];

  const ledgerRows = assessmentVariables
    .map((v, i) => {
      const score = finalScores[i];
      const isMax = score === maxScore;
      const tag = resultsCopy.ledgerTag(score, isMax);
      const tagClass = isMax ? 'ledger-status--support' : score <= 6 ? 'ledger-status--leak' : '';
      return `
        <div class="ledger-row">
          <span>${String(v.order).padStart(2, '0')} &nbsp; ${escapeHtml(v.name)}</span>
          <span>
            <span class="ledger-status ${tagClass}">${escapeHtml(tag)}</span>
            <span class="score">${score}/10</span>
          </span>
        </div>`;
    })
    .join('');

  const nextMoves = resultsCopy.nextMoves(leverage.name);

  root!.innerHTML = `
    <div class="assess-shell">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <div class="eyebrow" style="margin-bottom:0;">${escapeHtml(resultsCopy.eyebrow)}</div>
        <button type="button" class="btn-text" id="assess-restart">${escapeHtml(resultsCopy.startOver)}</button>
      </div>

      <div class="assess-card">
        <h2>${escapeHtml(resultsCopy.capacityHeading)}</h2>
        <p class="research">${escapeHtml(resultsCopy.capacitySubheading)}</p>
        <div class="cup-gauge-row">
          <div class="cup-gauge">
            ${cupSvg((arithmeticMean / 10) * 100, { size: 90 })}
            <div class="cup-gauge-label">${escapeHtml(resultsCopy.currentLevelLabel)}</div>
            <div class="cup-gauge-value">${arithmeticMean.toFixed(1)}/10</div>
          </div>
          <div class="cup-gauge">
            ${cupSvg((harmonicMean / 10) * 100, { size: 90, overflow: harmonicMean >= 9 })}
            <div class="cup-gauge-label">${escapeHtml(resultsCopy.overflowCapacityLabel)}</div>
            <div class="cup-gauge-value">${harmonicMean.toFixed(1)}/10</div>
          </div>
        </div>
      </div>

      <div class="capacity-band">
        <div class="eyebrow">${String(band.level).padStart(2, '0')} / ${escapeHtml(band.label.toUpperCase())}</div>
        <h2>${escapeHtml(band.subtitle)}</h2>
        <p class="body-copy">${escapeHtml(band.paragraph)}</p>

        <div class="leak-callout">
          <strong>${escapeHtml(resultsCopy.leverageLabel)}</strong>
          <p class="body-copy" style="color:var(--ink); margin-top:0;">${escapeHtml(leverage.name)}</p>
          <p class="body-copy" style="color:var(--ink-soft);">${escapeHtml(resultsCopy.leverageBody(minScore))}</p>
        </div>
        <div class="support-row">
          <strong>${escapeHtml(resultsCopy.supportLabel)}</strong>
          <p class="body-copy" style="color:var(--ink-soft); margin-top:0;">${escapeHtml(resultsCopy.supportBody(support.name, maxScore))}</p>
        </div>

        <h2 style="margin-top:40px;">${escapeHtml(resultsCopy.changesHeading)}</h2>
        <p class="body-copy" style="color:rgba(251,247,239,0.78);">${escapeHtml(resultsCopy.changesSubheading)}</p>
        <div class="next-moves">
          ${nextMoves
            .map(
              (m, i) => `<div class="next-move-item"><span class="num">${String(i + 1).padStart(2, '0')}</span><p>${escapeHtml(m)}</p></div>`
            )
            .join('')}
        </div>
      </div>

      <div class="assess-card" style="margin-top:40px;">
        <h2>${escapeHtml(resultsCopy.ledgerHeading)}</h2>
        <p class="research">${escapeHtml(resultsCopy.ledgerSubheading)}</p>
        <p class="assess-hint" style="text-align:left;">${escapeHtml(resultsCopy.ledgerExplainer)}</p>
        <div class="assess-ledger">${ledgerRows}</div>
      </div>

      <div class="assess-card" style="margin-top:40px;">
        <h2 style="font-size:24px;">${escapeHtml(resultsCopy.emailHeading)}</h2>
        <form class="email-copy-form" id="assess-email-form">
          <input type="email" id="assess-email-input" placeholder="you@email.com" required />
          <button type="submit" class="btn-primary">${escapeHtml(resultsCopy.emailCta)}</button>
        </form>
        <div id="assess-email-status"></div>
      </div>

      <div class="assess-card" id="assess-next-move" style="margin-top:40px; text-align:center; display:none;">
        <h2>${escapeHtml(resultsCopy.moveHeading)}</h2>
        <p class="research">${escapeHtml(resultsCopy.moveBody(leverage.name))}</p>
        <a class="btn-primary" href="${clarityCallUrl}" target="_blank" rel="noopener" style="margin-top:24px; display:inline-flex;">${escapeHtml(resultsCopy.moveCta)}</a>
      </div>

      <p class="assess-hint" style="margin-top:40px;">${escapeHtml(resultsCopy.footer)}</p>
    </div>
  `;

  document.getElementById('assess-restart')!.addEventListener('click', () => {
    scores = assessmentVariables.map(() => null);
    currentIndex = 0;
    pendingScore = 5;
    screen = 'intro';
    render();
  });

  document.getElementById('assess-email-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('assess-email-input') as HTMLInputElement;
    const submitBtn = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    const email = input.value.trim();
    const status = document.getElementById('assess-email-status')!;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.className = 'email-copy-status email-copy-status--error';
      status.textContent = resultsCopy.emailError;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.style.opacity = '.6';
    status.className = 'email-copy-status';
    status.textContent = 'Sending...';

    try {
      const res = await fetch('/api/assessment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          currentLevel: arithmeticMean,
          overflowCapacity: harmonicMean,
          bandLevel: band.level,
          bandLabel: band.label,
          bandSubtitle: band.subtitle,
          leverageSkill: leverage.name,
          leverageScore: minScore,
          supportSkill: support.name,
          supportScore: maxScore,
          scores: assessmentVariables.map((v, i) => ({ skill: v.name, score: finalScores[i] })),
        }),
      });
      const data = await res.json().catch(() => ({ ok: false }));

      if (res.ok && data.ok) {
        status.textContent = `Sent. Check ${email} for your results.`;
        const nextMoveBox = document.getElementById('assess-next-move');
        if (nextMoveBox) {
          nextMoveBox.style.display = 'block';
          nextMoveBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        status.className = 'email-copy-status email-copy-status--error';
        status.textContent = "Couldn't send that email right now. Please try again in a moment.";
      }
    } catch {
      status.className = 'email-copy-status email-copy-status--error';
      status.textContent = "Couldn't send that email right now. Please try again in a moment.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  });
}

render();

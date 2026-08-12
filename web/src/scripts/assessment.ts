import { assessmentVariables } from '../data/assessmentVariables';
import { assessmentIntro, assessmentQuestionCopy, resultsCopy, bandForCapacity } from '../data/assessmentCopy';

type Screen = 'intro' | 'question' | 'results';

const root = document.getElementById('assessment-app');
if (!root) throw new Error('assessment root not found');

let screen: Screen = 'intro';
let currentIndex = 0;
let scores: (number | null)[] = assessmentVariables.map(() => null);
let pendingScore: number | null = null;

function escapeHtml(s: string) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function render() {
  if (screen === 'intro') renderIntro();
  else if (screen === 'question') renderQuestion();
  else renderResults();
}

function renderIntro() {
  root!.innerHTML = `
    <div class="assess-shell">
      <div class="assess-card">
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
        <p class="assess-hint">${escapeHtml(assessmentIntro.privacyNote)}</p>
      </div>
      <p class="assess-hint" style="margin-top:24px;">${escapeHtml(assessmentIntro.disclaimer)}</p>
    </div>
  `;
  document.getElementById('assess-begin')!.addEventListener('click', () => {
    screen = 'question';
    currentIndex = 0;
    pendingScore = scores[0];
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
        <div class="eyebrow">Variable ${String(currentIndex + 1).padStart(2, '0')}</div>
        <h2>${escapeHtml(v.name)}</h2>
        <p class="research">${escapeHtml(v.definition)}</p>
        ${currentIndex > 0 ? `<p class="assess-hint" style="text-align:left; margin-top:24px;">${escapeHtml(assessmentQuestionCopy.encouragement)}</p>` : ''}
        <div class="eyebrow" style="margin-top:28px;">${escapeHtml(assessmentQuestionCopy.eyebrow)}</div>
        <p class="reflection">${escapeHtml(v.reflectionQuestion)}</p>
        <div class="assess-anchors">
          <div class="low"><strong>1&ndash;4</strong><br />${escapeHtml(v.lowAnchor)}</div>
          <div class="high"><strong>8&ndash;10</strong><br />${escapeHtml(v.highAnchor)}</div>
        </div>
        <div class="eyebrow" style="justify-content:center; margin-top:32px;">${escapeHtml(assessmentQuestionCopy.chooseLabel)}</div>
        <div class="assess-scale" role="group" aria-label="Score 1 to 10">
          ${Array.from({ length: 10 }, (_, i) => i + 1)
            .map(
              (n) => `<button type="button" data-score="${n}" aria-pressed="${pendingScore === n}">${n}</button>`
            )
            .join('')}
        </div>
        <p class="assess-hint">${escapeHtml(assessmentQuestionCopy.hint1)}</p>
        <p class="assess-hint">${escapeHtml(assessmentQuestionCopy.hint2)}</p>
        <div class="assess-nav">
          <button type="button" class="btn-text" id="assess-back" ${currentIndex === 0 ? 'style="visibility:hidden;"' : ''}>&larr; ${escapeHtml(assessmentQuestionCopy.back)}</button>
          <button type="button" class="btn-primary" id="assess-next" ${pendingScore === null ? 'disabled style="opacity:.4;cursor:not-allowed;"' : ''}>
            ${isLast ? escapeHtml(assessmentQuestionCopy.finish) : escapeHtml(assessmentQuestionCopy.continue)}
          </button>
        </div>
      </div>
    </div>
  `;

  root!.querySelectorAll('[data-score]').forEach((btn) => {
    btn.addEventListener('click', () => {
      pendingScore = Number((btn as HTMLElement).dataset.score);
      render();
    });
  });
  document.getElementById('assess-next')!.addEventListener('click', () => {
    if (pendingScore === null) return;
    scores[currentIndex] = pendingScore;
    if (isLast) {
      screen = 'results';
    } else {
      currentIndex += 1;
      pendingScore = scores[currentIndex];
    }
    render();
  });
  const backBtn = document.getElementById('assess-back');
  if (backBtn && currentIndex > 0) {
    backBtn.addEventListener('click', () => {
      currentIndex -= 1;
      pendingScore = scores[currentIndex];
      render();
    });
  }
}

function renderResults() {
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
        <div style="display:flex; gap:40px; margin-top:24px; flex-wrap:wrap;">
          <div>
            <div class="eyebrow" style="margin-bottom:6px;">${escapeHtml(resultsCopy.currentLevelLabel)}</div>
            <div style="font:600 40px/1 var(--serif); color:var(--forest);">${arithmeticMean.toFixed(1)}/10</div>
          </div>
          <div>
            <div class="eyebrow" style="margin-bottom:6px;">${escapeHtml(resultsCopy.overflowCapacityLabel)}</div>
            <div style="font:600 40px/1 var(--serif); color:var(--forest);">${harmonicMean.toFixed(1)}/10</div>
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

      <div class="assess-card" style="margin-top:40px; text-align:center;">
        <h2>${escapeHtml(resultsCopy.moveHeading)}</h2>
        <p class="research">${escapeHtml(resultsCopy.moveBody(leverage.name))}</p>
        <a class="btn-primary" href="/private-advisory#apply" style="margin-top:24px; display:inline-flex;">${escapeHtml(resultsCopy.moveCta)}</a>
      </div>

      <div class="assess-card" style="margin-top:40px;">
        <h2 style="font-size:24px;">${escapeHtml(resultsCopy.emailHeading)}</h2>
        <p class="research">${escapeHtml(resultsCopy.emailBody)}</p>
        <form class="email-copy-form" id="assess-email-form">
          <input type="email" id="assess-email-input" placeholder="you@email.com" required />
          <button type="submit" class="btn-primary">${escapeHtml(resultsCopy.emailCta)}</button>
        </form>
        <div id="assess-email-status"></div>
      </div>

      <p class="assess-hint" style="margin-top:40px;">${escapeHtml(resultsCopy.footer)}</p>
    </div>
  `;

  document.getElementById('assess-restart')!.addEventListener('click', () => {
    scores = assessmentVariables.map(() => null);
    currentIndex = 0;
    pendingScore = null;
    screen = 'intro';
    render();
  });

  document.getElementById('assess-email-form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('assess-email-input') as HTMLInputElement;
    const email = input.value.trim();
    const status = document.getElementById('assess-email-status')!;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.className = 'email-copy-status email-copy-status--error';
      status.textContent = resultsCopy.emailError;
      return;
    }
    const subject = 'My Life 2.0 Overflow Assessment results';
    const lines = [
      'Life 2.0 - The Overflow Assessment',
      '',
      `Current level: ${arithmeticMean.toFixed(1)}/10`,
      `Overflow capacity: ${harmonicMean.toFixed(1)}/10 (${band.label})`,
      '',
      `Primary leverage point: ${leverage.name} (${minScore}/10)`,
      `Source of support: ${support.name} (${maxScore}/10)`,
      '',
      ...assessmentVariables.map((v, i) => `${String(v.order).padStart(2, '0')}. ${v.name}: ${finalScores[i]}/10`),
      '',
      'This is a starting point, not a diagnosis.',
    ];
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    status.className = 'email-copy-status';
    status.textContent = 'Your email app is opening with a prepared copy of these results.';
  });
}

render();

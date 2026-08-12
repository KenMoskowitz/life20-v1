(() => {
  const state = { tie: null };

  const waitForResults = () => {
    const rows = [...document.querySelectorAll('.ledger-row')]
      .map((row) => ({ row, score: Number((row.textContent.match(/(\d{1,2})\/10/) || [])[1]) }))
      .filter(({ score }) => Number.isFinite(score));

    if (rows.length !== 9 || document.documentElement.dataset.life20TieHandled === 'true') return;

    const low = Math.min(...rows.map(({ score }) => score));
    const high = Math.max(...rows.map(({ score }) => score));
    const lows = rows.filter(({ score }) => score === low);
    const highs = rows.filter(({ score }) => score === high);
    if (lows.length < 2 && highs.length < 2) return;

    const countLabel = (count) => count === 9 ? 'all nine variables' : `${count} variables`;
    const leakCallout = document.querySelector('.primary-leak-callout');
    const supportRow = document.querySelector('.support-row');
    const firstNextMove = document.querySelector('.next-move-item p');
    const ctaCopy = document.querySelector('.results-cta-actions > p');
    if (!leakCallout || !supportRow || !firstNextMove || !ctaCopy) return;

    if (lows.length > 1 && leakCallout) {
      const heading = leakCallout.querySelector('strong');
      const paragraph = leakCallout.querySelector('p');
      if (heading) heading.textContent = `Shared leverage across ${countLabel(lows.length)}`;
      if (paragraph) paragraph.textContent = `At ${low}/10, these areas are moving together. There is no arbitrary “worst” category here—begin with the one that feels most alive in your real week.`;
      if (firstNextMove) firstNextMove.textContent = 'Name the shared pattern. Revisit the lowest-scoring reflection questions and begin with the one you are most ready to address honestly.';
      if (ctaCopy) ctaCopy.textContent = `Your clearest leverage is shared across ${countLabel(lows.length)}. A Clarity Call can help you decide where to begin.`;
    }

    if (highs.length > 1 && supportRow) {
      const paragraph = supportRow.querySelector('p');
      if (paragraph) paragraph.textContent = `Support is shared across ${countLabel(highs.length)} at ${high}/10. Those conditions are part of the infrastructure that helps the rest of the system hold.`;
    }

    state.tie = { low, high, lowCount: lows.length, highCount: highs.length };
    document.documentElement.dataset.life20TieHandled = 'true';
  };

  const observer = new MutationObserver(waitForResults);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!state.tie || !form.matches('.email-copy-form')) return;
    const email = form.querySelector('input[type="email"]')?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const subject = 'My Life 2.0 Overflow Assessment results';
    const body = [
      'Life 2.0 — The Overflow Assessment',
      '',
      `A shared leverage pattern appeared across ${state.tie.lowCount === 9 ? 'all nine variables' : `${state.tie.lowCount} variables`} at ${state.tie.low}/10.`,
      `Support is shared across ${state.tie.highCount === 9 ? 'all nine variables' : `${state.tie.highCount} variables`} at ${state.tie.high}/10.`,
      '',
      'A starting point, not a diagnosis.',
    ].join('\n');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, true);
})();

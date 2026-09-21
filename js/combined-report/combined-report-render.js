/* ══════════════════════════════════════════
   Combined Report — render + logic
   Reads both results from the same IndexedDB
   database the Reasoning Skills and Career
   Discovery pages already save to.
   ══════════════════════════════════════════ */

(function () {
  "use strict";

  async function loadData() {
    const db = new Dexie('MediaOnAfricaDB');
    db.version(1).stores({ quizProgress: '++id, quizId, answers, timestamp, synced' });
    await db.open();

    const reasoning = {};
    let reasoningDone = 0;
    for (const key of Object.keys(REASONING_KEYS)) {
      const row = await db.quizProgress.where('quizId').equals(key).first();
      if (row && row.answers && typeof row.answers.total === 'number' && row.answers.total > 0) {
        reasoning[REASONING_KEYS[key]] = Math.round((row.answers.score / row.answers.total) * 100);
        reasoningDone++;
      }
    }

    const careerRow = await db.quizProgress.where('quizId').equals('career-profile-result').first();
    const career = careerRow ? careerRow.answers : null;

    return { reasoning, reasoningComplete: reasoningDone === Object.keys(REASONING_KEYS).length, career };
  }

  function starsHtml(n) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="empty">★</span>';
    return s;
  }

  function render({ reasoning, reasoningComplete, career }) {
    const content = document.getElementById('content');
    const hasReasoning = reasoningComplete;
    const hasCareer = !!career;

    if (!hasReasoning && !hasCareer) {
      content.innerHTML = `
        <div class="card empty-state">
          <div class="icon">🧭</div>
          <h3>No results yet</h3>
          <p class="section-desc">Complete both assessments to see your combined report here.</p>
          <div class="cta-buttons" style="justify-content:center;">
            <a href="aptitude.html" class="hero-btn">Take Reasoning Skills Assessment</a>
            <a href="career-discovery.html" class="hero-btn">Take Career Discovery Assessment</a>
          </div>
        </div>`;
      return;
    }

    let reasoningAvg = null;
    let barsHtml = '';
    if (hasReasoning) {
      const vals = Object.values(reasoning);
      reasoningAvg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      barsHtml = Object.entries(reasoning).map(([label, pct]) => `
        <div class="bar-row">
          <span>${label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;"></div></div>
          <span>${pct}%</span>
        </div>`).join('') + `
        <div class="bar-row" style="font-weight:700; margin-top:0.4rem;">
          <span>Overall</span>
          <div class="bar-track"><div class="bar-fill" style="width:${reasoningAvg}%;"></div></div>
          <span>${reasoningAvg}%</span>
        </div>`;
    }

    let stars = null;
    if (hasReasoning && hasCareer) {
      stars = Math.max(1, Math.min(5, Math.round((reasoningAvg / 100) * 5)));
    }

    const heroTitle = hasCareer
      ? `You're ${/^[aeiou]/i.test(career.personalityTitle) ? 'an' : 'a'} ${career.personalityTitle}`
      : 'Your Combined Report';

    // Same personality-color system as the Career Discovery report
    const heroFrom = hasCareer && career.primaryKey ? TYPE_COLORS[career.primaryKey] : null;
    const heroTo = hasCareer && career.secondaryKey ? TYPE_COLORS[career.secondaryKey] : heroFrom;

    let html = `
      <div class="report-hero" id="reportHero">
        <h2>${heroTitle}</h2>
        ${hasCareer ? `<p>${career.personalityBlurb}</p>` : `<p>Complete the Career Discovery Assessment to see your personality profile here.</p>`}
        ${stars !== null ? `<div class="stars">${starsHtml(stars)}</div><div class="match-caveat">Overall Career Match — based on assessment completion and reasoning strength. Use this as a starting point, not a final answer.</div>` : ''}
      </div>
      <div class="report-grid">`;

    html += `<div class="card report-card report-card--reasoning"><h4>Reasoning Skills</h4>`;
    html += hasReasoning
      ? barsHtml
      : `<div class="missing-card"><p class="section-desc">Not completed yet.</p><a href="aptitude.html" class="hero-btn">Take Reasoning Skills Assessment</a></div>`;
    html += `</div>`;

    html += `<div class="card report-card report-card--learning"><h4>Learning Style</h4>`;
    html += hasCareer
      ? `<p class="section-desc">${career.learningStyleText}</p>`
      : `<div class="missing-card"><p class="section-desc">Not completed yet.</p><a href="career-discovery.html" class="hero-btn">Take Career Discovery Assessment</a></div>`;
    html += `</div>`;

    html += `<div class="card report-card report-card--subjects"><h4>Subjects to Focus On</h4>`;
    html += hasCareer
      ? `<div class="tag-list">${career.subjects.map((s) => `<span class="tag">${s}</span>`).join('')}</div>`
      : `<p class="section-desc">Complete the Career Discovery Assessment to see subject suggestions.</p>`;
    html += `</div>`;

    html += `<div class="card report-card report-card--growth"><h4>Growth Areas</h4><div class="tag-list">`;
    if (hasCareer) html += `<span class="tag">${career.growthText}</span>`;
    if (hasReasoning) {
      const weakest = Object.entries(reasoning).sort((a, b) => a[1] - b[1])[0];
      if (weakest && weakest[1] < 70) html += `<span class="tag">${weakest[0]} reasoning practice</span>`;
    }
    if (!hasCareer && !hasReasoning) html += `<span class="section-desc">Complete both assessments to see growth areas.</span>`;
    html += `</div></div>`;

    html += `</div>`; // end report-grid

    html += `<div class="report-careers-banner"><h4>Recommended Careers</h4>`;
    if (hasCareer) {
      html += `<div class="tag-list">${career.careers.map((c) => `<span class="tag career">${c}</span>`).join('')}</div>`;
      if (hasReasoning && reasoningAvg >= 70) {
        html += `<p class="section-desc" style="margin-top:0.6rem; color:#e2e8f0;">Your reasoning scores are strong across the board, which supports these career directions particularly well.</p>`;
      }
    } else {
      html += `<div class="missing-card"><p class="section-desc">Complete the Career Discovery Assessment to see career suggestions.</p><a href="career-discovery.html" class="hero-btn">Take Career Discovery Assessment</a></div>`;
    }
    html += `</div>`;

    if (!hasReasoning || !hasCareer) {
      html += `
        <div class="cta-card" style="margin-top:1.25rem;">
          <h3>Complete your full profile</h3>
          <p>You've finished ${hasCareer ? 'the Career Discovery Assessment' : 'the Reasoning Skills Assessment'}. Finish the other one for your complete combined report.</p>
          <div class="cta-buttons">
            ${!hasReasoning ? `<a href="aptitude.html" class="cta-btn">Take Reasoning Skills Assessment →</a>` : ''}
            ${!hasCareer ? `<a href="career-discovery.html" class="cta-btn">Take Career Discovery Assessment →</a>` : ''}
          </div>
        </div>`;
    }

    content.innerHTML = html;

    if (heroFrom) {
      const heroEl = document.getElementById('reportHero');
      if (heroEl) {
        heroEl.style.setProperty('--hero-from', heroFrom);
        heroEl.style.setProperty('--hero-to', heroTo);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const data = await loadData();
      render(data);
    } catch (e) {
      console.error(e);
      document.getElementById('content').innerHTML = `<div class="card"><p class="section-desc">Couldn't load your report. Make sure you've completed at least one assessment on this device/browser.</p></div>`;
    }
  });
})();
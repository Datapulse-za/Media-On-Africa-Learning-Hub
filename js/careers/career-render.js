(function () {
  "use strict";

  const TYPE_COLORS = {
    R: "#b45309", // Builder    — copper/burnt orange, hands-on and grounded
    I: "#1d4ed8", // Investigator — clear blue, analytical
    A: "#9333ea", // Creator    — purple, imaginative
    S: "#e11d48", // Helper     — warm rose-red, caring
    E: "#ea580c", // Persuader  — vivid orange, energetic
    C: "#0d9488", // Organiser  — teal, structured and calm
  };

  function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255,
      g = (n >> 8) & 255,
      b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /* ---------------- RENDER FORMS ---------------- */

  function renderLikert() {
    const form = document.getElementById("career-interests");
    form.innerHTML = RIASEC_ITEMS.map(
      (it) => `
      <div class="likert-item">
        <p class="likert-text">${it.text}</p>
        <div class="likert-scale">
          ${[1, 2, 3, 4, 5].map((v) => `<label class="likert-option"><input type="radio" name="${it.id}" value="${v}">${v}</label>`).join("")}
        </div>
      </div>`,
    ).join("");
  }

  function renderChips(containerId, items, groupName) {
    const container = document.getElementById(containerId);
    container.innerHTML = items
      .map(
        (label, i) => `
      <div class="chip">
        <input type="checkbox" id="${groupName}_${i}" name="${groupName}" value="${label}">
        <label for="${groupName}_${i}">${label}</label>
      </div>`,
      )
      .join("");
  }

  function renderVark() {
    const form = document.getElementById("career-learning");
    form.innerHTML = VARK_ITEMS.map(
      (q) => `
      <div class="likert-item">
        <p class="likert-text">${q.text}</p>
        ${q.options.map((opt) => `<label style="display:block; margin:0.25rem 0;"><input type="radio" name="${q.id}" value="${opt.v}"> ${opt.label}</label>`).join("")}
      </div>`,
    ).join("");
  }

  function renderWorkPrefs() {
    const form = document.getElementById("career-workprefs");
    form.innerHTML = WORKPREF_ITEMS.map(
      (wp) => `
      <div class="pref-item">
        <div class="pref-label">${wp.label}</div>
        <div class="pref-pair">
          <div class="pref-box"><input type="radio" id="${wp.id}_a" name="${wp.id}" value="a"><label for="${wp.id}_a">${wp.a}</label></div>
          <div class="pref-box"><input type="radio" id="${wp.id}_b" name="${wp.id}" value="b"><label for="${wp.id}_b">${wp.b}</label></div>
        </div>
      </div>`,
    ).join("");
  }

  function enforceChipLimit(groupName, max, counterId) {
    const boxes = document.querySelectorAll(`input[name="${groupName}"]`);
    function update() {
      const checked = document.querySelectorAll(
        `input[name="${groupName}"]:checked`,
      );
      document.getElementById(counterId).textContent =
        `Selected: ${checked.length} / ${max}`;
      boxes.forEach((b) => {
        if (!b.checked) b.disabled = checked.length >= max;
      });
    }
    boxes.forEach((b) => b.addEventListener("change", update));
    update();
  }

  /* ---------------- RADAR CHART ---------------- */

  function buildRadarSVG(scores, color) {
    const order = ["R", "I", "A", "S", "E", "C"];
    const cx = 160,
      cy = 160,
      maxR = 110,
      maxScore = 20;
    function pt(i, r) {
      const ang = (Math.PI / 180) * (-90 + i * 60);
      return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    }
    let grid = "";
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      const pts = order.map((t, i) => pt(i, maxR * f).join(",")).join(" ");
      grid += `<polygon points="${pts}" fill="none" stroke="#dbe7ef" stroke-width="1"/>`;
    });
    let axes = "",
      labels = "";
    order.forEach((t, i) => {
      const [x, y] = pt(i, maxR);
      axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#dbe7ef" stroke-width="1"/>`;
      const [lx, ly] = pt(i, maxR + 24);
      labels += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="11" fill="#475569" font-family="Poppins, sans-serif">${RIASEC_DB[t].name.replace("The ", "")}</text>`;
    });
    const dataPts = order
      .map((t, i) => pt(i, (scores[t] / maxScore) * maxR).join(","))
      .join(" ");
    const dataPoly = `<polygon points="${dataPts}" fill="${hexToRgba(color, 0.3)}" stroke="${color}" stroke-width="2"/>`;
    return `<svg viewBox="0 0 320 320" width="100%" height="300" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${dataPoly}${labels}</svg>`;
  }

  /* ---------------- SCORING ---------------- */

  function getRadioValue(form, name) {
    const radios = form.elements[name];
    if (!radios) return null;
    if (radios.length === undefined)
      return radios.checked ? radios.value : null;
    for (let r = 0; r < radios.length; r++)
      if (radios[r].checked) return radios[r].value;
    return null;
  }

  function computeProfile() {
    const formI = document.getElementById("career-interests");
    const formL = document.getElementById("career-learning");
    const formW = document.getElementById("career-workprefs");

    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    let riasecAnswered = 0;
    RIASEC_ITEMS.forEach((it) => {
      const val = getRadioValue(formI, it.id);
      if (val) {
        scores[it.type] += parseInt(val, 10);
        riasecAnswered++;
      }
    });

    const varkCounts = { V: 0, A: 0, R: 0, K: 0 };
    let varkAnswered = 0;
    VARK_ITEMS.forEach((q) => {
      const val = getRadioValue(formL, q.id);
      if (val) {
        const opt = q.options.find((o) => o.v === val);
        if (opt) {
          varkCounts[opt.type]++;
          varkAnswered++;
        }
      }
    });

    const workPrefs = [];
    let wpAnswered = 0;
    WORKPREF_ITEMS.forEach((wp) => {
      const val = getRadioValue(formW, wp.id);
      if (val) {
        workPrefs.push({ label: wp.label, choice: val === "a" ? wp.a : wp.b });
        wpAnswered++;
      }
    });

    const strengths = Array.from(
      document.querySelectorAll('input[name="strength"]:checked'),
    ).map((el) => el.value);
    const values = Array.from(
      document.querySelectorAll('input[name="value"]:checked'),
    ).map((el) => el.value);

    const missing = [];
    if (riasecAnswered < RIASEC_ITEMS.length)
      missing.push("Interests & Personality");
    if (strengths.length === 0) missing.push("Strengths");
    if (varkAnswered < VARK_ITEMS.length) missing.push("Learning Style");
    if (wpAnswered < WORKPREF_ITEMS.length) missing.push("Work Preferences");
    if (values.length === 0) missing.push("Values");
    if (missing.length) return { missing };

    const sortedTypes = Object.keys(scores).sort(
      (a, b) => scores[b] - scores[a],
    );
    const primaryKey = sortedTypes[0],
      secondaryKey = sortedTypes[1],
      growthKey = sortedTypes[sortedTypes.length - 1];
    const primary = RIASEC_DB[primaryKey],
      secondary = RIASEC_DB[secondaryKey],
      growth = RIASEC_DB[growthKey];

    const subjects = Array.from(
      new Set([...primary.subjects, ...secondary.subjects.slice(0, 3)]),
    ).slice(0, 7);
    const careers = Array.from(
      new Set([
        ...primary.careers.slice(0, 4),
        ...secondary.careers.slice(0, 3),
      ]),
    ).slice(0, 7);

    const maxVark = Math.max(...Object.values(varkCounts));
    const dominantVark = Object.keys(varkCounts).filter(
      (k) => varkCounts[k] === maxVark,
    );

    return {
      missing: [],
      riasecScores: scores,
      primaryKey,
      secondaryKey,
      growthKey,
      personalityTitle: `${primary.name}${secondary ? " with " + secondary.name + " traits" : ""}`,
      personalityBlurb:
        primary.desc +
        (secondary
          ? ` You also show ${secondary.name.replace("The ", "").toLowerCase()} traits: ${secondary.desc.split(". ")[0].toLowerCase()}.`
          : ""),
      strengths,
      growthText: growth.growth,
      varkCounts,
      dominantVark,
      learningStyleText: dominantVark.map((k) => VARK_DB[k]).join(" "),
      workPrefs,
      values,
      subjects,
      careers,
    };
  }

  function renderReport(profile) {
    const reportBody = document.getElementById("reportBody");
    const toggleBtn = document.getElementById("toggleReportBtn");
    if (reportBody) reportBody.style.display = "";
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.innerHTML =
        '<span class="hide-report-icon">▲</span> Hide Report';
    }
    const heroColor = TYPE_COLORS[profile.primaryKey];
    const heroColorSecondary = TYPE_COLORS[profile.secondaryKey] || heroColor;
    const heroEl = document.querySelector(".report-hero");
    if (heroEl) {
      heroEl.style.setProperty("--hero-from", heroColor);
      heroEl.style.setProperty("--hero-to", heroColorSecondary);
    }
    document.getElementById("reportPersonalityTitle").textContent =
      `You're ${/^[aeiou]/i.test(profile.personalityTitle) ? "an" : "a"} ${profile.personalityTitle}`;
    document.getElementById("reportPersonalityBlurb").textContent =
      profile.personalityBlurb;
    document.getElementById("radarChart").innerHTML = buildRadarSVG(
      profile.riasecScores,
      heroColor,
    );
    document.getElementById("reportStrengths").innerHTML = profile.strengths
      .map((s) => `<span class="tag">${s}</span>`)
      .join("");
    document.getElementById("reportGrowth").innerHTML =
      `<span class="tag">${profile.growthText}</span>`;
    document.getElementById("reportLearningStyle").textContent =
      profile.learningStyleText;
    document.getElementById("reportWorkPrefs").innerHTML = profile.workPrefs
      .map((wp) => `<li><strong>${wp.label}:</strong> ${wp.choice}</li>`)
      .join("");
    document.getElementById("reportValues").innerHTML = profile.values
      .map(
        (v) =>
          `<p style="margin:0.3rem 0;"><strong>${v}</strong> — ${VALUE_TIPS[v] || ""}</p>`,
      )
      .join("");
    document.getElementById("reportSubjects").innerHTML = profile.subjects
      .map((s) => `<span class="tag">${s}</span>`)
      .join("");
    document.getElementById("reportCareers").innerHTML = profile.careers
      .map((c) => `<span class="tag career">${c}</span>`)
      .join("");
    document.getElementById("reportSection").style.display = "block";
    document
      .getElementById("reportSection")
      .scrollIntoView({ behavior: "smooth" });
  }

  /* ---------------- PERSISTENCE (Dexie / IndexedDB) ---------------- */

  let db = null;

  async function initDB() {
    if (typeof Dexie === "undefined")
      await new Promise((r) => setTimeout(r, 500));
    db = new Dexie("MediaOnAfricaDB");
    db.version(1).stores({
      quizProgress: "++id, quizId, answers, timestamp, synced",
    });
    await db.open();
    await loadSavedProgress();
  }

  const SECTION_FORMS = {
    "career-interests": {
      formId: "career-interests",
      badge: "interests-progress-badge",
    },
    "career-strengths": {
      formId: "career-strengths",
      badge: "strengths-progress-badge",
    },
    "career-learning": {
      formId: "career-learning",
      badge: "learning-progress-badge",
    },
    "career-workprefs": {
      formId: "career-workprefs",
      badge: "workprefs-progress-badge",
    },
    "career-values": {
      formId: "career-values",
      badge: "values-progress-badge",
    },
  };

  function collectFormAnswers(formId) {
    const form = document.getElementById(formId);
    const answers = {};
    form.querySelectorAll('input[type="radio"]:checked').forEach((el) => {
      answers[el.name] = el.value;
    });
    form.querySelectorAll('input[type="checkbox"]:checked').forEach((el) => {
      if (!answers[el.name]) answers[el.name] = [];
      answers[el.name].push(el.value);
    });
    return answers;
  }

  function restoreFormAnswers(formId, answers) {
    const form = document.getElementById(formId);
    Object.entries(answers).forEach(([name, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => {
          const el = form.querySelector(
            `input[name="${name}"][value="${CSS.escape(v)}"]`,
          );
          if (el) el.checked = true;
        });
      } else {
        const el = form.querySelector(
          `input[name="${name}"][value="${CSS.escape(val)}"]`,
        );
        if (el) el.checked = true;
      }
    });
    form.dispatchEvent(new Event("change"));
  }

  async function saveSection(quizId) {
    const conf = SECTION_FORMS[quizId];
    const answers = collectFormAnswers(conf.formId);
    try {
      const existing = await db.quizProgress
        .where("quizId")
        .equals(quizId)
        .first();
      await db.quizProgress.put({
        id: existing ? existing.id : undefined, // reuse the same row if one exists
        quizId,
        answers,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      const badge = document.getElementById(conf.badge);
      if (badge) {
        badge.style.display = "inline-block";
        setTimeout(() => (badge.style.display = "none"), 2500);
      }
      showOfflineIndicator("Progress saved offline ✓");
    } catch (e) {
      console.error("Save failed", e);
    }
  }

  async function loadSavedProgress() {
    for (const quizId of Object.keys(SECTION_FORMS)) {
      const saved = await db.quizProgress
        .where("quizId")
        .equals(quizId)
        .first();
      if (saved && saved.answers)
        restoreFormAnswers(SECTION_FORMS[quizId].formId, saved.answers);
    }
  }

  function attachAutoSave() {
    Object.keys(SECTION_FORMS).forEach((quizId) => {
      const form = document.getElementById(SECTION_FORMS[quizId].formId);
      form.addEventListener("change", () => saveSection(quizId));
    });
  }

  function showOfflineIndicator(message) {
    const indicator = document.getElementById("offlineProgress");
    const msgSpan = document.getElementById("progressMessage");
    if (!indicator || !msgSpan) return;
    msgSpan.textContent = message;
    indicator.classList.add("show");
    setTimeout(() => indicator.classList.remove("show"), 2000);
  }

  async function saveCareerProfile(profile) {
    if (!db) await initDB();
    const existing = await db.quizProgress
      .where("quizId")
      .equals("career-profile-result")
      .first();
    await db.quizProgress.put({
      id: existing ? existing.id : undefined,
      quizId: "career-profile-result",
      answers: profile,
      timestamp: new Date().toISOString(),
      synced: false,
    });
  }

  async function resetSection(quizId) {
    const conf = SECTION_FORMS[quizId];
    const form = document.getElementById(conf.formId);
    form
      .querySelectorAll('input[type="radio"], input[type="checkbox"]')
      .forEach((i) => (i.checked = false));
    form.dispatchEvent(new Event("change")); // refreshes chip counters etc.
    await db.quizProgress.where("quizId").equals(quizId).delete();
    showOfflineIndicator("Section reset");
  }

  async function retakeAssessment() {
    if (
      !confirm(
        "This will clear all your answers and your current report. Are you sure?",
      )
    )
      return;
    for (const quizId of Object.keys(SECTION_FORMS)) {
      await resetSection(quizId);
    }
    await db.quizProgress
      .where("quizId")
      .equals("career-profile-result")
      .delete();
    document.getElementById("reportSection").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
    showOfflineIndicator("Assessment reset — start again anytime");
  }

  function attachResetHandler(container) {
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-reset]");
      if (!btn) return;
      resetSection(btn.getAttribute("data-reset"));
    });
  }

  /* ---------------- TOGGLE (event delegation) ---------------- */

  function attachToggleHandler(container) {
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".toggle-btn[data-target]");
      if (!btn) return;
      const el = document.getElementById(btn.getAttribute("data-target"));
      if (!el) return;
      const isOpen = el.style.display === "block";
      el.style.display = isOpen ? "none" : "block";
      btn.textContent = isOpen ? "Show Questions" : "Hide Questions";
    });
  }

  function attachReportToggle() {
    const btn = document.getElementById("toggleReportBtn");
    const body = document.getElementById("reportBody");
    if (!btn || !body) return;

    btn.addEventListener("click", () => {
      const isHidden = body.style.display === "none";
      body.style.display = isHidden ? "" : "none";
      btn.setAttribute("aria-expanded", String(isHidden));
      btn.innerHTML = isHidden
        ? '<span class="hide-report-icon">▲</span> Hide Report'
        : '<span class="hide-report-icon">▼</span> Show Report';
    });
  }

  /* ---------------- INIT ---------------- */

  document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("careerApp") || document.body;
    attachToggleHandler(app);
    attachResetHandler(app);

    renderLikert();
    renderChips("strengths-chip-grid", STRENGTH_ITEMS, "strength");
    renderVark();
    renderWorkPrefs();
    renderChips("values-chip-grid", VALUE_ITEMS, "value");
    enforceChipLimit("strength", STRENGTH_MAX, "strengths-counter");
    enforceChipLimit("value", VALUE_MAX, "values-counter");

    await initDB();
    attachAutoSave();
    attachReportToggle();

    document
      .getElementById("retakeAssessmentBtn")
      .addEventListener("click", retakeAssessment);

    document
      .getElementById("generateReportBtn")
      .addEventListener("click", async () => {
        const profile = computeProfile();
        const noteEl = document.getElementById("generateMissingNote");
        if (profile.missing.length) {
          noteEl.innerHTML = `<div class="missing-note">Please complete: ${profile.missing.join(", ")} before generating your report.</div>`;
          return;
        }
        noteEl.innerHTML = "";
        renderReport(profile);
        await saveCareerProfile(profile);
      });
  });
})();

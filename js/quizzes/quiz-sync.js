// quiz-sync.js  (ES module)
//
// Matches the actual offline pattern from contact-support.js: no Dexie.
// Firestore's own persistentLocalCache (configured in js/config/firebase.js)
// caches query results locally after the first successful online fetch.
// The SAME query, run again while offline, is served from that cache
// automatically by the SDK — no manual queuing or IndexedDB table needed.
//
// Loaded as <script type="module" src="js/quizzes/quiz-sync.js"></script>
// BEFORE quiz-script.js in quizzes.html.

import { db } from "../config/firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Fetches approved questions for one subject/grade/term.
 * - Online, first time: hits Firestore server, and the SDK caches the
 *   result locally for next time (because persistentLocalCache is set
 *   up in firebase.js).
 * - Online, repeat visits: served fast from cache, revalidated against
 *   the server in the background.
 * - Offline: if this exact subject/grade/term was ever queried while
 *   online before, it's served from the local cache. If it was never
 *   queried before, this returns an empty array (nothing to fall back
 *   on locally) — that's what getQuestionsWithFallback below handles.
 */

export async function fetchQuizQuestions(subject, grade, term) {
  try {
    const q = query(
      collection(db, "quizQuestions"),
      where("subject", "==", subject),
      where("grade", "==", grade),
      where("term", "==", term),
      where("approved", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return { q: d.q, options: d.options, answer: d.answer };
    });
  } catch (err) {
    // Offline with nothing cached yet for this query, or a genuine
    // Firestore error — either way, fall through to static fallback.
    console.warn("[quiz-sync] Firestore query unavailable:", err.message);
    return [];
  }
}

/**
 * Tries Firestore (live or cached) first, falls back to the static
 * quizzes object from quiz-data.js if nothing is available yet for that
 * subject/grade/term (e.g. brand-new term, or offline + never visited
 * that term online before).
 */
export async function getQuestionsWithFallback(subject, grade, term) {
  const liveOrCached = await fetchQuizQuestions(subject, grade, term);
  if (liveOrCached.length) return liveOrCached;

  return (window.quizzes?.[subject]?.[grade]?.[term]) || [];
}

// quiz-script.js is a plain (non-module) script and calls this as a
// global — expose it here since module scope doesn't leak to window
// automatically.
window.getQuestionsWithFallback = getQuestionsWithFallback;

/* ---------- Silent offline pre-warming ---------- */

const ALL_TERMS = ["term1", "term2", "term3", "term4"];

/**
 * Silently pre-fetches the other 3 terms for a subject + grade in the
 * background, the moment a learner opens ANY term for that grade — no
 * button, no visible status. This is what makes "quizzes just work
 * offline" true beyond the single term the learner actually clicked:
 * as long as they had signal at some point while browsing a grade, the
 * whole grade gets warmed into Firestore's persistentLocalCache.
 *
 * Fire-and-forget: callers don't await this, and it silently no-ops if
 * the browser is already offline (nothing to warm from).
 */
export async function prefetchGradeTerms(subject, grade) {
  if (!navigator.onLine) return; // nothing to fetch, avoid noisy console errors

  for (const term of ALL_TERMS) {
    await fetchQuizQuestions(subject, grade, term);
  }
}

window.prefetchGradeTerms = prefetchGradeTerms;
# Onboarding Guide - E-Learning Hub

Welcome. This doc explains how the project works, things to be careful with, and what still needs to be done. Read this before you start changing code.

## 1. How pages are built

Every page (Subjects, Quizzes, Forum, etc.) is split into small files instead of one big file:

- **`*-data.js`** — the raw data or settings for that page (for example, which topics exist for which grade).
- **`*-render.js`** — takes that data and builds the actual HTML that the learner sees.
- **`*.js`** (plain name) — handles things the user does on the page, like clicking a button or submitting a form.

When you add a new feature to a page, try to keep this pattern. It keeps data, display, and behaviour separate, which makes it easier for more than one person to work on the same page without conflicts.

## 2. Firebase and Firestore

The app uses Firebase's Firestore database to store things that need to be shared between users — quiz questions, forum posts, and contact form submissions. `js/config/firebase.js` sets this up.

The Firebase config values (`apiKey`, `projectId`, etc.) are normal to have visible in a web app like this — this is how Google's Firebase client SDK works, and real protection comes from Firestore's security rules, not from hiding this file. Ask the admin for the real config values before you start.

The project also uses **offline persistence** — Firestore keeps a local copy of data on the learner's device so pages still work without internet, then syncs when they're back online.

## 3. The Service Worker — read this before touching `service-worker.js`

The service worker is what makes the app work offline. A few important rules:

- **`CACHE_VERSION` must be bumped every time you change a cached file** (HTML, CSS, or JS). If you forget, learners who already have the app "installed" may keep seeing old versions of your changes.
- The current caching strategy is **network-first**: when the learner is online, the browser always tries to fetch the newest version of a file first, and only falls back to the cached copy if the network fails or they're offline. This means small CSS/JS tweaks show up immediately for online users, but you should still bump `CACHE_VERSION` occasionally so the cache doesn't grow forever with old files.
- PDFs are cached separately from everything else, and only PDFs that are listed in `PDF_ASSETS` inside `service-worker.js` get cached automatically. If you add a new PDF, add its path there too.
- There was a past bug where redirected page responses couldn't be reused offline (Chrome would throw an error). This is already fixed in the current file — don't remove the redirect-handling code in the fetch handler unless you're sure you understand why it's there.

## 4. Admin Quiz Generator (`admin-generator.html`)

This is an internal tool (not for learners) that generates multiple-choice quiz questions using Google's Gemini AI and saves them straight to Firestore.

Important things to know:

- **The Gemini API key is typed in by hand** on the page itself (there's a password-style input field) — it is not automatically loaded from a `.env` file when the page runs, because this is a plain static site with no build step, so `.env` files aren't reachable from browser JavaScript. Whoever uses this tool needs their own key.
- Generated questions are **saved as `approved: true` and go live immediately** — there is currently no review/approval step before learners can see them. Worth discussing whether that should change.
- If the main Gemini model fails or is rate-limited, the tool automatically retries with a fallback model.

## 5. Known issues & things to watch

- Some external content (fonts, Firebase SDK, EmailJS SDK) is loaded from public CDNs and cached by the service worker. If a CDN URL ever changes version, remember to update it in both the HTML `<script>` tag/import and in `STATIC_ASSETS` inside `service-worker.js`.
- The `resources/` folder currently contains real PDF study material, but some of these files are copyrighted and **will be removed**. Don't build new features that assume this folder will keep its current content long-term — see the task list below.
- `package.json`'s Playwright dependency is left over from early testing and the test setup isn't finished — see task list.

## 6. Outstanding work / task list

### Content & pages
- [ ] **Subjects page** — finish the restructure to grade → subject → resource-category (Textbooks, Study Guides, Videos, Practice).
- [ ] **Remove copyrighted files from `resources/`** and update `PDF_ASSETS` in `service-worker.js` to match.
- [ ] **Commission original CAPS-aligned content** to replace what's removed — sourcing writers is in progress.
- [ ] **Career Discovery page** — still needs work.
- [ ] **Combined-report page** — needs UI work.
- [ ] **Wellness page** — still needs work.
- [ ] **Blog page** — still needs work.
- [ ] **Quizzes page** — still needs work (see also the performance item below).

### Aptitude test — open decision
- [ ] Decide whether the Reasoning Skills Assessment stays as manually written questions in the codebase, or gets automated the way quizzes are (AI-generated via Gemini, stored in Firestore). See the discussion in chat for trade-offs.

### Discussion Forum
- [ ] Build out a proper backend for the forum (beyond what exists now).
- [ ] Review and implement the learner-data security/safety measures already outlined in the feasibility study (POPIA compliance for minors' data, Firestore security rules, what CyberSafe does vs. what still needs manual moderation).

### Contact page & learner support
- [ ] Decide who actually handles learner queries that come through the contact form once the confirmation email goes out. Technical issues can route to developers for maintenance, but there's currently no one confirmed to help learners with non-technical questions.
- [ ] Khulisa (the intended learner-support partner) has been unreachable by email and phone — find an alternative organisation or contact to fill that role. For career-specific queries, the Department of Higher Education and Training's Khetha career advice line (086 999 0123 / careerhelp@dhet.gov.za) is a possible referral point.
- [x] ~~Khulisa also offered bookable one-on-one counselling sessions for learners, referenced by a booking feature on the contact page~~ — **paused for now**, since Khulisa can't be reached. Not a current priority while focus is on building and testing the rest of the system.

### Testing
- [ ] All pages above still need testing.
- [ ] Decide on a testing strategy (unit tests, integration tests, and how the existing Playwright setup fits in).

### Scale & performance
- [x] ~~Investigate scaling/caching/load-balancing~~ — **deprioritized for now**. Quiz *generation* itself (via `admin-generator.html` + Gemini) has already been confirmed working successfully. Any real delays will be assessed once testing is underway, rather than built for speculatively.

### Admin tooling
- [ ] Decide how the admin generator handles its Gemini key going forward (per-admin pasted key vs. a more secure shared setup).
- [ ] Decide whether generated quiz questions need an approval step before going live to learners.

If you pick up one of these, please update this list so the rest of the team knows what's already being worked on.

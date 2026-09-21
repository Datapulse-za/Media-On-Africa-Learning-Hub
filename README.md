# E-Learning Hub

**Production Site:** https://media-on-africa-learning-hub.github.io/Media-On-Africa-Learning-Hub/

## What this project is

The E-Learning Hub is a free, offline-first web app (a Progressive Web App, or PWA) built for South African high school learners in Grades 8–12. Once a learner opens it and it has loaded, most of it keeps working even without internet.

It gives learners:

- CAPS-aligned study material, organised by grade and subject
- Self-marking practice quizzes
- A Reasoning Skills assessment and a Career Discovery (RIASEC) assessment
- A moderated discussion forum
- A contact form with automatic email confirmation
- A mental wellness page

## How it's built

No build tools, no framework. It is plain HTML, CSS, and JavaScript (ES Modules), served as static files.

| Part | What it uses |
| --- | --- |
| Frontend | HTML5, CSS3, plain JavaScript (ES Modules) |
| Offline support | A Service Worker (`service-worker.js`) + the browser's Cache API |
| Database | Google Firebase / Firestore |
| Quiz generation | Google Gemini API (used from `admin-generator.html`) |
| Emails | EmailJS |
| Forum safety | CyberSafe Africa (online AI checks + offline rule-based backup) |
| Testing | Playwright (not yet fully set up — see ONBOARDING.md) |
| Hosting | GitHub Pages |

## Folder structure (as it actually is today)

```
├── index.html, About.html, Subjects.html, quizzes.html, forum.html,
│   contact.html, khulisa.html, aptitude.html, career-discovery.html,
│   blog.html, mental_wellness.html, library.html, offline.html
│   → one HTML file per page (the "shell")
├── admin-generator.html      # Admin tool: generates quiz questions with Gemini AI
├── admin-delete.html         # Admin tool: deletes quiz questions
├── css/                      # One stylesheet per page
├── js/
│   ├── config/                # Firebase setup (firebase.js) and data seeding (seed.js)
│   ├── subjects/               # Subjects page: data + rendering + sync
│   ├── quizzes/                 # Quiz page: data + rendering + CAPS topics + Firestore sync
│   ├── aptitudes/               # Reasoning Skills Assessment
│   ├── careers/                 # Career Discovery
│   ├── blogs/                   # Blog page
│   ├── forums/                  # Discussion forum
│   ├── wellness/                # Mental Wellness page
│   └── contact/                 # Contact & Khulisa forms
├── cybersafe-integration.js, cybersafe-offline.js, cybersafe-queue.js
│   → forum content moderation
├── anim-bounce.js             # decorative bouncing icons/bubbles
├── offline-banner.js          # shows a banner when the user goes offline
├── service-worker.js          # controls offline caching (see ONBOARDING.md — read this before editing)
├── resources/                 # Study PDFs by grade/subject — being phased out, see ONBOARDING.md
├── tests/                     # Playwright tests
├── manifest.json              # PWA manifest
├── firebase.json, .firebaserc # Firebase project config
└── vercel.json                # Vercel deployment config
```

Each content page follows the same pattern: a `*-data.js` file holds the data/config, a `*-render.js` file builds the HTML from it, and sometimes a plain `*.js` file handles page behaviour (clicks, forms, etc).

## Running it locally

This app needs to be served by a real HTTP server — it will not work if you just open the HTML file directly in your browser (`file://`), because Service Workers and ES Modules both require `http://` or `https://`.

```bash
git clone https://github.com/Media-On-Africa-Learning-Hub/Media-On-Africa-Learning-Hub.git
cd Media-On-Africa-Learning-Hub

# Option A: Python
python3 -m http.server 5500 --bind 127.0.0.1

# Option B: Node
npx serve . --listen tcp://127.0.0.1:5500
```

Then open `http://127.0.0.1:5500` in your browser.

You will also need access to the project's Firebase config and any API keys used for email and quiz generation. Ask the repo admin for these — do not commit real keys to the repository.

## Where to go next

If you're a new developer joining this project, read **ONBOARDING.md** next. It covers the offline caching rules, known issues, and the list of work still to be done.

## Contributing

- Use ES module imports for new JavaScript files.
- If you change any cached file (HTML, CSS, JS), bump `CACHE_VERSION` in `service-worker.js` — otherwise users with the app already installed won't see your changes.
- Test your changes both online and offline (use your browser's dev tools to simulate offline mode) before pushing to `main`.
- Open a pull request rather than pushing directly to `main` where possible.
# Handover - E-Learning Hub

## Repo

The project now lives at:
https://github.com/Datapulse-za/Media-On-Africa-Learning-Hub

All code is pushed and up to date on `main`, including:
- Firestore security rules (`firestore.rules`)
- Admin login for the quiz tools (`js/quizzes/admin-auth.js`)
- Updated `README.md` and `ONBOARDING.md` — **read ONBOARDING.md first**, it covers the project structure, the service worker rules, and the outstanding task list.

## What was fixed this week

Firebase sent a warning that Firestore was in test mode and would start blocking all requests on 30 Sep. This has been fixed:
- Firestore rules now restrict reads/writes per collection (see `firestore.rules` and the "Firestore security" section in `README.md`).
- The admin quiz tools (`admin-generator.html`, `admin-delete.html`) now require an admin login before they can write to the database.

## Accounts

All of these already use the company email, so nothing needs to be transferred — just handed over:

| Account | Notes |
| --- | --- |
| Firebase project | Owner is the Datapulse email. Login uses the company work email. |
| Admin login (quiz tools) | Same company email/password as Firebase. The developer taking over will use this same shared login — no separate account needed. |
| EmailJS | Same company email, different password. |
| Gemini API key | Kept in a local `.env` file for reference only — the admin generator page has no way to read `.env` in the browser, so the key must still be copied and pasted into the page by hand each time it's used. Whoever takes over needs the key value itself, not just the file. |

**Passwords/keys:** send these to the developer directly (password manager or in person), not over chat or plain email.

## Known gap

**CyberSafe** (forum content moderation) — I was handed this project with CyberSafe already integrated and never had its login or admin access. I can't hand over what I don't have. Someone will need to track down who set it up originally.

## Open decisions (see ONBOARDING.md task list for full detail)

- Whether generated quiz questions need an approval step before going live (currently they publish immediately).
- Whether to support more than one admin UID in `firestore.rules` (currently only one UID is allowed).
- Firebase App Check for the contact form, to cut down spam/bot submissions.
- Who handles non-technical learner queries from the contact form (Khulisa has been unreachable — see ONBOARDING.md).
- Forum backend and its own Firestore rules — not built yet, currently blocked by default.

## Before I go

- [ ] Confirm the new domain works: open the Pages URL, load the quizzes page, and generate a test question via `admin-generator.html`.
- [ ] If admin login fails with an "unauthorized domain" error, add the new site domain under Firebase Authentication → Settings → Authorized domains.
- [ ] Confirm developer has Owner/Admin access on the `Datapulse-za` GitHub org and the Firebase project.
- [ ] Pass along the Gemini API key value and the EmailJS password.
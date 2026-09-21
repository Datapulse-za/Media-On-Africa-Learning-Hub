/**
 * Media On Africa Learning Hub — Service Worker
 * ─────────────────────────────────────────────
 * IMPORTANT: Bump CACHE_VERSION every time you push changes to live.
 * v1 → v2 → v3 → v4 → v5 → v6 → v7 etc.
 * This is what forces browsers to drop the old cache and fetch fresh files.
 */

const CACHE_VERSION = "media-on-africa-v16";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PDF_CACHE = `${CACHE_VERSION}-pdfs`;

// ─────────────────────────────────────────────────────────────
// STATIC ASSETS
// Cached on install — served offline immediately
// ─────────────────────────────────────────────────────────────
const STATIC_ASSETS = [
  "index.html",
  "About.html",
  "Subjects.html",
  "library.html",
  "forum.html",
  "quizzes.html",
  "admin-generator.html",
  "admin-delete.html",
  "aptitude.html",
  "career-discovery.html",
  "combined-report.html",
  "blog.html",
  "contact.html",
  "khulisa.html",
  "mental_wellness.html",
  "offline.html",
  "css/styles.css",
  "css/home.css",
  "css/side-decor.css",
  "css/subjects.css",
  "css/quizzes.css",
  "css/aptitude.css",
  "css/career.css",
  "css/blog.css",
  "css/contact-support.css",
  "css/khulisa.css",
  "css/forum.css",
  "css/wellness.css",
  "css/combined-report.css",

  // External EmailJS SDK CDN
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',

  // Shared Firebase configuration
  "js/config/firebase.js",

  // Subjects page — data/render scripts
  "js/subjects/subjects-data.js",
  "js/subjects/subjects-render.js",

  // Quizzes page — data/render scripts
  "js/quizzes/quiz-data.js",
  "js/quizzes/quiz-script.js",
  "js/quizzes/caps-topic.js",
  "js/quizzes/quiz-sync.js",

  // Reasoning Skills Assessment (aptitude.html) — data/render scripts
  "js/aptitudes/reasoning-data.js",
  "js/aptitudes/reasoning-render.js",

  // Career Discovery — data/render scripts
  "js/careers/career-data.js",
  "js/careers/career-render.js",

  // Combined Report — data/render scripts
  "js/combined-report/combined-report-data.js",
  "js/combined-report/combined-report-render.js",

  // Blog page — data/render/behaviour scripts
  "js/blogs/blog-data.js",
  "js/blogs/blog-render.js",
  "js/blogs/blog.js",

  // Contact + Khulisa forms
  "js/contact/contact-support.js",
  "js/contact/khulisa-form.js",

  // Forum page — data/render/behaviour scripts
  "js/forums/forum-data.js",
  "js/forums/forum-render.js",
  "js/forums/forum.js",

  // Wellness page — data/render/behaviour scripts
  "js/wellness/wellness-data.js",
  "js/wellness/wellness-render.js",
  "js/wellness/wellness.js",

  // CyberSafe offline protection — must be cached
  "cybersafe-offline.js",
  "cybersafe-queue.js",
  "cybersafe-integration.js",

  // Shared root-level scripts
  "anim-bounce.js",
  "offline-banner.js",
  "rubric.js",

  // PWA manifest
  "manifest.json",

  // External libraries
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/dexie@3.2.2/dist/dexie.js",
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js",
];

// ─────────────────────────────────────────────────────────────
// PDF ASSETS
// Cached separately so static cache stays lean.
// Only PDFs that actually exist are listed here.
// Add more as you upload them.
// ─────────────────────────────────────────────────────────────
const PDF_ASSETS = [
  // ── Grade 8 ──
  "resources/GR8/Mathematics/grade8-term1.pdf",
  "resources/GR8/Mathematics/grade8-term2.pdf",
  "resources/GR8/Technology/grade8-term1.pdf",
  "resources/GR8/Technology/grade8-term2.pdf",

  // ── Grade 9 ──
  "resources/Gr9/Mathematics/grade9-term1.pdf",
  "resources/Gr9/Mathematics/grade9-term2.pdf",
  "resources/Gr9/Natural Sciences/grade9-term1.pdf",
  "resources/Gr9/Natural Sciences/grade9-term2.pdf",
  "resources/Gr9/Natural Sciences/grade9-term3.pdf",
  "resources/Gr9/Natural Sciences/grade9-term4.pdf",
  "resources/Gr9/Technology/grade9-term1.pdf",
  "resources/Gr9/Technology/grade9-term2.pdf",
  "resources/Gr9/Technology/grade9-term3.pdf",
  "resources/Gr9/Technology/grade9-term4.pdf",

  // ── Grade 10 ──
  "resources/GR10/Mathematics/grade10-term1.pdf",
  "resources/GR10/Mathematics/grade10-term2.pdf",
  "resources/GR10/Mathematics/grade10-term3.pdf",
  "resources/GR10/Mathematics/grade10-term4.pdf",
  "resources/GR10/Physical Sciences/grade10-term1.pdf",
  "resources/GR10/Physical Sciences/grade10-term2.pdf",
  "resources/GR10/Physical Sciences/grade10-term3.pdf",
  "resources/GR10/Physical Sciences/grade10-term4.pdf",
  "resources/GR10/CAT/grade10-term1.pdf",
  "resources/GR10/CAT/grade10-term2.pdf",
  "resources/GR10/CAT/grade10-term3.pdf",
  "resources/GR10/CAT/grade10-term4.pdf",

  // ── Grade 11 ──
  "resources/GR11/Mathematics/grade11-term1.pdf",
  "resources/GR11/Mathematics/grade11-term2.pdf",
  "resources/GR11/Mathematics/grade11-term3.pdf",
  "resources/GR11/Mathematics/grade11-term4.pdf",
  "resources/GR11/Physical Science/grade11-term1.pdf",
  "resources/GR11/Physical Science/grade11-term2.pdf",
  "resources/GR11/Physical Science/grade11-term3.pdf",
  "resources/GR11/Physical Science/grade11-term4.pdf",
  "resources/GR11/CAT/grade11-term1.pdf",
  "resources/GR11/CAT/grade11-term2.pdf",
  "resources/GR11/CAT/grade11-term3.pdf",
  "resources/GR11/CAT/grade11-term4.pdf",

  // ── Grade 12 ──
  "resources/GR12/Mathematics/grade12-term1.pdf",
  "resources/GR12/Mathematics/grade12-term2.pdf",
  "resources/GR12/Mathematics/grade12-term3.pdf",
  "resources/GR12/Mathematics/grade12-term4.pdf",
  "resources/GR12/Physical Sciences/grade12-term1.pdf",
  "resources/GR12/Physical Sciences/grade12-term2.pdf",
  "resources/GR12/Physical Sciences/grade12-term3.pdf",
  "resources/GR12/Physical Sciences/grade12-term4.pdf",
  "resources/GR12/CAT/grade12-term1.pdf",
  "resources/GR12/CAT/grade12-term2.pdf",
  "resources/GR12/CAT/grade12-term3.pdf",
];

// ─────────────────────────────────────────────────────────────
// INSTALL
// Cache static assets immediately.
// PDFs cache in the background — don't block install.
// ─────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing:", CACHE_VERSION);

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets...");
        // Add one by one so a single failure doesn't break everything
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn("[SW] Failed to cache:", url, err.message);
            }),
          ),
        );
      })
      .then(() => {
        // Cache PDFs silently in background
        caches.open(PDF_CACHE).then((cache) => {
          PDF_ASSETS.forEach((url) => {
            cache.add(url).catch(() => {
              // Silently skip missing PDFs — they upload later
            });
          });
        });
        return self.skipWaiting();
      }),
  );
});

// ─────────────────────────────────────────────────────────────
// ACTIVATE
// Delete ALL old caches when version bumps.
// This is what makes the live site show your changes.
// ─────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating:", CACHE_VERSION);

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => {
              console.log("[SW] Deleting old cache:", key);
              return caches.delete(key);
            }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─────────────────────────────────────────────────────────────
// Static assets are precached under their real filenames
// ("contact.html"), but Live Server (and most static hosts) serve
// those files at a "clean" URL with no extension ("/contact") without
// ever redirecting — so the URL bar and cache keys don't match. This
// tries the request as-is, then retries with ".html" appended (and
// "index.html" for a trailing-slash folder path) before giving up.
// ─────────────────────────────────────────────────────────────
async function matchWithCleanUrlFallback(request) {
  let response = await caches.match(request);
  if (response) return response;

  const url = new URL(request.url);
  if (!url.pathname.endsWith("/") && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
    // "/contact" → try "/contact.html"
    response = await caches.match(url.pathname.slice(1) + ".html");
    if (response) return response;
  } else if (url.pathname.endsWith("/")) {
    // "/some-folder/" → try "/some-folder/index.html"
    response = await caches.match(url.pathname.slice(1) + "index.html");
    if (response) return response;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────
// FETCH
// Strategy per request type:
//   /api/*     → network only, never cache
//   *.pdf      → cache first, network fallback
//   navigate   → cache first, network fallback, offline.html last resort
//   everything → cache first, network fallback
// ─────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== "GET") return;

  // Skip Chrome extensions
  if (url.protocol === "chrome-extension:") return;

  // Skip API calls — always network, never cache
  if (url.pathname.startsWith("/api/")) return;

  // Skip CyberSafe backend
  if (url.hostname.includes("cybersafe-africa.onrender.com")) return;

  // ── PDFs — cache first ──
  if (url.pathname.endsWith(".pdf")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(PDF_CACHE)
                .then((cache) => cache.put(request, copy))
                .catch((err) =>
                  console.warn(
                    "[SW] PDF cache write failed:",
                    request.url,
                    err.message,
                  ),
                );
            }
            return response;
          })
          .catch(
            () =>
              new Response(
                "PDF not available offline. Open it online first to cache it.",
                { status: 503, headers: { "Content-Type": "text/plain" } },
              ),
          );
      }),
    );
    return;
  }

  // ── Everything else — network first, cache fallback ──
  // Changed from cache-first: with cache-first, edits to HTML/CSS/JS only
  // show up once CACHE_VERSION is bumped (that's what forces install/activate
  // to run at all). Network-first means every load checks for fresh content
  // when online — no version bump needed just to see a CSS/JS tweak — and
  // still falls back to cache when offline, which is what actually matters
  // for a PWA. Bump CACHE_VERSION occasionally anyway to prevent the static
  // cache from growing unbounded with stale entries.
  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response.ok) {
          // Redirected responses (301/302 en route to the final URL) can't
          // be replayed for a later navigation request — Chrome throws
          // "a redirected response was used for a request whose redirect
          // mode is not follow" and the offline page fails to load.
          // Fix: rebuild a clean, non-redirected Response before caching it.
          let toCache = response;
          if (response.redirected) {
            const body = await response.clone().blob();
            toCache = new Response(body, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          } else {
            toCache = response.clone();
          }

          caches
            .open(STATIC_CACHE)
            .then((cache) => cache.put(request, toCache))
            .catch((err) =>
              console.warn(
                "[SW] Cache write failed:",
                request.url,
                err.message,
              ),
            );
        }
        return response;
      })
      .catch(async () => {
        // Offline (or network failed) — fall back to whatever we have cached
        const cached = await matchWithCleanUrlFallback(request);
        if (cached) return cached;

        // Page navigation with nothing cached → try index.html (handles
        // bare "/" or unknown paths), then fall back to offline.html
        if (request.mode === "navigate") {
          const indexPage = await caches.match("index.html");
          if (indexPage) return indexPage;

          const offlinePage = await caches.match("offline.html");
          // Safety net: if offline.html itself somehow isn't cached,
          // never resolve to undefined — that produces ERR_FAILED instead
          // of a usable page. Fall back to a minimal inline page instead.
          if (offlinePage) return offlinePage;
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
              '<body style="font-family:sans-serif;text-align:center;padding:60px 20px;">' +
              "<h1>You're offline</h1><p>This page isn't available right now. " +
              '<a href="index.html">Go to Home</a></p></body></html>',
            { status: 200, headers: { "Content-Type": "text/html" } },
          );
        }
        return new Response("", { status: 503 });
      }),
  );
});

// ─────────────────────────────────────────────────────────────
// MESSAGE
// Handle requests from pages
// ─────────────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  // Cache specific URLs on demand (used by khulisa download button)
  if (event.data?.type === "CACHE_NEW_ASSETS") {
    caches.open(STATIC_CACHE).then((cache) => {
      (event.data.urls || []).forEach((url) => {
        cache.add(url).catch(() => {});
      });
    });
  }

  // Force immediate activation (used during updates)
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
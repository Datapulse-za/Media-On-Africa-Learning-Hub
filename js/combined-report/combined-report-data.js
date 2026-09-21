/* ══════════════════════════════════════════
   Combined Report — shared config
   Maps the saved keys from the Reasoning Skills
   Assessment to display labels, and mirrors the
   TYPE_COLORS used in career-render.js so both
   reports share the same personality-color system.
   ══════════════════════════════════════════ */

const REASONING_KEYS = {
  'quiz-logical_result': 'Logical',
  'quiz-numerical_result': 'Numerical',
  'quiz-verbal_result': 'Verbal',
  'quiz-abstract_result': 'Abstract',
};

const TYPE_COLORS = {
  R: "#b45309", // Builder
  I: "#1d4ed8", // Investigator
  A: "#9333ea", // Creator
  S: "#e11d48", // Helper
  E: "#ea580c", // Persuader
  C: "#0d9488", // Organiser
};
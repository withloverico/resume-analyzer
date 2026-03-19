# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite HMR)
- **Build:** `npm run build` (outputs to `dist/`)
- **Lint:** `npm run lint` (ESLint with react-hooks and react-refresh plugins)
- **Preview production build:** `npm run preview`
- **Local Netlify dev:** `netlify dev` (serves both the Vite frontend and Netlify Functions)

## Architecture

Single-page React app (JavaScript, no TypeScript) that analyzes resumes using the Anthropic Claude API. Deployed on Netlify.

**Frontend (`src/`):** The entire UI lives in `App.jsx` — a single component with inline styles and no CSS framework. It handles PDF upload, base64 encoding, API calls to Claude, and result rendering. The color palette and design tokens are defined as the `C` object at the top of the file. A `SectionHead` helper component is defined at the bottom of the same file.

**API flow:** The app sends the uploaded PDF (base64-encoded) to `/.netlify/functions/analyze` using the `claude-sonnet-4-20250514` model. The system prompt instructs Claude to return a structured JSON response following the "Three Pillars Framework" (Impact Statements 40%, Information Architecture 30%, ATS Design 30%). All pillar scores are out of 100. The JSON includes: `work_experience` (company, title, summary for each job), `weakest_bullets` (with original, rewrite, and reason), per-pillar `suggestions` arrays, and actionable feedback throughout.

**UI flow:** Three screens managed by a `view` state — "upload" (landing page), "loading" (animated progress with funny phrases), and "results" (full-page analysis). The results screen has a max-width container (1200px), full-width executive summary and work experience sections, then a two-column grid for pillar breakdown + strengths (left) and weakest bullets + missing keywords (right).

**Backend (`netlify/functions/`):** A `analyze.js` function file exists but is currently empty — the API proxy is not yet implemented. `netlify.toml` is also empty.

## Lint Rules

- `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`)
- ESLint ignores the `dist` directory

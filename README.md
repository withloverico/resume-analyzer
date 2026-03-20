# Resume Analyzer

Try it out here: resumeanalyzer.withloverico.me

An AI-powered resume analyzer that scores your resume using the **Three Pillars Framework** and rewrites every bullet point for you.

Upload a PDF, get an honest score out of 100, and walk away with a better resume.

## What It Does

- **Scores your resume** on three weighted pillars:
  - **Impact Statements (40%)** — Are you quantifying results or just listing tasks?
  - **Information Architecture (30%)** — Is your strongest work front and center?
  - **ATS Design (30%)** — Can applicant tracking systems actually parse your formatting?
- **Rewrites every bullet point** — Click into any job card to see your original bullets side-by-side with stronger versions
- **Flags your weakest bullets** with an explanation of why they're weak and a suggested rewrite
- **Detects missing keywords** that recruiters and ATS systems look for
- **Download as PDF** — Print/save your full analysis including all bullet rewrites

## Privacy

Your resume and results are **not stored**. The analysis happens in real-time and lives only in your browser session. Download your results when prompted — you'll only be able to view them once.

## The Framework

Based on [Chloe Shih's PM Resume Tips](https://www.youtube.com/watch?v=3aWHJdS59Qk). The rubric focuses on what actually matters when a recruiter spends 6 seconds scanning your resume. While it originates from PM hiring, the principles apply to any role.

## Tech Stack

- **Frontend:** React (JavaScript) with Vite — single-component app with inline styles
- **AI:** Claude API (Sonnet) via streamed SSE responses
- **Backend:** Netlify Edge Function that proxies and streams the API call
- **Deployment:** Netlify

## Getting Started

```bash
# Install dependencies
npm install

# Set your API key in Netlify (or .env for local dev)
# ANTHROPIC_KEY=your-key-here

# Run locally with Netlify CLI
netlify dev

# Or just the frontend
npm run dev
```

## Make It Your Own

This project is MIT licensed. Fork it and make it yours:

- Swap out the Three Pillars rubric for your own framework
- Change the scoring weights
- Make it industry-specific (engineering, design, marketing, etc.)
- Modify the system prompt in `src/App.jsx` to change how the AI evaluates resumes

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `netlify dev` | Run with Netlify Functions locally |

## License

MIT — see [LICENSE](LICENSE) for details.

Built by [Rico Bolos](https://linkedin.com/in/ricobolos).

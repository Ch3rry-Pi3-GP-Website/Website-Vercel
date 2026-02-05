# GP Diagnostic Aide Setup Guide

This guide documents the full setup for the GP Diagnostic Aide website and pilot app, including:

- Next.js (App Router) website
- Pilot app at `/pilot` with ENT decision pathways
- AI summary generation via LangChain v1 + LangGraph using `gpt-4o-mini`
- Markdown-formatted summaries with rendered output
- Date-stamped clinical note
- PDF export of the clinical note (client-side)
- Voice shortcut to select ears / nose / throat+neck
- Vercel hosting with GitHub auto-deploys

## Prerequisites

### Accounts

- GitHub account (repo lives here)
- Vercel account (hosting)
- OpenAI API key (for summary generation)

### Local tooling

- Node.js 18+
- npm
- Git

Quick checks:

```powershell
node -v
npm -v
git --version
```

## 1) Create or clone the project

### Option A: Create a new project

```powershell
npx create-next-app@latest gp-diagnostic-aide-site
```

Recommended selections:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes

### Option B: Clone the repo

```powershell
git clone https://github.com/<ORG_OR_USER>/<REPO>.git
git checkout main
```

## 2) Install dependencies

```powershell
npm install
```

Key dependencies used in this project:

- `@langchain/openai`
- `@langchain/core`
- `@langchain/langgraph`
- `langchain`
- `react-markdown`
- `remark-gfm`
- `html2canvas`
- `jspdf`

## 3) Run locally

```powershell
npm run dev
```

Visit:

- http://localhost:3000
- http://localhost:3000/pilot

## 4) Project structure (key files)

- `app/page.tsx` (landing page)
- `app/pilot/page.tsx` (pilot app page)
- `components/DecisionFlow.tsx` (decision tree UI + voice selection)
- `components/PilotApp.tsx` (summary generation + PDF export)
- `components/SiteHeader.tsx` (shared navigation)
- `lib/decisionTrees.ts` (ENT decision trees)
- `lib/llm/model.ts` (OpenAI model config)
- `lib/llm/summaryPrompt.ts` (context-engineered prompt)
- `lib/llm/summaryGraph.ts` (LangGraph workflow)
- `app/api/summary/route.ts` (summary API route)

## 5) Environment variables

Add the following in both local and Vercel environments.

### Local: `.env.local` (do not commit)

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Vercel: Project Settings -> Environment Variables

- `OPENAI_API_KEY` (required for summary generation)
- `NEXT_PUBLIC_SITE_URL` (optional but recommended)

After adding env vars, redeploy to ensure they are picked up.

## 6) Summary generation (LLM)

The pilot app calls:

- `POST /api/summary`

This endpoint:

- Validates the decision-path payload
- Uses LangChain + LangGraph
- Calls OpenAI `gpt-4o-mini`
- Runs an agentic draft -> review -> revise loop (max 2 revisions)
- Returns Markdown summary (rendered client-side)

Prompt design uses a context-engineering style and enforces:

- British English
- No hallucinated findings
- Markdown structure with headings and bullet lists
- Final line: "Clinician review required."

## 7) Pilot app UX features

- Voice selection uses the Web Speech API to choose ears / nose / throat+neck
- Summary includes a date of diagnosis stamp
- PDF export uses `html2canvas` + `jspdf`

Notes:

- Voice selection typically requires HTTPS in production
- PDF export is a rendered snapshot of the note panel

## 8) Deploy on Vercel

### Recommended (Dashboard)

1. Vercel -> Add New Project
2. Import GitHub repo
3. Deploy

This gives you a `*.vercel.app` URL and auto-deploys on push.

### Ensure public access

Vercel -> Project -> Settings -> Deployment Protection

Disable Vercel Authentication if you want public access.

## Troubleshooting

### Summaries not generating

- Check `OPENAI_API_KEY` is set in Vercel
- Check Vercel Runtime Logs for `/api/summary`

### Voice selection not working

- Confirm browser supports Web Speech API
- Ensure the site is served over HTTPS

### PDF download not working

- Ensure the summary has been generated
- Try a different browser if canvas export is blocked

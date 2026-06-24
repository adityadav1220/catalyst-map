# Catalyst Map

Catalyst Map is a simple web app for turning a future event, policy change, patent expiry, or market trend into a structured investment research map.

The current MVP uses a local mock analysis function. It does not call an external AI API, require authentication, or store user data in a database.

## What It Does

- Accepts a user-entered event or market catalyst.
- Generates a realistic-looking research map for the entered catalyst.
- Organizes the output into an event summary, impact chain, affected sectors, company categories, possible winners, possible losers, risks, and a research checklist.
- Proves the core workflow before adding real data sources or AI-generated analysis.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Local mock analysis logic

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the local development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal, usually:

```bash
http://localhost:3000
```

## Build

Run a production build:

```bash
npm run build
```

## Deployment to Vercel

1. Push this repository to GitHub.
2. Go to Vercel and create a new project.
3. Import the GitHub repository.
4. Keep the default Next.js build settings.
5. Deploy.

No environment variables are required for the current MVP.

## Recruiter Pitch

Catalyst Map demonstrates a focused product workflow for investment research: starting from an ambiguous real-world catalyst and converting it into a structured map of possible market impacts. The MVP is intentionally simple and deployable, showing product thinking, frontend execution, TypeScript structure, and a path toward future AI-assisted research features.

## Disclaimer

Catalyst Map is for research workflow demonstration only. The generated output is mock analysis and is not financial advice, investment advice, or a recommendation to buy or sell any security.

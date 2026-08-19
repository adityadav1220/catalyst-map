# Catalyst Map

Catalyst Map turns a future event, policy change, patent expiry, infrastructure project, or market trend into an interactive investment-research map. It traces potential effects through demand, supply chains, infrastructure, public-company research leads, risks, second-order effects, and questions to verify.

## Live Production App

**[Open Catalyst Map on Vercel](https://catalyst-map.vercel.app)**

Production status: **deployed and operational**. The homepage and analysis API have been verified in production. The deployment currently uses Mock Fallback Mode until `GROQ_API_KEY` is added to the Vercel project environment.

The app supports two analysis modes without authentication or a database.

## Analysis Modes

### Groq Smart Mode

When `GROQ_API_KEY` is configured, `POST /api/analyze` calls Groq's OpenAI-compatible Chat Completions endpoint from the server. The default provider is selected with `LLM_PROVIDER=groq`, and the lightweight `llama-3.1-8b-instant` model is asked to return JSON matching the Catalyst Map data model, including:

- A catalyst summary and research thesis
- Seven interactive causal-map nodes
- Geography-aware exposure groups
- Confidence levels and key risks
- A concise research checklist

The response is parsed and checked with the app's runtime validator before it reaches the UI. Invalid JSON or a contract mismatch returns a clear error; it is never silently presented as valid research. The API key is read only by the server route and is never sent to the browser.

### Mock Fallback Mode

When no API key is configured, the same API route returns the existing local mock analysis. Semiconductor, EV/electrification, and GLP-1/pharma inputs use richer templates; other events use the cautious generic fallback. This keeps local development and Vercel previews functional without external services.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Optional: enable AI Smart Mode by copying the example environment file:

```bash
cp .env.example .env.local
```

Then add your server-side key to `.env.local`:

```bash
GROQ_API_KEY=your_key_here
LLM_PROVIDER=groq
```

Leave the value empty or skip this step to use mock fallback mode.

3. Start the development server:

```bash
npm run dev
```

4. Open the local URL shown in the terminal, usually [http://localhost:3000](http://localhost:3000).

## API

`POST /api/analyze`

```json
{
  "event": "Government is building a new dam on river Ganga"
}
```

The response is a `CatalystAnalysis` object. The `X-Catalyst-Mode` response header is `smart` when AI generated the analysis and `mock` when the local fallback was used.

## Validation

```bash
npm test
npm run build
```

## Production Deployment

The `main` branch is deployed to Vercel at [catalyst-map.vercel.app](https://catalyst-map.vercel.app).

To enable Groq Smart Mode in production:

1. Add `GROQ_API_KEY` to the Vercel project environment settings.
2. Optionally add `LLM_PROVIDER=groq` (Groq is already the default).
3. Redeploy the production deployment so the new environment variables take effect.

If the environment variable is absent, the deployed app continues to work in mock fallback mode.

API keys must stay in `.env.local` or the Vercel environment settings. Never commit a populated environment file or paste a key into frontend code.

## Research Limitations

Catalyst Map provides AI-assisted research organization, not financial advice or a recommendation to buy, sell, or hold any security. Company names and example tickers are leads to investigate, not verified exposure claims.

Live web research, current market data, regulatory filings, procurement records, and real-time listing verification are not included yet. Users should verify every connection using current primary sources before relying on an idea.

## Smart Mode Troubleshooting

- Put the real Groq key in `.env.local` at the project root—not in `.env.example`.
- Use `GROQ_API_KEY=your_key_here`. `LLM_PROVIDER=groq` is optional because Groq is the default provider.
- Stop and restart `npm run dev` after creating or editing an environment file. Next.js loads project-root environment files when the server starts.
- If the UI reports a provider error, check the server console for the safe provider status and confirm the key is active in Groq.
- Never commit `.env.local`, populated environment files, or API keys. The repository ignores `.env`, `.env.local`, and `.env*.local`.

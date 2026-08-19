import {
  getCatalystAnalysisValidationIssues,
  isCatalystAnalysis,
} from "./analysisSchema";
import {
  CatalystAnalysis,
  generateMockAnalysis,
  getScenarioTheme,
} from "./mockAnalysis";

export type AnalysisMode = "smart" | "mock";

export type AnalysisResult = {
  analysis: CatalystAnalysis;
  mode: AnalysisMode;
};

export type SmartAnalysisErrorType =
  | "missing_key"
  | "provider_error"
  | "invalid_json"
  | "schema_error";

export class SmartAnalysisError extends Error {
  constructor(
    public readonly type: SmartAnalysisErrorType,
    message: string,
    public readonly providerStatus?: number,
    public readonly diagnostic?: string,
  ) {
    super(message);
    this.name = "SmartAnalysisError";
  }
}

const SMART_ANALYSIS_PROMPT = `You are Catalyst Map, a cautious event-driven public-market research assistant.

Analyze the user's catalyst and return one valid JSON object only. Do not use markdown fences, commentary, or text outside the JSON.

Research method:
- Identify the catalyst type and build a causal investment map from demand through supply chains, infrastructure, public-company exposure, risks, second-order effects, and research questions.
- Use exactly seven map nodes, one for each type: demand, supply, infrastructure, companies, risk, second-order, and research.
- Suggest public-company research leads only when a defensible connection is plausible. Phrase them as examples that "could be relevant to investigate," never as beneficiaries or recommendations.
- When a country, city, or region is mentioned, separate local/regional candidates from global supply-chain proxies. State that listings, filings, and revenue exposure need verification.
- Use exactly five compact exposure groups with these IDs and purposes:
  1. "regional" for local or regional candidates,
  2. "global-proxies" for global supply-chain proxies,
  3. "infrastructure" for infrastructure enablers,
  4. "losers" for potential losers,
  5. "second-order" for speculative second-order plays.
- Every group must contain at least one item. If a specific public company cannot be supported, use a category-level item and set exampleTicker to null instead of omitting the group.
- Each company or category item needs an exposure type, confidence, connection, and key risk.
- Use High confidence sparingly. Confidence describes the clarity of the relationship, not expected stock performance.
- Never say buy, sell, hold, target price, guaranteed winner, or provide financial advice.
- You do not have live web, market-data, or filing access. Do not imply current verification.
- If a ticker or fact is uncertain, set exampleTicker to null and use a category-level research lead. Explain what extra information is needed instead of inventing facts.
- Keep the research checklist to five concise, falsifiable actions or fewer.

Scenario and theme:
- Choose semiconductor, ev, or pharma only when clearly applicable; otherwise use generic. Generic means neutral visual theme, not placeholder analysis.
- Theme class fields are required by the schema but will be replaced server-side with safe application classes. Use short descriptive placeholder strings for them.
- Make the catalystSummary and thesis specific to the user's event.

Required JSON contract:
{
  "scenario": "semiconductor" | "ev" | "pharma" | "generic",
  "theme": {
    "name": string,
    "eyebrow": string,
    "canvasClass": string,
    "centerClass": string,
    "activeNodeClass": string,
    "accentClass": string,
    "glowClass": string
  },
  "catalystSummary": string,
  "thesis": string,
  "mapNodes": [{
    "id": string,
    "label": string,
    "type": "demand" | "supply" | "infrastructure" | "companies" | "risk" | "second-order" | "research",
    "shortSummary": string,
    "detail": string,
    "relatedSectors": string[],
    "relatedCompanies": string[],
    "risks": string[],
    "confidence": "High" | "Medium" | "Low",
    "verifyNext": string[]
  }],
  "exposureGroups": [{
    "id": string,
    "title": string,
    "explanation": string,
    "companies": [{
      "company": string,
      "exampleTicker": string | null,
      "category": string,
      "exposureType": "Direct" | "Supplier" | "Infrastructure" | "Customer" | "Negative" | "Speculative",
      "connection": string,
      "confidence": "High" | "Medium" | "Low",
      "keyRisk": string
    }]
  }],
  "researchChecklist": string[]
}

Return exactly seven mapNodes, one of each type. Return exactly five exposureGroups with the required IDs and no more than five researchChecklist items.

The output is research assistance for a demo and is not financial advice.`;

type GroqChatCompletion = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
};

const extractOutputText = (response: GroqChatCompletion) =>
  response.choices?.[0]?.message?.content ?? null;

const normalizeAnalysis = (analysis: CatalystAnalysis): CatalystAnalysis => {
  const safeTheme = getScenarioTheme(analysis.scenario);

  return {
    ...analysis,
    theme: {
      ...safeTheme,
      name: analysis.theme.name.trim() || safeTheme.name,
      eyebrow: analysis.theme.eyebrow.trim() || safeTheme.eyebrow,
    },
  };
};

export const analyzeCatalyst = async (
  event: string,
  apiKey = process.env.GROQ_API_KEY,
  provider = process.env.LLM_PROVIDER || "groq",
): Promise<AnalysisResult> => {
  if (!apiKey) {
    return { analysis: generateMockAnalysis(event), mode: "mock" };
  }

  if (provider.toLowerCase() !== "groq") {
    throw new SmartAnalysisError(
      "provider_error",
      `Unsupported LLM provider: ${provider}.`,
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        max_completion_tokens: 4096,
        messages: [
          { role: "system", content: SMART_ANALYSIS_PROMPT },
          { role: "user", content: event },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    throw new SmartAnalysisError(
      "provider_error",
      "Groq could not be reached from the server.",
    );
  }

  if (!response.ok) {
    const requestId = response.headers.get("x-request-id");
    throw new SmartAnalysisError(
      "provider_error",
      `Groq returned status ${response.status}${requestId ? ` (${requestId})` : ""}.`,
      response.status,
    );
  }

  let payload: GroqChatCompletion;
  try {
    payload = (await response.json()) as GroqChatCompletion;
  } catch {
    throw new SmartAnalysisError(
      "provider_error",
      "Groq returned an unreadable HTTP response.",
    );
  }
  const outputText = extractOutputText(payload);

  if (!outputText) {
    throw new SmartAnalysisError(
      "invalid_json",
      "The model response did not include JSON content.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new SmartAnalysisError(
      "invalid_json",
      "The model response could not be parsed as JSON.",
    );
  }

  if (!isCatalystAnalysis(parsed)) {
    const issues = getCatalystAnalysisValidationIssues(parsed);
    throw new SmartAnalysisError(
      "schema_error",
      "The model response did not match the Catalyst Map data model.",
      undefined,
      issues.join(","),
    );
  }

  return { analysis: normalizeAnalysis(parsed), mode: "smart" };
};

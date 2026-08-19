import { NextResponse } from "next/server";

import { MAX_EVENT_LENGTH } from "../../../lib/analysisLimits";
import {
  SmartAnalysisError,
  SmartAnalysisErrorType,
  analyzeCatalyst,
} from "../../../lib/smartAnalysis";

export const runtime = "nodejs";

type SafeAnalysisError = {
  error: {
    type: SmartAnalysisErrorType;
    message: string;
    fallbackUsed: boolean;
  };
};

const safeMessages: Record<SmartAnalysisErrorType, string> = {
  missing_key:
    "Smart Mode is not configured. Add GROQ_API_KEY to .env.local and restart the dev server.",
  provider_error:
    "Groq provider returned an error. Check the server console and API key.",
  invalid_json: "The model returned invalid JSON. Try again.",
  schema_error: "The model returned an invalid structure. Try again.",
};

export async function POST(request: Request) {
  const apiKeyPresent = Boolean(process.env.GROQ_API_KEY?.trim());
  const providerIsSet = Boolean(process.env.LLM_PROVIDER?.trim());
  const provider = process.env.LLM_PROVIDER?.trim().toLowerCase() || "groq";

  console.info(`[Catalyst Map] GROQ_API_KEY present: ${apiKeyPresent}`);
  console.info(`[Catalyst Map] LLM_PROVIDER set: ${providerIsSet}`);
  console.info(`[Catalyst Map] LLM_PROVIDER: ${providerIsSet ? provider : "not set"}`);
  console.info(`[Catalyst Map] Using provider: ${provider}`);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const event =
    body && typeof body === "object" && "event" in body
      ? (body as { event?: unknown }).event
      : null;

  if (typeof event !== "string" || !event.trim()) {
    return NextResponse.json(
      { error: "Event must be a non-empty string." },
      { status: 400 },
    );
  }

  if (event.trim().length > MAX_EVENT_LENGTH) {
    return NextResponse.json(
      { error: `Event must be ${MAX_EVENT_LENGTH.toLocaleString()} characters or fewer.` },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeCatalyst(event.trim());
    return NextResponse.json(result.analysis, {
      headers: {
        "X-Catalyst-Mode": result.mode,
        ...(result.mode === "mock"
          ? { "X-Catalyst-Fallback": "missing_key" }
          : {}),
      },
    });
  } catch (error) {
    const typedError =
      error instanceof SmartAnalysisError
        ? error
        : new SmartAnalysisError("provider_error", "Unexpected provider failure.");

    console.error(
      `[Catalyst Map] Analysis failed: type=${typedError.type}, provider=${provider}, status=${typedError.providerStatus ?? "unavailable"}, diagnostic=${typedError.diagnostic ?? "none"}`,
    );

    const response: SafeAnalysisError = {
      error: {
        type: typedError.type,
        message: safeMessages[typedError.type],
        fallbackUsed: false,
      },
    };

    return NextResponse.json(response, { status: 502 });
  }
}

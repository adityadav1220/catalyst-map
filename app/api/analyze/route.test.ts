import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const originalApiKey = process.env.GROQ_API_KEY;
const originalProvider = process.env.LLM_PROVIDER;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalApiKey;
  if (originalProvider === undefined) delete process.env.LLM_PROVIDER;
  else process.env.LLM_PROVIDER = originalProvider;
});

describe("POST /api/analyze", () => {
  it("returns a valid mock analysis when no API key is configured", async () => {
    delete process.env.GROQ_API_KEY;
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "Government is building a new dam on river Ganga" }),
      }),
    );
    const analysis = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Catalyst-Mode")).toBe("mock");
    expect(response.headers.get("X-Catalyst-Fallback")).toBe("missing_key");
    expect(analysis.mapNodes).toHaveLength(7);
    expect(analysis.exposureGroups.length).toBeGreaterThanOrEqual(3);
  });

  it("returns a typed safe provider error without exposing provider details", async () => {
    process.env.GROQ_API_KEY = "test-key-never-logged";
    process.env.LLM_PROVIDER = "groq";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("unauthorized", { status: 401 })),
    );

    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "A new infrastructure catalyst" }),
      }),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: {
        type: "provider_error",
        message: "Groq provider returned an error. Check the server console and API key.",
        fallbackUsed: false,
      },
    });
  });

  it("rejects an empty catalyst", async () => {
    delete process.env.GROQ_API_KEY;
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "  " }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects catalysts that exceed the input limit", async () => {
    delete process.env.GROQ_API_KEY;
    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "x".repeat(1201) }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Event must be 1,200 characters or fewer.",
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { generateMockAnalysis } from "./mockAnalysis";
import { analyzeCatalyst } from "./smartAnalysis";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analyzeCatalyst", () => {
  it("uses Groq chat completions and accepts a valid contract", async () => {
    const validAnalysis = generateMockAnalysis("A new dam is built on the river Ganga");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: JSON.stringify(validAnalysis) } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyzeCatalyst("A new dam is built", "test-key", "groq");
    const [url, request] = fetchMock.mock.calls[0];
    const body = JSON.parse((request as RequestInit).body as string);

    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(body.model).toBe("llama-3.1-8b-instant");
    expect(body.max_completion_tokens).toBe(4096);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(result.mode).toBe("smart");
    expect(result.analysis.mapNodes).toHaveLength(7);
  });

  it("rejects malformed provider JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "not-json" } }] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(analyzeCatalyst("A catalyst", "test-key", "groq")).rejects.toThrow(
      "could not be parsed as JSON",
    );
  });

  it("rejects JSON that does not match the Catalyst Map contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "{}" } }] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(analyzeCatalyst("A catalyst", "test-key", "groq")).rejects.toThrow(
      "did not match the Catalyst Map data model",
    );
  });
});

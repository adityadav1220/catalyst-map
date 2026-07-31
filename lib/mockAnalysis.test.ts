import { describe, expect, it } from "vitest";

import { detectScenario, generateMockAnalysis } from "./mockAnalysis";
import type { CatalystScenario } from "./mockAnalysis";

type ScenarioCase = {
  event: string;
  expected: CatalystScenario;
};

const scenarioCases: ScenarioCase[] = [
  {
    event: "India is expanding semiconductor manufacturing and new chip fabs",
    expected: "semiconductor",
  },
  {
    event: "Delhi plans to make all public transport electric by 2030",
    expected: "ev",
  },
  {
    event: "A major GLP-1 weight loss drug loses patent protection",
    expected: "pharma",
  },
  {
    event: "Ozempic patent expiry may make semaglutide cheaper",
    expected: "pharma",
  },
  {
    event: "A solar panel manufacturing patent expires in 2028",
    expected: "generic",
  },
  {
    event: "A new AI regulation changes enterprise software spending",
    expected: "generic",
  },
  {
    event: "SEMICONDUCTOR export controls reshape supply chains",
    expected: "semiconductor",
  },
  {
    event: "New ev charging grants roll out nationwide",
    expected: "ev",
  },
  {
    event: "A glp-1 medicine receives expanded prescription coverage",
    expected: "pharma",
  },
  {
    event: "A generic medicine enters the market after a patent expires",
    expected: "pharma",
  },
];

describe("detectScenario", () => {
  it.each(scenarioCases)("classifies '$event' as $expected", ({ event, expected }) => {
    expect(detectScenario(event)).toBe(expected);
  });
});

describe("generateMockAnalysis", () => {
  it.each([
    ["semiconductor", "New semiconductor fabs receive funding"],
    ["ev", "A city electrifies its public transport fleet"],
    ["pharma", "A GLP-1 drug patent expires"],
  ] as const)("returns a complete %s exposure map", (_, event) => {
    const analysis = generateMockAnalysis(event);

    expect(analysis.topExposureMap.length).toBeGreaterThanOrEqual(5);
    expect(analysis.topExposureMap.length).toBeLessThanOrEqual(7);
    expect(analysis.impactChain).toHaveLength(5);
    expect(analysis.researchChecklist.length).toBeLessThanOrEqual(5);

    for (const row of analysis.topExposureMap) {
      expect(row.exampleTicker).toBeTruthy();
      expect(row.connection).toBeTruthy();
      expect(row.keyRisk).toBeTruthy();
      expect(["High", "Medium", "Low"]).toContain(row.confidence);
    }
  });

  it("uses only low-confidence category examples for the generic fallback", () => {
    const analysis = generateMockAnalysis(
      "A new regulation changes how an emerging industry operates",
    );

    expect(analysis.topExposureMap).toHaveLength(5);
    expect(analysis.topExposureMap.every((row) => row.exampleTicker === null)).toBe(true);
    expect(analysis.topExposureMap.every((row) => row.confidence === "Low")).toBe(true);
    expect(analysis.catalystSummary).toContain("category-level examples");
  });

  it("keeps every research checklist at five actions or fewer", () => {
    const events = [
      "A semiconductor capacity expansion",
      "An EV charging mandate",
      "A GLP-1 patent expiry",
      "An unclassified market catalyst",
    ];

    for (const event of events) {
      expect(generateMockAnalysis(event).researchChecklist.length).toBeLessThanOrEqual(5);
    }
  });

  it("turns a punctuated input into a natural catalyst summary", () => {
    const analysis = generateMockAnalysis("India is expanding semiconductor fabs.");

    expect(analysis.catalystSummary).not.toContain(". may");
    expect(analysis.catalystSummary).not.toContain(".. ");
    expect(analysis.catalystSummary).toContain("illustrative global exposure proxies");
    expect(analysis.catalystSummary).toContain("not presumed local winners");
  });
});

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
    ["generic", "A new regulation changes an emerging industry"],
  ] as const)("returns an interactive %s map", (scenario, event) => {
    const analysis = generateMockAnalysis(event);

    expect(analysis.scenario).toBe(scenario);
    expect(analysis.theme.name).toBeTruthy();
    expect(analysis.thesis).toBeTruthy();
    expect(analysis.mapNodes).toHaveLength(7);
    expect(analysis.mapNodes.every((node) => node.detail && node.verifyNext.length)).toBe(true);
    expect(analysis.researchChecklist.length).toBeLessThanOrEqual(5);
  });

  it("includes a Public Companies node for semiconductor research", () => {
    const analysis = generateMockAnalysis("India funds new semiconductor fabs");
    const companiesNode = analysis.mapNodes.find((node) => node.id === "public-companies");

    expect(companiesNode?.label).toBe("Public Companies");
    expect(companiesNode?.relatedCompanies).toContain(
      "Taiwan Semiconductor Manufacturing (TSM)",
    );
    expect(analysis.exposureGroups.length).toBeGreaterThanOrEqual(5);
  });

  it("returns grouped EV exposures", () => {
    const analysis = generateMockAnalysis("A city expands EV charging and electric buses");

    expect(analysis.scenario).toBe("ev");
    expect(analysis.exposureGroups.map((group) => group.id)).toEqual([
      "regional",
      "global-proxies",
      "infrastructure",
      "losers",
      "second-order",
    ]);
    expect(analysis.exposureGroups.every((group) => group.companies.length > 0)).toBe(true);
  });

  it("adds a clearly labeled India-aware group for a Delhi EV catalyst", () => {
    const analysis = generateMockAnalysis(
      "Delhi plans to make all public transport electric by 2030",
    );
    const regionalGroup = analysis.exposureGroups.find((group) => group.id === "regional");

    expect(regionalGroup?.title).toBe("Illustrative India/region-aware examples");
    expect(regionalGroup?.explanation).toContain(
      "Verify current listings, filings, and revenue exposure",
    );
    expect(regionalGroup?.companies.map((company) => company.exampleTicker)).toContain(
      "TATAMOTORS.NS",
    );
  });

  it("separates global proxies for an India semiconductor catalyst", () => {
    const analysis = generateMockAnalysis("India funds new semiconductor fabs");
    const globalGroup = analysis.exposureGroups.find(
      (group) => group.id === "global-proxies",
    );

    expect(globalGroup?.title).toBe("Global equipment, material & EDA proxies");
    expect(globalGroup?.companies.map((company) => company.exampleTicker)).toEqual([
      "AMAT",
      "ENTG",
      "SNPS",
    ]);
  });

  it("uses only low-confidence category examples for the generic fallback", () => {
    const analysis = generateMockAnalysis(
      "A new regulation changes how an emerging industry operates",
    );

    const genericCompanies = analysis.exposureGroups.flatMap((group) => group.companies);

    expect(analysis.exposureGroups).toHaveLength(5);
    expect(genericCompanies).toHaveLength(5);
    expect(genericCompanies.every((row) => row.exampleTicker === null)).toBe(true);
    expect(genericCompanies.every((row) => row.confidence === "Low")).toBe(true);
    expect(
      analysis.mapNodes.flatMap((node) => node.relatedCompanies).every(
        (company) => !/\([A-Z]{1,5}\)/.test(company),
      ),
    ).toBe(true);
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

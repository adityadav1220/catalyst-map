import { describe, expect, it } from "vitest";

import { detectScenario } from "./mockAnalysis";
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

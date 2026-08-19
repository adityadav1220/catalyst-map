import type { CatalystAnalysis, CatalystScenario } from "./mockAnalysis";

const confidenceSchema = { type: "string", enum: ["High", "Medium", "Low"] } as const;
const stringArray = (maxItems: number) => ({
  type: "array",
  items: { type: "string" },
  minItems: 1,
  maxItems,
});

const exposureCompanySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    company: { type: "string" },
    exampleTicker: { anyOf: [{ type: "string" }, { type: "null" }] },
    category: { type: "string" },
    exposureType: {
      type: "string",
      enum: ["Direct", "Supplier", "Infrastructure", "Customer", "Negative", "Speculative"],
    },
    connection: { type: "string" },
    confidence: confidenceSchema,
    keyRisk: { type: "string" },
  },
  required: [
    "company",
    "exampleTicker",
    "category",
    "exposureType",
    "connection",
    "confidence",
    "keyRisk",
  ],
} as const;

export const catalystAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    scenario: { type: "string", enum: ["semiconductor", "ev", "pharma", "generic"] },
    theme: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        eyebrow: { type: "string" },
        canvasClass: { type: "string" },
        centerClass: { type: "string" },
        activeNodeClass: { type: "string" },
        accentClass: { type: "string" },
        glowClass: { type: "string" },
      },
      required: [
        "name",
        "eyebrow",
        "canvasClass",
        "centerClass",
        "activeNodeClass",
        "accentClass",
        "glowClass",
      ],
    },
    catalystSummary: { type: "string" },
    thesis: { type: "string" },
    mapNodes: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          type: {
            type: "string",
            enum: ["demand", "supply", "infrastructure", "companies", "risk", "second-order", "research"],
          },
          shortSummary: { type: "string" },
          detail: { type: "string" },
          relatedSectors: stringArray(7),
          relatedCompanies: { type: "array", items: { type: "string" }, maxItems: 10 },
          risks: stringArray(5),
          confidence: confidenceSchema,
          verifyNext: stringArray(5),
        },
        required: [
          "id",
          "label",
          "type",
          "shortSummary",
          "detail",
          "relatedSectors",
          "relatedCompanies",
          "risks",
          "confidence",
          "verifyNext",
        ],
      },
    },
    exposureGroups: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          explanation: { type: "string" },
          companies: {
            type: "array",
            items: exposureCompanySchema,
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ["id", "title", "explanation", "companies"],
      },
    },
    researchChecklist: stringArray(5),
  },
  required: [
    "scenario",
    "theme",
    "catalystSummary",
    "thesis",
    "mapNodes",
    "exposureGroups",
    "researchChecklist",
  ],
} as const;

const scenarios: CatalystScenario[] = ["semiconductor", "ev", "pharma", "generic"];

export const isCatalystAnalysis = (value: unknown): value is CatalystAnalysis => {
  return getCatalystAnalysisValidationIssues(value).length === 0;
};

export const getCatalystAnalysisValidationIssues = (value: unknown): string[] => {
  const issues: string[] = [];
  if (!value || typeof value !== "object") return ["root_not_object"];
  const analysis = value as Partial<CatalystAnalysis>;

  if (!scenarios.includes(analysis.scenario as CatalystScenario)) issues.push("scenario_invalid");
  if (typeof analysis.catalystSummary !== "string") issues.push("summary_missing");
  if (typeof analysis.thesis !== "string") issues.push("thesis_missing");
  if (!analysis.theme || typeof analysis.theme.name !== "string") issues.push("theme_invalid");

  if (!Array.isArray(analysis.mapNodes)) {
    issues.push("map_nodes_not_array");
  } else {
    if (analysis.mapNodes.length !== 7) issues.push(`map_nodes_count_${analysis.mapNodes.length}`);
    const nodeTypes = new Set(analysis.mapNodes.map((node) => node?.type));
    for (const type of [
      "demand",
      "supply",
      "infrastructure",
      "companies",
      "risk",
      "second-order",
      "research",
    ]) {
      if (!nodeTypes.has(type as never)) issues.push(`map_node_type_missing_${type}`);
    }
    if (
      analysis.mapNodes.some(
        (node) =>
          !node ||
          typeof node.id !== "string" ||
          typeof node.label !== "string" ||
          !Array.isArray(node.risks) ||
          !Array.isArray(node.verifyNext),
      )
    ) {
      issues.push("map_node_fields_invalid");
    }
  }

  if (!Array.isArray(analysis.exposureGroups)) {
    issues.push("exposure_groups_not_array");
  } else {
    if (analysis.exposureGroups.length < 3 || analysis.exposureGroups.length > 5) {
      issues.push(`exposure_groups_count_${analysis.exposureGroups.length}`);
    }
    if (
      analysis.exposureGroups.some(
        (group) => !group || !Array.isArray(group.companies) || group.companies.length === 0,
      )
    ) {
      issues.push("exposure_group_companies_invalid");
    }
  }

  if (!Array.isArray(analysis.researchChecklist)) {
    issues.push("research_checklist_not_array");
  } else if (
    analysis.researchChecklist.length === 0 ||
    analysis.researchChecklist.length > 5
  ) {
    issues.push(`research_checklist_count_${analysis.researchChecklist.length}`);
  }

  return issues;
};

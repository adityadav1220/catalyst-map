export type CatalystAnalysis = {
  eventSummary: string;
  impactChain: string[];
  affectedSectors: string[];
  potentialCompanyCategories: string[];
  possibleWinners: string[];
  possibleLosers: string[];
  keyRisksAndCounterarguments: string[];
  researchChecklist: string[];
};

const normalizeEvent = (eventText: string) =>
  eventText.trim().replace(/\s+/g, " ");

const inferTheme = (eventText: string) => {
  const lower = eventText.toLowerCase();

  if (/(drug|patent|pharma|clinical|fda|biotech|medicare)/.test(lower)) {
    return {
      sectors: ["Biopharma", "Generic drugs", "Pharmacy benefit managers", "Health insurers"],
      categories: ["Patent owners", "Generic manufacturers", "Specialty distributors", "Care delivery platforms"],
      winners: ["Low-cost generic producers with approved capacity", "Insurers able to negotiate lower reimbursement", "Distributors with strong specialty channels"],
      losers: ["Brand-name drug makers dependent on exclusivity", "Suppliers tied to high-margin branded volume", "Smaller firms without replacement pipelines"],
    };
  }

  if (/(tariff|policy|regulation|tax|subsidy|ban|mandate|election|law)/.test(lower)) {
    return {
      sectors: ["Industrial manufacturing", "Logistics", "Consumer goods", "Energy infrastructure"],
      categories: ["Domestic producers", "Import-heavy retailers", "Compliance software vendors", "Regional suppliers"],
      winners: ["Domestic firms with spare production capacity", "Compliance and reporting vendors", "Suppliers close to end demand"],
      losers: ["Import-dependent companies with weak pricing power", "Businesses exposed to higher input costs", "Exporters facing retaliatory rules"],
    };
  }

  if (/(ai|automation|semiconductor|chip|data center|cloud|software|robot)/.test(lower)) {
    return {
      sectors: ["Semiconductors", "Cloud infrastructure", "Enterprise software", "Power and cooling"],
      categories: ["Compute providers", "Model infrastructure vendors", "Automation software platforms", "Data center suppliers"],
      winners: ["Companies with scarce compute capacity", "Software vendors embedding automation into workflows", "Power equipment suppliers serving data centers"],
      losers: ["Labor-intensive service providers slow to automate", "Legacy software vendors with weak AI distribution", "Firms facing higher cloud spend without pricing power"],
    };
  }

  if (/(oil|gas|solar|wind|battery|ev|lithium|nuclear|energy|grid)/.test(lower)) {
    return {
      sectors: ["Power generation", "Utilities", "Battery supply chain", "Transportation"],
      categories: ["Equipment manufacturers", "Project developers", "Commodity suppliers", "Grid technology vendors"],
      winners: ["Companies with contracted project backlogs", "Suppliers tied to grid upgrades", "Operators with flexible generation assets"],
      losers: ["High-cost producers exposed to commodity swings", "Companies dependent on expiring subsidies", "Manufacturers with concentrated raw material exposure"],
    };
  }

  return {
    sectors: ["Technology", "Industrials", "Consumer markets", "Financial services"],
    categories: ["Incumbents with pricing power", "Specialized suppliers", "Distribution platforms", "Capital-intensive challengers"],
    winners: ["Companies that can turn the catalyst into higher demand", "Suppliers with scarce capabilities", "Platforms with direct customer access"],
    losers: ["Incumbents with slow execution cycles", "Companies exposed to rising costs", "Firms dependent on outdated business models"],
  };
};

export const generateMockAnalysis = (eventText: string): CatalystAnalysis => {
  const event = normalizeEvent(eventText);
  const theme = inferTheme(event);

  return {
    eventSummary: `${event} could create a measurable shift in demand, margins, regulation, or capital allocation. The first-pass research question is which businesses have direct exposure, which have second-order exposure, and which risks are already priced in.`,
    impactChain: [
      "Catalyst changes incentives, costs, demand, or regulatory constraints.",
      "Companies with direct exposure adjust pricing, capacity, sourcing, or product strategy.",
      "Suppliers, distributors, and substitutes feel second-order effects as the market adapts.",
      "Investor expectations reset around revenue durability, margin pressure, and execution risk.",
    ],
    affectedSectors: theme.sectors,
    potentialCompanyCategories: theme.categories,
    possibleWinners: theme.winners,
    possibleLosers: theme.losers,
    keyRisksAndCounterarguments: [
      "The catalyst may take longer to materialize than the market expects.",
      "Benefits could be competed away if too many firms chase the same opportunity.",
      "Policy, litigation, supply constraints, or consumer adoption could weaken the expected impact.",
      "Current valuations may already reflect the most obvious winners and losers.",
    ],
    researchChecklist: [
      "Identify the exact timeline, decision points, and probability of the catalyst.",
      "Map direct and indirect revenue exposure for each company category.",
      "Compare pricing power, cost structure, balance sheet strength, and execution history.",
      "Check management commentary, filings, customer concentration, and segment disclosures.",
      "Build a simple bull/base/bear scenario before considering any investment view.",
    ],
  };
};

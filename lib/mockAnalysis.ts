export type ExposureType =
  | "Direct"
  | "Supplier"
  | "Infrastructure"
  | "Customer"
  | "Negative"
  | "Speculative";

export type Confidence = "High" | "Medium" | "Low";

export type ExposureRow = {
  company: string;
  exampleTicker: string | null;
  category: string;
  exposureType: ExposureType;
  connection: string;
  confidence: Confidence;
  keyRisk: string;
};

export type CatalystAnalysis = {
  catalystSummary: string;
  topExposureMap: ExposureRow[];
  impactChain: [string, string, string, string, string];
  secondOrderEffects: string[];
  researchChecklist: string[];
};

export type CatalystScenario = "semiconductor" | "ev" | "pharma" | "generic";

type ScenarioTemplate = Omit<CatalystAnalysis, "catalystSummary"> & {
  catalystSummary: (event: string) => string;
};

const normalizeEvent = (eventText: string) => eventText.trim().replace(/\s+/g, " ");

const eventSentence = (event: string) => `${event.replace(/[.!?]+$/, "")}.`;

const semiconductorPattern =
  /\b(semiconductor|semiconductors|chip|chips|fab|fabs|wafer|wafers|foundry|foundries)\b/;
const evPattern =
  /\b(electric vehicle|electric vehicles|ev|evs|battery|batteries|charging|charger|chargers|electrify|electrifies|electrified|electrification)\b|public transport electric/;
const explicitPharmaPattern =
  /\b(ozempic|semaglutide|wegovy|glp[-\s]?1|diabetes drugs?|weight[-\s]loss drugs?)\b/;
const patentOrGenericPattern = /\b(patent|patents|patented|generic|generics)\b/;
const pharmaContextPattern =
  /\b(drug|drugs|medicine|medicines|pharmaceutical|pharmaceuticals|therapy|therapies|prescription|prescriptions|biopharma)\b/;

export const detectScenario = (eventText: string): CatalystScenario => {
  const lower = eventText.toLowerCase();

  if (semiconductorPattern.test(lower)) return "semiconductor";
  if (evPattern.test(lower)) return "ev";

  const explicitPharma = explicitPharmaPattern.test(lower);
  const patentInPharma =
    patentOrGenericPattern.test(lower) && pharmaContextPattern.test(lower);

  return explicitPharma || patentInPharma ? "pharma" : "generic";
};

const scenarioTemplates: Record<CatalystScenario, ScenarioTemplate> = {
  semiconductor: {
    catalystSummary: (event) =>
      `${eventSentence(event)} This catalyst may change semiconductor capacity, utilization, and capital spending. The companies below are illustrative global exposure proxies across foundries, tools, materials, software, packaging, and infrastructure—not presumed local winners in the event's country or region.`,
    topExposureMap: [
      {
        company: "Taiwan Semiconductor Manufacturing",
        exampleTicker: "TSM",
        category: "Foundry",
        exposureType: "Direct",
        connection: "Foundry utilization, node mix, and customer allocation can move directly with shifts in chip demand or manufacturing policy.",
        confidence: "High",
        keyRisk: "The event may target different nodes or geographies than TSM's most profitable capacity.",
      },
      {
        company: "Applied Materials",
        exampleTicker: "AMAT",
        category: "Semiconductor equipment",
        exposureType: "Supplier",
        connection: "New fabs and process upgrades require deposition, etch, inspection, and other production tools.",
        confidence: "High",
        keyRisk: "Fab delays, export controls, or lower capex can push orders out.",
      },
      {
        company: "Entegris",
        exampleTicker: "ENTG",
        category: "Specialty materials",
        exposureType: "Supplier",
        connection: "Advanced production depends on qualified process chemicals, filtration, and contamination-control materials.",
        confidence: "Medium",
        keyRisk: "Qualification cycles are long and the catalyst may not affect its specific content per wafer.",
      },
      {
        company: "Synopsys",
        exampleTicker: "SNPS",
        category: "EDA software",
        exposureType: "Supplier",
        connection: "More chip designs and node transitions can increase demand for electronic design automation and verification tools.",
        confidence: "Medium",
        keyRisk: "Design activity may not translate into near-term license growth.",
      },
      {
        company: "Amkor Technology",
        exampleTicker: "AMKR",
        category: "OSAT / advanced packaging",
        exposureType: "Supplier",
        connection: "Higher chip volumes and chiplet architectures increase assembly, test, and advanced-packaging requirements.",
        confidence: "Medium",
        keyRisk: "Customers may keep the highest-value packaging in-house.",
      },
      {
        company: "Quanta Services",
        exampleTicker: "PWR",
        category: "Power / construction infrastructure",
        exposureType: "Infrastructure",
        connection: "Fab clusters require major power, water, utility, and construction work before production can ramp.",
        confidence: "Low",
        keyRisk: "Only a small or undisclosed share of revenue may be tied to semiconductor projects.",
      },
    ],
    impactChain: [
      "Chip policy, demand, or capacity event",
      "Wafer demand and fab investment shift",
      "Tool, material, software, packaging, power, and water orders change",
      "Foundries and qualified suppliers gain or lose revenue exposure",
      "Which node, geography, project timing, and revenue share actually matter?",
    ],
    secondOrderEffects: [
      "Local grid, water-treatment, engineering, and construction backlogs may rise around funded fab sites.",
      "Export controls can reroute tool and material orders rather than simply increase total demand.",
      "Added capacity may eventually pressure older-node pricing if end demand does not keep pace.",
      "Advanced-packaging bottlenecks can limit finished-chip supply even after wafer capacity expands.",
    ],
    researchChecklist: [
      "Identify the affected chip type, process node, geography, and implementation date.",
      "Verify company revenue by customer, region, and semiconductor process step in current filings.",
      "Compare announced fab capex with permits, funding, tool orders, and realistic ramp dates.",
      "Check backlog, utilization, inventory days, and management guidance for confirmation.",
      "Test whether export controls, valuation, or future oversupply break the thesis.",
    ],
  },
  ev: {
    catalystSummary: (event) =>
      `${eventSentence(event)} This catalyst may change vehicle and fleet purchasing, battery demand, charging deployment, and grid investment. The investable effect depends on policy timing, vehicle economics, infrastructure readiness, and which companies capture the incremental spending.`,
    topExposureMap: [
      {
        company: "Tesla",
        exampleTicker: "TSLA",
        category: "EV manufacturer",
        exposureType: "Direct",
        connection: "EV adoption changes can affect vehicle volumes, pricing, and factory utilization.",
        confidence: "High",
        keyRisk: "Competition and price cuts may absorb volume benefits.",
      },
      {
        company: "Panasonic Holdings",
        exampleTicker: "PCRFY",
        category: "Battery cells / packs",
        exposureType: "Supplier",
        connection: "Higher electric-vehicle production increases demand for qualified automotive battery cells.",
        confidence: "Medium",
        keyRisk: "Customer concentration and battery price compression can limit earnings upside.",
      },
      {
        company: "ChargePoint",
        exampleTicker: "CHPT",
        category: "Charging infrastructure",
        exposureType: "Infrastructure",
        connection: "More electric fleets and vehicles require depot, workplace, and public charging hardware and software.",
        confidence: "Medium",
        keyRisk: "Low utilization, cash burn, and slow site deployment can outweigh demand growth.",
      },
      {
        company: "Eaton",
        exampleTicker: "ETN",
        category: "Grid / power equipment",
        exposureType: "Infrastructure",
        connection: "Depot charging and higher electric load require switchgear, power distribution, and grid upgrades.",
        confidence: "Medium",
        keyRisk: "EV-related demand may be immaterial relative to broader end markets.",
      },
      {
        company: "Albemarle",
        exampleTicker: "ALB",
        category: "Lithium / materials",
        exposureType: "Supplier",
        connection: "Battery production is a major source of lithium demand, linking adoption to material volumes.",
        confidence: "Medium",
        keyRisk: "New supply and volatile lithium prices can overwhelm volume growth.",
      },
      {
        company: "Cummins",
        exampleTicker: "CMI",
        category: "Public transport / fleet supplier",
        exposureType: "Speculative",
        connection: "Fleet electrification can shift spending toward electric powertrains, buses, and supporting systems.",
        confidence: "Low",
        keyRisk: "Legacy engine exposure may offset growth in newer electric offerings.",
      },
      {
        company: "Marathon Petroleum",
        exampleTicker: "MPC",
        category: "Fuel distribution",
        exposureType: "Negative",
        connection: "Long-run fleet electrification can reduce road-fuel demand in affected markets.",
        confidence: "Low",
        keyRisk: "The transition may be too slow or local to affect consolidated fuel volumes.",
      },
    ],
    impactChain: [
      "Electrification policy, incentive, or fleet commitment",
      "EV and electric-bus purchases increase",
      "Battery, charger, lithium, and grid-equipment demand shifts",
      "Vehicle makers and infrastructure suppliers gain while ICE-linked demand faces pressure",
      "Are funding, charging capacity, unit economics, and delivery schedules credible?",
    ],
    secondOrderEffects: [
      "Depot charging may pull transformer and switchgear orders forward years before full fleet delivery.",
      "High fleet utilization can improve charging economics faster than dispersed consumer adoption.",
      "Battery recycling and second-life storage volumes rise only after a meaningful installed base ages.",
      "Fuel retailers and ICE-heavy parts suppliers may see gradual, geography-specific pressure rather than an immediate decline.",
    ],
    researchChecklist: [
      "Confirm whether the event covers passenger cars, buses, commercial fleets, or all three.",
      "Verify funding, mandate dates, procurement awards, and vehicle delivery capacity.",
      "Check battery contracts, charger utilization, grid interconnection queues, and site economics.",
      "Quantify each company's revenue exposure to the relevant geography and vehicle segment.",
      "Stress-test subsidy changes, lithium prices, financing costs, and slower adoption.",
    ],
  },
  pharma: {
    catalystSummary: (event) =>
      `${eventSentence(event)} This catalyst may redistribute GLP-1 economics among patent owners, potential generic entrants, distributors, patient-access platforms, and specialized suppliers. Patent scope, regulatory approval, injectable manufacturing, and payer behavior determine when headline risk becomes financial impact.`,
    topExposureMap: [
      {
        company: "Novo Nordisk",
        exampleTicker: "NVO",
        category: "Originator pharma",
        exposureType: "Direct",
        connection: "GLP-1 exclusivity and pricing directly affect franchise revenue, lifecycle strategy, and capacity returns.",
        confidence: "High",
        keyRisk: "Different drug, formulation, and device patents may expire on different timelines.",
      },
      {
        company: "Teva Pharmaceutical",
        exampleTicker: "TEVA",
        category: "Generic manufacturer",
        exposureType: "Speculative",
        connection: "Generic competition could create a new opportunity for manufacturers with complex injectable capabilities.",
        confidence: "Low",
        keyRisk: "No specific filing or approval is implied; peptide manufacturing and litigation are major barriers.",
      },
      {
        company: "McKesson",
        exampleTicker: "MCK",
        category: "Drug distributor",
        exposureType: "Customer",
        connection: "Lower prices could expand prescription volume moving through wholesale and specialty distribution.",
        confidence: "Medium",
        keyRisk: "Fee economics and working-capital effects may not improve with volume.",
      },
      {
        company: "Hims & Hers Health",
        exampleTicker: "HIMS",
        category: "Telehealth / pharmacy platform",
        exposureType: "Customer",
        connection: "Broader affordability could expand demand for digital prescribing and pharmacy access channels.",
        confidence: "Low",
        keyRisk: "Regulation, sourcing rules, and platform access to approved supply can change quickly.",
      },
      {
        company: "West Pharmaceutical Services",
        exampleTicker: "WST",
        category: "Injection device / packaging supplier",
        exposureType: "Supplier",
        connection: "Higher injectable volumes can increase demand for containment and delivery components.",
        confidence: "Low",
        keyRisk: "The company may have limited disclosed content in the specific products affected.",
      },
      {
        company: "Eli Lilly",
        exampleTicker: "LLY",
        category: "Originator exposed to pricing pressure",
        exposureType: "Negative",
        connection: "Generic or lower-priced GLP-1 competition could pressure class pricing and payer negotiations.",
        confidence: "Medium",
        keyRisk: "Next-generation drugs, new indications, or differentiated outcomes may preserve pricing power.",
      },
    ],
    impactChain: [
      "GLP-1 patent or exclusivity event",
      "Expected drug price falls and addressable patient demand expands",
      "Generic capacity, injectors, cold chain, distribution, and access channels adjust",
      "Originator margins face pressure while qualified entrants and volume channels may benefit",
      "Which patents expire, who can win approval, and how quickly will payers change access?",
    ],
    secondOrderEffects: [
      "Lower net prices may expand total prescriptions enough to benefit distributors despite reduced value per dose.",
      "Peptide synthesis, sterile fill-finish, injector components, and cold chain can delay effective competition.",
      "Payers may tighten or broaden access depending on budget impact rather than list price alone.",
      "Greater treatment access could slowly affect diabetes devices, procedures, and weight-management services.",
    ],
    researchChecklist: [
      "Verify the exact molecule, jurisdiction, composition, formulation, and device patent dates.",
      "Check litigation, settlements, regulatory filings, and approved manufacturing capacity.",
      "Separate list-price pressure from net price, volume growth, rebates, and payer access.",
      "Quantify franchise exposure and replacement-pipeline strength in current company filings.",
      "Model delayed entry, limited supply, rapid entry, and originator lifecycle extensions.",
    ],
  },
  generic: {
    catalystSummary: (event) =>
      `${eventSentence(event)} This catalyst could shift demand, costs, regulation, or capital allocation, but this demo does not have enough scenario-specific evidence to name public companies responsibly. The map below uses category-level examples and treats every connection as a low-confidence research lead.`,
    topExposureMap: [
      {
        company: "Directly affected incumbent (category only)",
        exampleTicker: null,
        category: "Primary operator",
        exposureType: "Direct",
        connection: "Revenue, pricing, or operating constraints may change first for businesses named by the catalyst.",
        confidence: "Low",
        keyRisk: "The event may not be material to any individual public company.",
      },
      {
        company: "Specialized input provider (category only)",
        exampleTicker: null,
        category: "Upstream supplier",
        exposureType: "Supplier",
        connection: "A demand or capacity change may flow upstream into scarce inputs or services.",
        confidence: "Low",
        keyRisk: "Supplier revenue exposure is unknown and may be diversified away.",
      },
      {
        company: "Enabling infrastructure provider (category only)",
        exampleTicker: null,
        category: "Infrastructure",
        exposureType: "Infrastructure",
        connection: "Implementation may require new physical, digital, logistics, or compliance infrastructure.",
        confidence: "Low",
        keyRisk: "Spending may be delayed, internalized, or awarded to private firms.",
      },
      {
        company: "Customer or distributor (category only)",
        exampleTicker: null,
        category: "Downstream channel",
        exposureType: "Customer",
        connection: "Customers and channels may benefit from lower costs or face changed availability.",
        confidence: "Low",
        keyRisk: "They may lack pricing power or switch to substitutes.",
      },
      {
        company: "Displaced incumbent (category only)",
        exampleTicker: null,
        category: "Potential loser",
        exposureType: "Negative",
        connection: "A substitute, regulation, or new capacity may pressure an older business model.",
        confidence: "Low",
        keyRisk: "The incumbent may adapt faster than expected.",
      },
    ],
    impactChain: [
      "Unclassified market or policy event",
      "Demand, cost, or incentives may shift",
      "Suppliers, infrastructure, and distribution may respond",
      "Direct operators and potential substitutes could gain or lose exposure",
      "What filings, market data, and implementation milestones would prove the link?",
    ],
    secondOrderEffects: [
      "The first measurable signal may appear in supplier orders or customer budgets before incumbent revenue.",
      "Financing, permitting, regulation, or labor availability may determine which category captures value.",
      "A substitute could benefit even if the catalyst's obvious direct beneficiary does not.",
    ],
    researchChecklist: [
      "Define the event date, geography, mechanism, and measurable implementation milestones.",
      "Use filings to identify public companies with disclosed revenue or cost exposure.",
      "Map suppliers, customers, substitutes, and likely losers before assigning tickers.",
      "Check current market data and management commentary for confirming evidence.",
      "Reject the idea if exposure cannot be quantified or is already fully priced in.",
    ],
  },
};

export const generateMockAnalysis = (eventText: string): CatalystAnalysis => {
  const event = normalizeEvent(eventText);
  const template = scenarioTemplates[detectScenario(event)];

  return {
    ...template,
    catalystSummary: template.catalystSummary(event),
  };
};

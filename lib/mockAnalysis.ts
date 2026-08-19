export type ExposureType =
  | "Direct"
  | "Supplier"
  | "Infrastructure"
  | "Customer"
  | "Negative"
  | "Speculative";

export type Confidence = "High" | "Medium" | "Low";

export type ExposureCompany = {
  company: string;
  exampleTicker: string | null;
  category: string;
  exposureType: ExposureType;
  connection: string;
  confidence: Confidence;
  keyRisk: string;
};

export type ExposureGroup = {
  id: string;
  title: string;
  explanation: string;
  companies: ExposureCompany[];
};

export type CatalystScenario = "semiconductor" | "ev" | "pharma" | "generic";

export type CatalystTheme = {
  name: string;
  eyebrow: string;
  canvasClass: string;
  centerClass: string;
  activeNodeClass: string;
  accentClass: string;
  glowClass: string;
};

export type MapNodeType =
  | "demand"
  | "supply"
  | "infrastructure"
  | "companies"
  | "risk"
  | "second-order"
  | "research";

export type MapNode = {
  id: string;
  label: string;
  type: MapNodeType;
  shortSummary: string;
  detail: string;
  relatedSectors: string[];
  relatedCompanies: string[];
  risks: string[];
  confidence: Confidence;
  verifyNext: string[];
};

export type CatalystAnalysis = {
  scenario: CatalystScenario;
  theme: CatalystTheme;
  catalystSummary: string;
  thesis: string;
  mapNodes: MapNode[];
  exposureGroups: ExposureGroup[];
  researchChecklist: string[];
};

type ScenarioContent = {
  catalystSummary: (event: string) => string;
  topExposureMap: ExposureCompany[];
  impactChain: [string, string, string, string, string];
  secondOrderEffects: string[];
  researchChecklist: string[];
};

type ScenarioTemplate = ScenarioContent;

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

const scenarioThemes: Record<CatalystScenario, CatalystTheme> = {
  semiconductor: {
    name: "Chip & fabrication",
    eyebrow: "Semiconductor system map",
    canvasClass: "border-indigo-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900",
    centerClass: "border-cyan-300/60 bg-indigo-950 text-white shadow-cyan-950/60",
    activeNodeClass: "border-cyan-400 bg-cyan-50 text-cyan-950 ring-cyan-300",
    accentClass: "bg-cyan-500 text-white hover:bg-cyan-400",
    glowClass: "bg-cyan-400/20",
  },
  ev: {
    name: "Energy & grid",
    eyebrow: "Electrification system map",
    canvasClass: "border-emerald-200 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900",
    centerClass: "border-lime-300/60 bg-emerald-950 text-white shadow-emerald-950/60",
    activeNodeClass: "border-emerald-400 bg-emerald-50 text-emerald-950 ring-emerald-300",
    accentClass: "bg-emerald-600 text-white hover:bg-emerald-500",
    glowClass: "bg-lime-400/20",
  },
  pharma: {
    name: "Health & pharma",
    eyebrow: "Pharma value-chain map",
    canvasClass: "border-sky-200 bg-gradient-to-br from-sky-950 via-blue-950 to-slate-900",
    centerClass: "border-sky-300/60 bg-blue-950 text-white shadow-blue-950/60",
    activeNodeClass: "border-sky-400 bg-sky-50 text-sky-950 ring-sky-300",
    accentClass: "bg-sky-600 text-white hover:bg-sky-500",
    glowClass: "bg-sky-400/20",
  },
  generic: {
    name: "Neutral research",
    eyebrow: "Exploratory research map",
    canvasClass: "border-slate-300 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900",
    centerClass: "border-slate-300/60 bg-slate-900 text-white shadow-slate-950/60",
    activeNodeClass: "border-slate-500 bg-slate-100 text-slate-950 ring-slate-300",
    accentClass: "bg-slate-700 text-white hover:bg-slate-600",
    glowClass: "bg-slate-300/20",
  },
};

export const getScenarioTheme = (scenario: CatalystScenario): CatalystTheme => ({
  ...scenarioThemes[scenario],
});

type ScenarioProfile = {
  thesis: string;
  sectors: [string[], string[], string[]];
  demandDetail: string;
  supplyDetail: string;
  infrastructureDetail: string;
};

const scenarioProfiles: Record<CatalystScenario, ScenarioProfile> = {
  semiconductor: {
    thesis: "The catalyst matters if it changes fab utilization or funded capacity—and that change reaches qualified tool, material, software, packaging, and utility suppliers.",
    sectors: [
      ["Foundries", "Fabless semiconductors", "Electronics end markets"],
      ["Semiconductor equipment", "Specialty materials", "EDA", "Advanced packaging"],
      ["Power equipment", "Water systems", "Industrial construction"],
    ],
    demandDetail: "The first question is whether the event changes real wafer demand, node mix, or geographic sourcing rather than merely announcing future capacity.",
    supplyDetail: "Fab spending flows through tightly qualified tools, chemicals, design software, substrates, assembly, and test—with different lead times and revenue recognition.",
    infrastructureDetail: "A fab cannot ramp without reliable power, ultra-pure water, construction labor, permits, and grid interconnection, creating exposure beyond semiconductor vendors.",
  },
  ev: {
    thesis: "The catalyst becomes investable when funded vehicle demand pulls through batteries, charging, and grid equipment faster than pricing pressure and infrastructure delays consume the upside.",
    sectors: [
      ["EV manufacturers", "Public transit", "Commercial fleets"],
      ["Battery cells", "Lithium and materials", "Charging hardware"],
      ["Grid equipment", "Utilities", "Depot infrastructure"],
    ],
    demandDetail: "Separate policy ambition from funded purchases: passenger vehicles, buses, and commercial fleets have different economics, timelines, and utilization patterns.",
    supplyDetail: "Incremental vehicles pull on battery cells, packs, lithium, power electronics, charging hardware, and eventually recycling capacity.",
    infrastructureDetail: "Depot and public charging require sites, interconnections, transformers, switchgear, software, and dependable utilization to produce returns.",
  },
  pharma: {
    thesis: "The value pool shifts only when patent scope, regulatory approval, and injectable capacity translate headline expiry into lower net prices and broader patient access.",
    sectors: [
      ["Originator pharma", "Generic manufacturers", "Metabolic health"],
      ["Injectable manufacturing", "Packaging devices", "Cold-chain logistics"],
      ["Drug distribution", "Specialty pharmacy", "Telehealth platforms"],
    ],
    demandDetail: "Lower net prices can expand the treated population, but payer rules, adherence, supply, and clinical differentiation determine the actual volume response.",
    supplyDetail: "Peptide production, sterile fill-finish, injection devices, cold chain, and regulatory approval make GLP-1 competition more complex than a simple tablet generic.",
    infrastructureDetail: "Distribution, specialty pharmacy, telehealth access, refrigeration, and injector availability determine whether increased manufacturing reaches patients.",
  },
  generic: {
    thesis: "Treat the catalyst as an unproven research lead until public filings and measurable milestones reveal which business categories have material exposure.",
    sectors: [
      ["Direct operators", "Customers", "Substitutes"],
      ["Specialized suppliers", "Distribution", "Services"],
      ["Physical infrastructure", "Digital infrastructure", "Compliance"],
    ],
    demandDetail: "Define the customer behavior, cost, incentive, or regulatory constraint that must change before assigning beneficiaries.",
    supplyDetail: "Trace scarce inputs, channels, and substitutes without assuming that a category-level connection maps to a listed company.",
    infrastructureDetail: "Test whether implementation requires meaningful physical, digital, logistics, or compliance spending and who is positioned to supply it.",
  },
};

const indiaPattern = /\b(india|indian|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai)\b/i;

const categoryExposure = (
  company: string,
  category: string,
  exposureType: ExposureType,
  connection: string,
  keyRisk: string,
): ExposureCompany => ({
  company,
  exampleTicker: null,
  category,
  exposureType,
  connection,
  confidence: "Low",
  keyRisk,
});

const indiaEvCompanies: ExposureCompany[] = [
  {
    company: "Tata Motors",
    exampleTicker: "TATAMOTORS.NS",
    category: "India EV and commercial vehicle manufacturer",
    exposureType: "Direct",
    connection: "Electric bus, fleet, and passenger-vehicle procurement can create local demand exposure across Tata's vehicle portfolio.",
    confidence: "Medium",
    keyRisk: "Delhi-specific awards and EV revenue materiality must be confirmed in current filings and procurement data.",
  },
  {
    company: "Olectra Greentech",
    exampleTicker: "OLECTRA.NS",
    category: "India electric bus manufacturer",
    exposureType: "Direct",
    connection: "Public-transport electrification can increase demand for locally supplied electric buses and related service contracts.",
    confidence: "Medium",
    keyRisk: "Tender timing, delivery execution, customer concentration, and working capital can dominate headline order value.",
  },
  {
    company: "Exide Industries",
    exampleTicker: "EXIDEIND.NS",
    category: "India battery ecosystem",
    exposureType: "Supplier",
    connection: "Domestic electrification can support battery-cell, pack, and energy-storage investment within India's broader battery ecosystem.",
    confidence: "Low",
    keyRisk: "Current revenue may remain concentrated in legacy batteries while newer capacity ramps slowly.",
  },
];

const indiaSemiconductorCompanies: ExposureCompany[] = [
  {
    company: "Kaynes Technology India",
    exampleTicker: "KAYNES.NS",
    category: "India electronics / semiconductor ecosystem",
    exposureType: "Speculative",
    connection: "Domestic semiconductor and electronics investment may create local assembly, packaging, and manufacturing opportunities.",
    confidence: "Low",
    keyRisk: "Project funding, commissioning, customer qualification, and semiconductor-specific revenue remain execution dependent.",
  },
  {
    company: "Tata Elxsi",
    exampleTicker: "TATAELXSI.NS",
    category: "India embedded design services",
    exposureType: "Speculative",
    connection: "A larger domestic chip ecosystem may increase demand for embedded engineering and semiconductor-adjacent design services.",
    confidence: "Low",
    keyRisk: "The connection is indirect and may be immaterial relative to automotive and media design revenue.",
  },
];

const buildExposureGroups = (
  scenario: CatalystScenario,
  template: ScenarioTemplate,
  event: string,
): ExposureGroup[] => {
  const companies = template.topExposureMap;
  const indiaAware = indiaPattern.test(event);

  if (scenario === "ev") {
    return [
      {
        id: "regional",
        title: indiaAware ? "Illustrative India/region-aware examples" : "Local / regional candidates",
        explanation: indiaAware
          ? "India-listed examples with potentially closer operating exposure to local vehicle, bus, battery, or fleet spending. Verify current listings, filings, and revenue exposure."
          : "Direct vehicle or fleet candidates whose relevance depends on the catalyst's actual geography.",
        companies: indiaAware ? indiaEvCompanies : [companies[0]],
      },
      {
        id: "global-proxies",
        title: "Global supply-chain proxies",
        explanation: "Illustrative global battery and material names that may capture supply-chain demand without being local recommendations.",
        companies: [companies[1], companies[4]],
      },
      {
        id: "infrastructure",
        title: "Infrastructure enablers",
        explanation: "Charging and power-equipment exposure that depends on funded sites, grid connections, and utilization.",
        companies: [companies[2], companies[3]],
      },
      {
        id: "losers",
        title: "Potential losers",
        explanation: "Businesses that could face gradual demand pressure if fleet electrification becomes material.",
        companies: [companies[6]],
      },
      {
        id: "second-order",
        title: "Speculative second-order plays",
        explanation: "Adjacent fleet and powertrain exposure where legacy operations can offset the electrification opportunity.",
        companies: [companies[5]],
      },
    ];
  }

  if (scenario === "semiconductor") {
    return [
      {
        id: "regional",
        title: indiaAware ? "India / local ecosystem candidates" : "Local / regional candidates",
        explanation: indiaAware
          ? "Illustrative India-listed ecosystem examples—not presumed fab winners. Verify project scope, current listings, filings, and semiconductor revenue exposure."
          : "Direct ecosystem candidates whose relevance must be matched to the event's node, customer base, and geography.",
        companies: indiaAware ? indiaSemiconductorCompanies : [companies[0]],
      },
      {
        id: "global-proxies",
        title: "Global equipment, material & EDA proxies",
        explanation: "Global suppliers that illustrate how fab investment can flow into tools, qualified materials, and chip-design software.",
        companies: [companies[1], companies[2], companies[3]],
      },
      {
        id: "infrastructure",
        title: "Infrastructure enablers",
        explanation: "Power, water, utility, and construction exposure required before new capacity can operate.",
        companies: [companies[5]],
      },
      {
        id: "losers",
        title: "Possible losers or risk exposures",
        explanation: "Category-level downside candidates if capacity arrives late, costs rise, or older nodes become oversupplied.",
        companies: [categoryExposure(
          "Import-dependent electronics manufacturers (category only)",
          "Downstream electronics",
          "Negative",
          "Component costs or allocation constraints may pressure manufacturers without pricing power.",
          "Local sourcing, inventory buffers, or falling chip prices may eliminate the expected downside.",
        )],
      },
      {
        id: "second-order",
        title: "Speculative second-order plays",
        explanation: "Foundry and advanced-packaging proxies whose benefit depends on actual customer wins and qualified production ramps.",
        companies: [companies[0], companies[4]],
      },
    ];
  }

  if (scenario === "pharma") {
    return [
      {
        id: "originators",
        title: "Originator pharma",
        explanation: "Patent owners and branded competitors with direct exposure to exclusivity, lifecycle strategy, and class pricing.",
        companies: [companies[0]],
      },
      {
        id: "generics",
        title: "Generic manufacturers",
        explanation: "Speculative entrants that still need product-specific filings, approvals, and complex injectable capacity.",
        companies: [companies[1]],
      },
      {
        id: "distribution",
        title: "Distributors & platforms",
        explanation: "Volume and patient-access channels that may benefit if lower prices expand treatment demand.",
        companies: [companies[2], companies[3]],
      },
      {
        id: "devices",
        title: "Device & packaging suppliers",
        explanation: "Containment, injection, and packaging exposure where product-specific content must be verified.",
        companies: [companies[4]],
      },
      {
        id: "losers",
        title: "Pricing-pressure losers",
        explanation: "Originators whose class pricing or payer negotiations could weaken as competition increases.",
        companies: [companies[5]],
      },
    ];
  }

  return [
    {
      id: "regional",
      title: "Local / regional candidates",
      explanation: "Category-level placeholders until geography-specific public exposure is verified.",
      companies: [companies[0]],
    },
    {
      id: "global-proxies",
      title: "Global supply-chain proxies",
      explanation: "No tickers are assigned because the catalyst lacks enough scenario-specific evidence.",
      companies: [companies[1]],
    },
    {
      id: "infrastructure",
      title: "Infrastructure enablers",
      explanation: "Physical, digital, logistics, or compliance categories that may enable implementation.",
      companies: [companies[2]],
    },
    {
      id: "losers",
      title: "Potential losers",
      explanation: "Category-level incumbents that could face displacement or margin pressure.",
      companies: [companies[4]],
    },
    {
      id: "second-order",
      title: "Speculative second-order plays",
      explanation: "Downstream categories to investigate without pretending a public-company match is known.",
      companies: [companies[3]],
    },
  ];
};

const companyLabels = (companies: ExposureCompany[]) =>
  companies.map((company) =>
    company.exampleTicker
      ? `${company.company} (${company.exampleTicker})`
      : company.company,
  );

const buildMapNodes = (
  scenario: CatalystScenario,
  template: ScenarioTemplate,
  exposureGroups: ExposureGroup[],
): MapNode[] => {
  const profile = scenarioProfiles[scenario];
  const groupedCompanies = exposureGroups.flatMap((group) => group.companies);
  const companies = companyLabels(groupedCompanies);
  const commonRisks = groupedCompanies.map((company) => company.keyRisk);

  return [
    {
      id: "demand-shift",
      label: "Demand Shift",
      type: "demand",
      shortSummary: template.impactChain[1],
      detail: profile.demandDetail,
      relatedSectors: profile.sectors[0],
      relatedCompanies: companies.slice(0, 2),
      risks: commonRisks.slice(0, 2),
      confidence: scenario === "generic" ? "Low" : "Medium",
      verifyNext: template.researchChecklist.slice(0, 2),
    },
    {
      id: "supply-chain",
      label: "Supply Chain",
      type: "supply",
      shortSummary: template.impactChain[2],
      detail: profile.supplyDetail,
      relatedSectors: profile.sectors[1],
      relatedCompanies: companies.slice(1, 5),
      risks: commonRisks.slice(1, 3),
      confidence: scenario === "generic" ? "Low" : "Medium",
      verifyNext: template.researchChecklist.slice(1, 3),
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      type: "infrastructure",
      shortSummary: profile.sectors[2].join(" · "),
      detail: profile.infrastructureDetail,
      relatedSectors: profile.sectors[2],
      relatedCompanies: companies.filter((_, index) => index >= 2).slice(0, 3),
      risks: commonRisks.slice(-2),
      confidence: scenario === "generic" ? "Low" : "Medium",
      verifyNext: template.researchChecklist.slice(1, 3),
    },
    {
      id: "public-companies",
      label: "Public Companies",
      type: "companies",
      shortSummary: `${exposureGroups.length} exposure groups to investigate`,
      detail: "These examples map direct, supplier, infrastructure, customer, negative, and speculative relationships. They are starting points for verification—not recommendations or proof of material exposure.",
      relatedSectors: [...new Set(groupedCompanies.map((company) => company.category))],
      relatedCompanies: companies,
      risks: commonRisks,
      confidence: scenario === "generic" ? "Low" : "Medium",
      verifyNext: template.researchChecklist,
    },
    {
      id: "risks",
      label: "Risks",
      type: "risk",
      shortSummary: "What could break or delay the thesis",
      detail: "A plausible relationship is not the same as financial materiality. Timing, valuation, geography, execution, and disclosed revenue exposure can all invalidate the apparent connection.",
      relatedSectors: [...new Set(groupedCompanies.map((company) => company.category))].slice(0, 4),
      relatedCompanies: companies.filter((_, index) => index === 0 || index === companies.length - 1),
      risks: commonRisks.slice(0, 4),
      confidence: "High",
      verifyNext: template.researchChecklist.slice(-2),
    },
    {
      id: "second-order-effects",
      label: "Second-Order Effects",
      type: "second-order",
      shortSummary: template.secondOrderEffects[0],
      detail: template.secondOrderEffects.join(" "),
      relatedSectors: [...profile.sectors[1], ...profile.sectors[2]].slice(0, 5),
      relatedCompanies: companies.slice(-2),
      risks: ["Second-order effects may be too delayed or immaterial to affect consolidated results."],
      confidence: "Low",
      verifyNext: template.researchChecklist.slice(2, 4),
    },
    {
      id: "research-questions",
      label: "Research Questions",
      type: "research",
      shortSummary: template.impactChain[4],
      detail: "Turn the map into falsifiable questions. Look for reported segment exposure, committed spending, implementation milestones, management confirmation, and evidence that expectations are not already reflected in valuation.",
      relatedSectors: profile.sectors.flat().slice(0, 5),
      relatedCompanies: [],
      risks: ["Confirmation bias can turn a thematic connection into an unsupported investment thesis."],
      confidence: "High",
      verifyNext: template.researchChecklist,
    },
  ];
};

export const generateMockAnalysis = (eventText: string): CatalystAnalysis => {
  const event = normalizeEvent(eventText);
  const scenario = detectScenario(event);
  const template = scenarioTemplates[scenario];
  const exposureGroups = buildExposureGroups(scenario, template, event);

  return {
    scenario,
    theme: scenarioThemes[scenario],
    catalystSummary: template.catalystSummary(event),
    thesis: scenarioProfiles[scenario].thesis,
    mapNodes: buildMapNodes(scenario, template, exposureGroups),
    exposureGroups,
    researchChecklist: template.researchChecklist,
  };
};

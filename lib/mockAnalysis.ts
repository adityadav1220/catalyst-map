export type CatalystAnalysis = {
  eventSummary: string;
  impactChain: string[];
  affectedSectors: string[];
  potentialCompanyCategories: string[];
  possibleWinners: string[];
  possibleLosers: string[];
  secondOrderEffects: string[];
  keyRisksAndCounterarguments: string[];
  researchChecklist: string[];
};

export type CatalystScenario = "semiconductor" | "ev" | "pharma" | "generic";

type ScenarioTemplate = Omit<CatalystAnalysis, "eventSummary"> & {
  eventSummary: (event: string) => string;
};

const normalizeEvent = (eventText: string) =>
  eventText.trim().replace(/\s+/g, " ");

const semiconductorPattern =
  /\b(semiconductor|semiconductors|chip|chips|fab|fabs|wafer|wafers|foundry|foundries)\b/;

const evPattern =
  /\b(electric vehicle|electric vehicles|ev|evs|battery|batteries|charging|charger|chargers)\b|public transport electric/;

const explicitPharmaPattern =
  /\b(ozempic|semaglutide|wegovy|glp[-\s]?1|diabetes drugs?|weight[-\s]loss drugs?)\b/;

const patentOrGenericPattern = /\b(patent|patents|patented|generic|generics)\b/;

const pharmaContextPattern =
  /\b(drug|drugs|medicine|medicines|pharmaceutical|pharmaceuticals|therapy|therapies|prescription|prescriptions|biopharma)\b/;

export const detectScenario = (eventText: string): CatalystScenario => {
  const lower = eventText.toLowerCase();

  if (semiconductorPattern.test(lower)) {
    return "semiconductor";
  }

  if (evPattern.test(lower)) {
    return "ev";
  }

  const hasExplicitPharmaTerm = explicitPharmaPattern.test(lower);
  const hasPatentOrGenericTerm = patentOrGenericPattern.test(lower);
  const hasPharmaContext = pharmaContextPattern.test(lower);

  if (hasExplicitPharmaTerm || (hasPatentOrGenericTerm && hasPharmaContext)) {
    return "pharma";
  }

  return "generic";
};

const scenarioTemplates: Record<CatalystScenario, ScenarioTemplate> = {
  semiconductor: {
    eventSummary: (event) =>
      `${event} could reshape semiconductor capacity, pricing, and supply-chain strategy. The key research question is whether the catalyst changes wafer demand, fabrication constraints, foundry utilization, equipment orders, or customer sourcing behavior.`,
    impactChain: [
      "Catalyst changes demand for compute, memory, advanced packaging, or domestic fabrication capacity.",
      "Foundries and integrated device manufacturers adjust capex, utilization targets, and customer allocation.",
      "Equipment, materials, EDA software, and outsourced assembly providers see changes in order timing and mix.",
      "End markets such as AI servers, autos, phones, and industrial electronics absorb higher availability or pricing pressure.",
      "Investor expectations reset around cycle timing, gross margins, backlog quality, and export-control exposure.",
    ],
    affectedSectors: [
      "Semiconductor foundries",
      "Fab equipment and process tools",
      "Wafer materials and specialty chemicals",
      "Advanced packaging and OSAT providers",
      "EDA and chip design software",
      "Data center, automotive, and consumer electronics customers",
    ],
    potentialCompanyCategories: [
      "Leading-edge foundries with scarce capacity",
      "Memory producers exposed to pricing cycles",
      "Semiconductor capital equipment vendors",
      "Materials suppliers for wafers, gases, photoresists, and substrates",
      "Fabless chip designers dependent on external manufacturing",
      "Assembly, testing, and advanced packaging providers",
    ],
    possibleWinners: [
      "Foundries with booked capacity and strong process-node leadership",
      "Equipment vendors tied to new fab construction and process upgrades",
      "Materials suppliers with qualified, hard-to-replace inputs",
      "Packaging providers benefiting from chiplet and high-bandwidth memory demand",
      "Fabless designers that secure reliable capacity ahead of competitors",
    ],
    possibleLosers: [
      "Fabless companies squeezed by higher wafer costs or allocation limits",
      "Older-node producers facing oversupply if capacity expands too quickly",
      "Customers with concentrated exposure to restricted geographies or suppliers",
      "Equipment vendors exposed to delayed fab projects or export limits",
      "Low-margin electronics brands unable to pass through component inflation",
    ],
    secondOrderEffects: [
      "Power, water, construction, and industrial real estate demand can rise near new fab sites.",
      "Export controls may redirect orders toward domestic or allied-country suppliers.",
      "Inventory corrections can move through distributors before showing up in manufacturer revenue.",
      "Talent shortages in process engineering can become a bottleneck for new capacity ramps.",
    ],
    keyRisksAndCounterarguments: [
      "Semiconductor cycles can reverse quickly if customers overorder and then draw down inventory.",
      "New fabs take years to ramp, so near-term revenue impact may be smaller than headlines imply.",
      "Government subsidies may not offset construction delays, cost inflation, or permitting constraints.",
      "Export restrictions can cap the opportunity for otherwise well-positioned suppliers.",
      "Valuations may already reflect the most obvious capacity or AI-related beneficiaries.",
    ],
    researchChecklist: [
      "Identify which node, chip type, or manufacturing step the catalyst affects.",
      "Check capex guidance, utilization commentary, backlog quality, and customer concentration.",
      "Compare exposure across foundries, equipment vendors, materials suppliers, and fabless customers.",
      "Review export-control, subsidy, and geography risks for each company category.",
      "Track inventory days, book-to-bill trends, lead times, and pricing commentary.",
      "Build bull/base/bear scenarios for wafer demand, margins, and ramp timing.",
    ],
  },
  ev: {
    eventSummary: (event) =>
      `${event} could change the pace of electric vehicle adoption and the economics of batteries, charging, fleet replacement, and grid demand. The first-pass map should separate vehicle demand from infrastructure, battery supply, and public or commercial fleet impacts.`,
    impactChain: [
      "Catalyst changes EV purchase incentives, fleet mandates, charging availability, or battery cost expectations.",
      "Automakers adjust production plans, model mix, pricing, and battery procurement.",
      "Battery cell, cathode, lithium, charging, and power-equipment suppliers see changes in demand visibility.",
      "Utilities, grid operators, and charging networks respond to higher load and site-level infrastructure needs.",
      "Consumer adoption, fleet economics, and residual values influence whether the demand shift is durable.",
    ],
    affectedSectors: [
      "Electric vehicle manufacturers",
      "Battery cells, packs, and battery materials",
      "Charging networks and charging hardware",
      "Utilities and grid infrastructure",
      "Public transport and commercial fleets",
      "Auto parts suppliers and dealerships",
    ],
    potentialCompanyCategories: [
      "EV manufacturers with scalable production and attractive unit economics",
      "Battery producers with contracted customers and cost advantages",
      "Lithium, nickel, graphite, and recycling suppliers",
      "Charging network operators and hardware providers",
      "Grid equipment, transformer, and power-management vendors",
      "Fleet operators replacing buses, vans, taxis, or delivery vehicles",
    ],
    possibleWinners: [
      "Battery suppliers with long-term contracts and improving cost curves",
      "Charging operators with high-utilization locations and fleet customers",
      "Automakers with profitable EV platforms and flexible manufacturing capacity",
      "Grid equipment suppliers tied to depot charging and distribution upgrades",
      "Fleet operators that lower fuel and maintenance costs through electrification",
    ],
    possibleLosers: [
      "Legacy auto suppliers tied to internal combustion powertrains",
      "Automakers forced into price cuts without battery cost advantages",
      "Charging networks with low utilization or high financing costs",
      "Commodity suppliers exposed to oversupply or volatile spot pricing",
      "Dealers and service models dependent on higher-maintenance ICE vehicles",
    ],
    secondOrderEffects: [
      "Electric load growth can accelerate demand for transformers, switchgear, and grid software.",
      "Battery recycling and second-life storage markets may become more valuable as fleet retirements grow.",
      "Public charging economics can improve if fleet depots and ride-share drivers anchor utilization.",
      "Fuel demand, maintenance revenue, and used-car residual values may shift over time.",
    ],
    keyRisksAndCounterarguments: [
      "EV adoption may slow if subsidies decline, interest rates stay high, or charging remains inconvenient.",
      "Battery raw material prices can compress margins for manufacturers without pass-through contracts.",
      "Charging companies may grow revenue but still struggle with utilization, uptime, and capital intensity.",
      "Grid constraints and permitting delays can limit deployment speed.",
      "Consumer preference for hybrids or cheaper ICE vehicles could weaken the demand case.",
    ],
    researchChecklist: [
      "Separate passenger EV, commercial fleet, and public transport exposure.",
      "Check subsidy timelines, fleet mandates, charging targets, and battery cost assumptions.",
      "Compare company-level unit economics, production capacity, and battery sourcing.",
      "Review charging utilization, site economics, uptime, and customer acquisition costs.",
      "Track lithium and battery material pricing, recycling capacity, and supply contracts.",
      "Build adoption scenarios by vehicle segment and geography.",
    ],
  },
  pharma: {
    eventSummary: (event) =>
      `${event} could alter the profit pool around GLP-1 therapies, branded drug exclusivity, generic entry, and payer behavior. The research map should distinguish patent owners, generic manufacturers, distribution channels, insurers, and adjacent consumer-health categories.`,
    impactChain: [
      "Catalyst changes the expected exclusivity window, pricing power, supply availability, or reimbursement stance.",
      "Branded manufacturers adjust lifecycle management, formulation strategy, and capacity planning.",
      "Generic or biosimilar entrants evaluate regulatory pathways, manufacturing complexity, and launch timing.",
      "Payers, PBMs, pharmacies, and distributors renegotiate access, rebates, and patient affordability.",
      "Adjacent categories such as diabetes care, obesity treatment, food, fitness, and medical devices reassess demand assumptions.",
    ],
    affectedSectors: [
      "Branded biopharma",
      "Generic and biosimilar drug manufacturers",
      "Pharmacy benefit managers and health insurers",
      "Specialty pharmacies and drug distributors",
      "Diabetes devices and metabolic health platforms",
      "Food, nutrition, fitness, and weight management categories",
    ],
    potentialCompanyCategories: [
      "Patent holders and branded GLP-1 manufacturers",
      "Generic or biosimilar companies with injectable manufacturing capacity",
      "PBMs and insurers managing reimbursement and access",
      "Specialty pharmacies and distributors handling cold-chain volume",
      "Medical device companies exposed to diabetes and obesity care",
      "Consumer companies affected by appetite, diet, or weight-loss behavior shifts",
    ],
    possibleWinners: [
      "Generic manufacturers that can navigate complex regulatory and manufacturing requirements",
      "Payers and PBMs that use competition to reduce net drug costs",
      "Distributors and specialty pharmacies with efficient GLP-1 handling infrastructure",
      "Branded companies with next-generation formulations or broader metabolic pipelines",
      "Consumer-health platforms that adapt to medication-assisted weight management",
    ],
    possibleLosers: [
      "Branded drug makers overexposed to one patent-protected GLP-1 franchise",
      "Manufacturers with weak replacement pipelines or limited lifecycle protection",
      "Medical device or diabetes-care businesses facing reduced long-term disease burden assumptions",
      "Consumer food categories exposed to lower calorie intake or changing purchase behavior",
      "Generic entrants that underestimate manufacturing complexity or litigation risk",
    ],
    secondOrderEffects: [
      "Lower net prices could expand patient access and increase total prescription volume.",
      "Changing obesity and diabetes outcomes may affect demand for devices, procedures, and chronic-care services.",
      "Cold-chain logistics, fill-finish capacity, and injector components can become bottlenecks.",
      "Food, apparel, fitness, and wellness categories may see slow-moving behavioral changes.",
    ],
    keyRisksAndCounterarguments: [
      "Patent timing can be extended or delayed by litigation, settlements, formulation changes, or device patents.",
      "GLP-1 manufacturing is complex, so generic competition may not arrive as quickly as simple small-molecule drugs.",
      "Payer restrictions, side-effect concerns, or adherence challenges could limit total market expansion.",
      "Branded manufacturers may defend margins through new indications, combinations, or delivery formats.",
      "The market may already price in obvious patent-cliff risk for exposed companies.",
    ],
    researchChecklist: [
      "Confirm the exact patents, formulation protections, litigation status, and expected loss-of-exclusivity dates.",
      "Identify which companies have injectable, peptide, fill-finish, or biosimilar capabilities.",
      "Review branded manufacturer pipeline depth, lifecycle strategy, and capacity expansion plans.",
      "Track payer coverage, prior authorization rules, rebates, and patient affordability trends.",
      "Compare distributor, specialty pharmacy, and cold-chain exposure.",
      "Model branded erosion, generic launch timing, price declines, and volume expansion separately.",
    ],
  },
  generic: {
    eventSummary: (event) =>
      `${event} could create a measurable shift in demand, margins, regulation, or capital allocation. The first-pass research question is which businesses have direct exposure, which have second-order exposure, and which risks are already priced in.`,
    impactChain: [
      "Catalyst changes incentives, costs, demand, or regulatory constraints.",
      "Companies with direct exposure adjust pricing, capacity, sourcing, or product strategy.",
      "Suppliers, distributors, and substitutes feel second-order effects as the market adapts.",
      "Investor expectations reset around revenue durability, margin pressure, and execution risk.",
    ],
    affectedSectors: [
      "Technology",
      "Industrials",
      "Consumer markets",
      "Financial services",
      "Logistics and distribution",
    ],
    potentialCompanyCategories: [
      "Incumbents with pricing power",
      "Specialized suppliers",
      "Distribution platforms",
      "Capital-intensive challengers",
      "Compliance or workflow software vendors",
    ],
    possibleWinners: [
      "Companies that can turn the catalyst into higher demand",
      "Suppliers with scarce capabilities or regulated capacity",
      "Platforms with direct customer access and strong data advantages",
      "Operators that can reprice faster than their cost base rises",
    ],
    possibleLosers: [
      "Incumbents with slow execution cycles",
      "Companies exposed to rising costs without pricing power",
      "Firms dependent on outdated business models",
      "Operators with concentrated customer, supplier, or geography exposure",
    ],
    secondOrderEffects: [
      "Capital may rotate from obvious first-order names into suppliers, distributors, and substitutes.",
      "Pricing changes can show up first in margins before revenue growth becomes visible.",
      "Regulatory, labor, logistics, or financing constraints may determine who can scale.",
      "Customer behavior may shift more slowly than headlines suggest.",
    ],
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
  },
};

export const generateMockAnalysis = (eventText: string): CatalystAnalysis => {
  const event = normalizeEvent(eventText);
  const template = scenarioTemplates[detectScenario(event)];

  return {
    ...template,
    eventSummary: template.eventSummary(event),
  };
};

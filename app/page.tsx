"use client";

import { useMemo, useState } from "react";
import {
  CatalystAnalysis,
  Confidence,
  ExposureCompany,
  ExposureGroup,
  ExposureType,
  MapNode,
} from "@/lib/mockAnalysis";
import { MAX_EVENT_LENGTH } from "@/lib/analysisLimits";

type AnalysisMode = "smart" | "mock";
type DevelopmentProviderStatus = "idle" | "mock" | "smart" | "provider_error";
type ApiErrorPayload = {
  error?: {
    type?: "missing_key" | "provider_error" | "invalid_json" | "schema_error";
    message?: string;
    fallbackUsed?: boolean;
  };
};

const developmentStatusLabels: Record<DevelopmentProviderStatus, string> = {
  idle: "Awaiting analysis",
  mock: "Mock fallback",
  smart: "Groq Smart Mode",
  provider_error: "Provider error",
};

const exposureStyles: Record<ExposureType, string> = {
  Direct: "bg-teal-50 text-teal-800 ring-teal-200",
  Supplier: "bg-blue-50 text-blue-800 ring-blue-200",
  Infrastructure: "bg-violet-50 text-violet-800 ring-violet-200",
  Customer: "bg-amber-50 text-amber-800 ring-amber-200",
  Negative: "bg-rose-50 text-rose-800 ring-rose-200",
  Speculative: "bg-slate-100 text-slate-700 ring-slate-200",
};

const confidenceStyles: Record<Confidence, string> = {
  High: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Low: "bg-slate-100 text-slate-600 ring-slate-200",
};

const nodeIcons: Record<MapNode["type"], string> = {
  demand: "↗",
  supply: "⇄",
  infrastructure: "⌁",
  companies: "$",
  risk: "!",
  "second-order": "◎",
  research: "?",
};

const gridAreas = [
  "1 / 1",
  "1 / 2",
  "1 / 3",
  "2 / 1",
  "2 / 3",
  "3 / 1",
  "3 / 3",
];

const Badge = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>
    {children}
  </span>
);

const CompactList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li className="flex gap-2" key={item}>
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const ExposureList = ({ companies }: { companies: ExposureCompany[] }) => (
  <div className="space-y-3">
    {companies.map((company) => (
      <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={company.company}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-slate-950">{company.company}</h4>
            <p className="mt-0.5 text-xs text-slate-500">
              {company.exampleTicker ? `Example ticker: ${company.exampleTicker}` : "Category only"}
              <span aria-hidden="true"> · </span>
              {company.category}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Badge className={exposureStyles[company.exposureType]}>{company.exposureType}</Badge>
            <Badge className={confidenceStyles[company.confidence]}>{company.confidence}</Badge>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">{company.connection}</p>
        <p className="mt-2 text-xs leading-5 text-rose-700"><strong>Key risk:</strong> {company.keyRisk}</p>
      </article>
    ))}
  </div>
);

const GroupedExposureList = ({ groups }: { groups: ExposureGroup[] }) => (
  <div className="space-y-4">
    {groups.map((group, index) => (
      <section className="overflow-hidden rounded-xl border border-slate-200" key={group.id}>
        <div className="border-b border-slate-200 bg-slate-100/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              {index + 1}
            </span>
            <h4 className="font-semibold text-slate-950">{group.title}</h4>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">{group.explanation}</p>
        </div>
        <div className="space-y-2 bg-white p-2">
          <ExposureList companies={group.companies} />
        </div>
      </section>
    ))}
  </div>
);

const DetailPanel = ({ analysis, node }: { analysis: CatalystAnalysis; node: MapNode }) => (
  <aside className="rounded-2xl border border-slate-200 bg-white shadow-panel">
    <div className="border-b border-slate-200 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Selected factor</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{node.label}</h2>
        </div>
        <Badge className={confidenceStyles[node.confidence]}>{node.confidence} confidence</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{node.detail}</p>
    </div>

    <div className="space-y-6 p-5 text-sm leading-6 text-slate-700 sm:p-6">
      {node.type === "companies" ? (
        <section>
          <h3 className="mb-3 font-semibold text-slate-950">Top Exposure Map</h3>
          <GroupedExposureList groups={analysis.exposureGroups} />
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Illustrative global public-company proxies—not country-specific recommendations.
            Verify local listings, filings, and current market data.
          </p>
        </section>
      ) : null}

      <section>
        <h3 className="mb-2 font-semibold text-slate-950">Related sectors</h3>
        <div className="flex flex-wrap gap-2">
          {node.relatedSectors.map((sector) => (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700" key={sector}>{sector}</span>
          ))}
        </div>
      </section>

      {node.type !== "companies" && node.relatedCompanies.length ? (
        <section>
          <h3 className="mb-2 font-semibold text-slate-950">Example companies / proxies</h3>
          <CompactList items={node.relatedCompanies} />
        </section>
      ) : null}

      <section>
        <h3 className="mb-2 font-semibold text-slate-950">Key risks</h3>
        <CompactList items={node.risks.slice(0, node.type === "companies" ? 3 : 4)} />
      </section>

      <section className="rounded-xl bg-slate-950 p-4 text-slate-200">
        <h3 className="mb-2 font-semibold text-white">What to verify next</h3>
        <CompactList items={node.verifyNext.slice(0, 5)} />
      </section>
    </div>
  </aside>
);

const starterPrompt = "Example: India is expanding semiconductor manufacturing and new chip fabs.";

export default function Home() {
  const [eventText, setEventText] = useState("");
  const [analysis, setAnalysis] = useState<CatalystAnalysis | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("demand-shift");
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configurationNotice, setConfigurationNotice] = useState<string | null>(null);
  const [developmentStatus, setDevelopmentStatus] =
    useState<DevelopmentProviderStatus>("idle");
  const canGenerate = eventText.trim().length > 0;
  const characterCount = useMemo(() => eventText.trim().length, [eventText]);
  const selectedNode = analysis?.mapNodes.find((node) => node.id === selectedNodeId) ?? analysis?.mapNodes[0];

  const handleGenerate = async () => {
    if (!canGenerate || isLoading) return;

    setIsLoading(true);
    setError(null);
    setConfigurationNotice(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: eventText.trim() }),
      });
      const payload = (await response.json()) as CatalystAnalysis | ApiErrorPayload;

      if (!response.ok) {
        setDevelopmentStatus("provider_error");
        const message =
          "error" in payload && payload.error?.message
            ? payload.error.message
            : "Analysis failed. Please try again.";
        throw new Error(message);
      }

      const nextAnalysis = payload as CatalystAnalysis;
      const mode =
        response.headers.get("X-Catalyst-Mode") === "smart" ? "smart" : "mock";
      setAnalysis(nextAnalysis);
      setAnalysisMode(mode);
      setDevelopmentStatus(mode);
      if (response.headers.get("X-Catalyst-Fallback") === "missing_key") {
        setConfigurationNotice(
          "Smart Mode is not configured. Add GROQ_API_KEY to .env.local and restart the dev server.",
        );
      }
      setSelectedNodeId(nextAnalysis.mapNodes[0].id);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Analysis failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">Interactive investment research</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Catalyst Map</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Trace how a future event moves through demand, supply chains, infrastructure, public companies, and investor questions.</p>
          </div>
          <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
            {analysisMode === "smart"
              ? "Smart Mode · Groq"
              : analysisMode === "mock"
                ? "Demo mode · Mock fallback"
                : "Smart Mode · Awaiting analysis"}
            <span aria-hidden="true"> · </span>
            Not financial advice
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label htmlFor="event" className="text-sm font-semibold text-ink">Future event or catalyst</label>
              <textarea
                id="event"
                value={eventText}
                onChange={(event) => setEventText(event.target.value)}
                disabled={isLoading}
                maxLength={MAX_EVENT_LENGTH}
                placeholder={starterPrompt}
                className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-signal focus:ring-4 focus:ring-teal-100"
              />
            </div>
            <div className="flex items-center justify-between gap-4 lg:block">
              <p className="mb-0 text-xs text-slate-400 lg:mb-2 lg:text-right">{characterCount.toLocaleString()} / {MAX_EVENT_LENGTH.toLocaleString()} characters</p>
              <button type="button" onClick={handleGenerate} disabled={!canGenerate || isLoading} aria-busy={isLoading} className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${analysis?.theme.accentClass ?? "bg-signal text-white hover:bg-teal-800"}`}>
                {isLoading ? "Building smart map…" : analysis ? "Remap catalyst" : "Generate map"}
              </button>
            </div>
          </div>
          {error ? (
            <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : null}
          {configurationNotice ? (
            <p className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
              {configurationNotice}
            </p>
          ) : null}
          {isLoading ? (
            <p aria-live="polite" className="mt-3 text-xs text-slate-500">
              Mapping the catalyst, exposure paths, risks, and research questions…
            </p>
          ) : null}
          {process.env.NODE_ENV === "development" ? (
            <p className="mt-3 text-xs font-medium text-slate-400">
              Development provider status: {developmentStatusLabels[developmentStatus]}
            </p>
          ) : null}
        </section>

        {analysis && selectedNode ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <span>{analysis.theme.eyebrow}</span><span>·</span><span>{analysis.theme.name}</span>
              </div>
              <h2 className="mt-3 text-sm font-semibold text-slate-500">Research thesis</h2>
              <p className="mt-1 max-w-5xl text-xl font-semibold leading-8 text-slate-950">{analysis.thesis}</p>
              <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-600">{analysis.catalystSummary}</p>
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-[1.35fr_1fr]">
              <section className={`relative overflow-hidden rounded-2xl border p-4 shadow-panel sm:p-6 ${analysis.theme.canvasClass}`} aria-label="Interactive catalyst factor map">
                <div className={`pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${analysis.theme.glowClass}`} />
                <div className="relative grid gap-3 sm:min-h-[580px] sm:grid-cols-3 sm:grid-rows-3 sm:items-center">
                  <div className={`order-first flex min-h-36 flex-col items-center justify-center rounded-2xl border p-5 text-center shadow-2xl sm:order-none ${analysis.theme.centerClass}`} style={{ gridArea: "2 / 2" }}>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] opacity-60">Catalyst</span>
                    <strong className="mt-2 line-clamp-4 text-base leading-6">{eventText.trim()}</strong>
                    <span className="mt-3 rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-medium capitalize text-white/70">{analysis.scenario}</span>
                  </div>

                  {analysis.mapNodes.map((node, index) => {
                    const active = node.id === selectedNode.id;
                    return (
                      <button
                        type="button"
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        aria-pressed={active}
                        className={`group min-h-28 rounded-2xl border p-4 text-left shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 ${active ? analysis.theme.activeNodeClass : "border-white/15 bg-white/95 text-slate-900 ring-transparent hover:border-white/40"}`}
                        style={{ gridArea: gridAreas[index] }}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">{nodeIcons[node.type]}</span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-50">{node.confidence}</span>
                        </span>
                        <strong className="mt-3 block text-sm">{node.label}</strong>
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 opacity-65">{node.shortSummary}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="relative mt-4 text-center text-xs text-white/55">Select a factor to inspect the evidence path.</p>
              </section>

              <DetailPanel analysis={analysis} node={selectedNode} />
            </div>

            <p className="px-1 text-center text-xs leading-5 text-slate-500">Example companies and tickers are illustrative global proxies. Verify local listings, current filings, and market data before trusting any research idea.</p>
          </div>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <p className="font-semibold text-slate-700">Your research map will appear here.</p>
            <p className="mt-1 text-sm text-slate-500">Enter a catalyst to reveal its demand, supply, company, risk, and research paths.</p>
          </section>
        )}
      </div>
    </main>
  );
}

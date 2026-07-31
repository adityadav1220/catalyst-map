"use client";

import { useMemo, useState } from "react";
import {
  CatalystAnalysis,
  ExposureRow,
  ExposureType,
  generateMockAnalysis,
} from "@/lib/mockAnalysis";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
  </section>
);

const List = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li className="flex gap-3" key={item}>
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const exposureStyles: Record<ExposureType, string> = {
  Direct: "bg-teal-50 text-teal-800 ring-teal-200",
  Supplier: "bg-blue-50 text-blue-800 ring-blue-200",
  Infrastructure: "bg-violet-50 text-violet-800 ring-violet-200",
  Customer: "bg-amber-50 text-amber-800 ring-amber-200",
  Negative: "bg-rose-50 text-rose-800 ring-rose-200",
  Speculative: "bg-slate-100 text-slate-700 ring-slate-200",
};

const confidenceStyles = {
  High: "text-emerald-700",
  Medium: "text-amber-700",
  Low: "text-slate-500",
};

const ExposureCard = ({ row }: { row: ExposureRow }) => (
  <article className="grid gap-4 border-t border-slate-200 px-4 py-5 first:border-t-0 sm:px-5 lg:grid-cols-[1.2fr_0.75fr_2fr_0.65fr_1.35fr] lg:items-start">
    <div>
      <p className="font-semibold leading-5 text-ink">{row.company}</p>
      <p className="mt-1 text-xs text-slate-500">
        {row.exampleTicker ? `Example ticker: ${row.exampleTicker}` : "No ticker assigned"}
        <span aria-hidden="true"> · </span>
        {row.category}
      </p>
    </div>
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${exposureStyles[row.exposureType]}`}
      >
        {row.exposureType}
      </span>
    </div>
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
        Why connected
      </p>
      <p>{row.connection}</p>
    </div>
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
        Confidence
      </p>
      <p className={`font-semibold ${confidenceStyles[row.confidence]}`}>
        {row.confidence}
      </p>
    </div>
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
        Key risk
      </p>
      <p>{row.keyRisk}</p>
    </div>
  </article>
);

const starterPrompt =
  "Example: A major GLP-1 weight loss drug loses patent protection in 2029.";

export default function Home() {
  const [eventText, setEventText] = useState("");
  const [analysis, setAnalysis] = useState<CatalystAnalysis | null>(null);
  const canGenerate = eventText.trim().length > 0;

  const characterCount = useMemo(() => eventText.trim().length, [eventText]);

  const handleGenerate = () => {
    if (!canGenerate) {
      return;
    }

    setAnalysis(generateMockAnalysis(eventText));
  };

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="max-w-3xl pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal">
            Investment research workflow
          </p>
          <h1 className="mt-4 text-4xl font-bold text-ink sm:text-5xl">Catalyst Map</h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            Turn a future event, policy change, patent expiry, or market trend into a
            structured map of public-company exposure, impact chains, risks, and
            follow-up research.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
          <div className="flex flex-col gap-4">
            <label htmlFor="event" className="text-sm font-semibold text-ink">
              Future event or catalyst
            </label>
            <textarea
              id="event"
              value={eventText}
              onChange={(event) => setEventText(event.target.value)}
              placeholder={starterPrompt}
              className="min-h-44 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-base leading-7 text-ink outline-none transition focus:border-signal focus:ring-4 focus:ring-teal-100"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">{characterCount} characters</p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-signal px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Generate Catalyst Map
              </button>
            </div>
          </div>
        </section>

        {analysis ? (
          <div className="space-y-4">
            <aside className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">Demo mode · Mock analysis</p>
              <p>
                Example tickers are illustrative and not financial advice. Verify with
                current filings and market data.
              </p>
            </aside>

            <Section title="1. Catalyst Summary">
              <p>{analysis.catalystSummary}</p>
            </Section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="p-5">
                <h2 className="text-base font-semibold text-ink">2. Top Exposure Map</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Mock research leads ranked by the clarity of their connection—not an
                  investment recommendation.
                </p>
                <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-950">
                  These are illustrative global public-company proxies. They are not
                  country-specific recommendations. Verify local listings, filings, and
                  current market data.
                </p>
              </div>
              <div className="hidden grid-cols-[1.2fr_0.75fr_2fr_0.65fr_1.35fr] gap-4 border-y border-slate-200 bg-slate-50 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Company / example</span>
                <span>Exposure</span>
                <span>Why connected</span>
                <span>Confidence</span>
                <span>Key risk</span>
              </div>
              <div className="text-sm leading-5 text-slate-700">
                {analysis.topExposureMap.map((row) => (
                  <ExposureCard key={`${row.company}-${row.exposureType}`} row={row} />
                ))}
              </div>
              <p className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                Example tickers are illustrative and not financial advice. Verify with
                current filings and market data.
              </p>
            </section>

            <Section title="3. Impact Chain">
              <ol className="grid gap-3 lg:grid-cols-5">
                {analysis.impactChain.map((item, index) => (
                  <li className="relative flex gap-3 lg:block" key={item}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="lg:mt-3">{item}</p>
                    {index < analysis.impactChain.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute -right-2 top-0 hidden text-xl text-slate-300 lg:block"
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs font-medium text-slate-500">
                Event → demand shift → supply chain effect → company exposure → investor
                question
              </p>
            </Section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Section title="4. Second-Order Effects">
                <List items={analysis.secondOrderEffects} />
              </Section>

              <Section title="5. Research Checklist">
                <List items={analysis.researchChecklist} />
              </Section>
            </section>
          </div>
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-6 text-sm leading-6 text-slate-600">
            Enter a catalyst and generate a map to see the structured research workflow.
          </section>
        )}
      </div>
    </main>
  );
}

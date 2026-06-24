"use client";

import { useMemo, useState } from "react";
import { CatalystAnalysis, generateMockAnalysis } from "@/lib/mockAnalysis";

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
            structured map of sectors, company categories, possible winners, losers,
            risks, and follow-up research.
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
          <section className="grid gap-4 lg:grid-cols-2">
            <Section title="1. Event Summary">
              <p>{analysis.eventSummary}</p>
            </Section>

            <Section title="2. Impact Chain">
              <List items={analysis.impactChain} />
            </Section>

            <Section title="3. Affected Sectors">
              <List items={analysis.affectedSectors} />
            </Section>

            <Section title="4. Potential Company Categories">
              <List items={analysis.potentialCompanyCategories} />
            </Section>

            <Section title="5. Possible Winners">
              <List items={analysis.possibleWinners} />
            </Section>

            <Section title="6. Possible Losers">
              <List items={analysis.possibleLosers} />
            </Section>

            <Section title="7. Key Risks and Counterarguments">
              <List items={analysis.keyRisksAndCounterarguments} />
            </Section>

            <Section title="8. Research Checklist">
              <List items={analysis.researchChecklist} />
            </Section>
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-6 text-sm leading-6 text-slate-600">
            Enter a catalyst and generate a map to see the structured research workflow.
          </section>
        )}
      </div>
    </main>
  );
}

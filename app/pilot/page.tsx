import type { Metadata } from "next";
import PilotApp from "@/components/PilotApp";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Pilot App",
  description:
    "Interactive ENT decision-support pilot application with AI-generated summaries.",
};

export default function PilotPage() {
  return (
    <div className="min-h-screen bg-[var(--color-shell)] text-[var(--color-ink)]">
      <div className="relative overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(26,163,160,0.35),transparent_65%)] blur-3xl" />
          <div className="absolute right-[-120px] top-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(11,31,51,0.22),transparent_70%)] blur-3xl animate-[drift_18s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-140px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,238,240,0.9),transparent_70%)] blur-3xl animate-[drift_16s_ease-in-out_infinite]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-10">
          <SiteHeader />

          <section className="mt-14">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent-strong)]">
              Pilot application
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
              ENT decision-support pilot
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
              Sequentially screen symptoms and generate a structured GP summary
              based on the questions asked and responses selected.
            </p>
          </section>

          <section className="mt-12">
            <PilotApp />
          </section>
        </div>
      </div>
    </div>
  );
}

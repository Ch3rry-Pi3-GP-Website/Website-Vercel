import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Overview",
  description: "Capability overview for GP Diagnostic Aide.",
};

const highlights = [
  {
    title: "Symptom-led triage",
    description:
      "Structured prompts surface red flags and differential pathways early.",
    detail:
      "Guides GPs through symptom clusters, duration, and risk factors to improve consistency.",
  },
  {
    title: "Referral alignment",
    description:
      "Recommendations map to ENT pathways and urgency tiers for safer routing.",
    detail:
      "Supports standardised referrals with data points ready for clinical letters.",
  },
  {
    title: "Explainable logic",
    description:
      "Rule-based core with transparent reasoning and auditable outputs.",
    detail:
      "Designed for clinical governance and iterative validation with specialists.",
  },
];

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-[var(--color-shell)] text-[var(--color-ink)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(26,163,160,0.35),transparent_65%)] blur-3xl" />
          <div className="absolute right-[-120px] top-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(11,31,51,0.22),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-[-140px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,238,240,0.9),transparent_70%)] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-10">
          <SiteHeader />

          <section className="mt-16">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent-strong)]">
              Capability
            </p>
            <h1 className="mt-4 font-serif text-4xl text-[var(--color-ink)] md:text-5xl">
              Decision support built for clinical flow
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
              Designed to fit GP workflows with minimal friction while keeping
              the logic transparent and reviewable.
            </p>
          </section>

          <section className="mt-12 grid gap-6 md:grid-cols-3">
            {highlights.map((item, index) => (
              <div
                key={item.title}
                style={{ animationDelay: `${index * 120}ms` }}
                className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-6 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 animate-[fade-in-up_0.9s_ease_forwards]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-ice)] text-sm font-semibold text-[var(--color-accent-strong)]">
                  0{index + 1}
                </div>
                <h3 className="mt-4 font-serif text-xl text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  {item.description}
                </p>
                <p className="mt-4 text-sm font-medium text-[var(--color-ink-soft)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </section>

          <footer className="mt-20 border-t border-[var(--color-border)] py-8 text-xs text-[var(--color-muted)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>GP Diagnostic Aide</span>
              <span>Building responsible clinical AI for primary care.</span>
              <span>(c) 2026</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

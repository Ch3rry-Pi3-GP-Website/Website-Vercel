import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Workflow",
  description: "Workflow snapshot for GP Diagnostic Aide.",
};

const workflow = [
  {
    step: "01",
    title: "Capture patient context",
    text: "Collect symptoms, duration, risk factors, and red-flag indicators in a structured flow.",
  },
  {
    step: "02",
    title: "Apply clinical logic",
    text: "Match inputs to validated ENT pathways with explainable rule-based reasoning.",
  },
  {
    step: "03",
    title: "Guide next actions",
    text: "Return referral urgency, investigations, and patient safety prompts for review.",
  },
];

export default function WorkflowPage() {
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
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
                  Workflow snapshot
                </p>
                <h1 className="mt-3 font-serif text-3xl text-[var(--color-ink)] md:text-4xl">
                  A clear path from symptoms to action
                </h1>
              </div>
              <p className="max-w-sm text-sm text-[var(--color-muted)]">
                Designed to reduce uncertainty while keeping clinicians in
                control of every decision.
              </p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {workflow.map((step, index) => (
                <div
                  key={step.step}
                  style={{ animationDelay: `${index * 120}ms` }}
                  className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-6 shadow-lg shadow-slate-200/70 animate-[fade-in-up_0.9s_ease_forwards]"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
                    Step {step.step}
                  </p>
                  <h3 className="mt-3 font-serif text-xl text-[var(--color-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
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

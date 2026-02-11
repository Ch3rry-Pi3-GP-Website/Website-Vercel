import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Governance",
  description: "Safety, governance, and clinical oversight notes.",
};

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-[var(--color-shell)] text-[var(--color-ink)]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(26,163,160,0.35),transparent_65%)] blur-3xl" />
          <div className="absolute right-[-120px] top-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(11,31,51,0.22),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-[-140px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,238,240,0.9),transparent_70%)] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-10">
          <SiteHeader />

          <section className="mt-16">
            <div className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-8 shadow-xl shadow-slate-200/70">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
                    Safety and governance
                  </p>
                  <h1 className="mt-4 font-serif text-3xl text-[var(--color-ink)]">
                    Designed for explainability and clinical oversight
                  </h1>
                  <p className="mt-4 text-sm text-[var(--color-muted)]">
                    GP Diagnostic Aide is intended to support, not replace,
                    clinical judgement. Outputs remain transparent, auditable,
                    and aligned with documented pathways.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[var(--color-shell)] p-4">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      Rule-based core
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Deterministic logic provides consistent recommendations
                      with traceable reasoning.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-shell)] p-4">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      Specialist review
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      ENT consultants validate outputs against real-world
                      referral thresholds.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-shell)] p-4">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      Clinical accountability
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Built to fit governance requirements, with clinicians in
                      charge of final decisions.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-[var(--color-muted)]">
                Disclaimer: GP Diagnostic Aide is a prototype clinical
                decision-support system and is not a medical device. Final
                clinical decisions rest with qualified practitioners.
              </p>
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

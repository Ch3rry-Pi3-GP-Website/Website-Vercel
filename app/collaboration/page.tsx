import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Collaboration",
  description: "Clinical collaboration and design ownership details.",
};

export default function CollaborationPage() {
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

          <section className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-[var(--color-ink)] p-8 text-white shadow-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-teal-200">
                Clinical collaboration
              </p>
              <h1 className="mt-4 font-serif text-3xl">
                Co-designed with ENT consultant surgeons
              </h1>
              <p className="mt-4 text-sm text-teal-100/80">
                This project is being developed in collaboration with current
                and retired ENT consultant surgeons to ensure clinical validity
                and realistic workflow alignment.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-100/70">
                    Validation
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    Pathway review, red-flag testing, referral thresholds.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-100/70">
                    Workflow fit
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    Designed to mirror GP consultations and referral letter flow.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Design ownership
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                  End-to-end system design, data modelling, AI logic, and
                  web-based implementation.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Clinical scope
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                  ENT-focused pathways first, with expansion to broader referral
                  categories planned.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Implementation stack
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                  Web-based assistant now, with future support for mobile and
                  offline-friendly workflows.
                </p>
              </div>
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

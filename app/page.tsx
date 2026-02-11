import SiteHeader from "@/components/SiteHeader";

const badges = [
  "ENT consultant collaboration",
  "Rule-based core logic",
  "Audit-ready outputs",
  "Web-based assistant",
];

export default function Home() {
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

          <section className="mt-16 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6 animate-[fade-in-up_0.9s_ease_forwards]">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent-strong)]">
                AI-driven GP support
              </p>
              <h1 className="font-serif text-4xl leading-tight text-[var(--color-ink)] md:text-6xl">
                Fast, explainable diagnostic guidance for primary care.
              </h1>
              <p className="text-lg text-[var(--color-muted)]">
                GP Diagnostic Aide helps General Practitioners optimize diagnostic
                and referral pathways based on patient symptoms, combining
                structured clinical logic with AI-assisted insights.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200/60 transition hover:-translate-y-0.5"
                  type="button"
                >
                  Request pilot access
                </button>
                <button
                  className="rounded-full border border-[var(--color-border)] bg-white/90 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition hover:-translate-y-0.5"
                  type="button"
                >
                  Clinical validation brief
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 text-xs font-medium text-[var(--color-ink-soft)]">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-8 shadow-2xl shadow-slate-200/70 animate-[fade-in-up_1.1s_ease_forwards]">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Prototype snapshot
              </p>
              <h2 className="mt-3 font-serif text-2xl text-[var(--color-ink)]">
                Clinical reasoning summary
              </h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[var(--color-shell)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Patient input
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                    Unilateral otalgia, persistent for 6 weeks, associated
                    dysphagia.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Decision support
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                    Flagged red-flag symptoms and recommended urgent ENT
                    referral with imaging.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--color-ice)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Rationale
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--color-ink-soft)]">
                    Logic aligned to national ENT pathways and consultant review
                    notes.
                  </p>
                </div>
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

import SiteHeader from "@/components/SiteHeader";

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

const badges = [
  "ENT consultant collaboration",
  "Rule-based core logic",
  "Audit-ready outputs",
  "Web-based assistant",
];

export default function Home() {
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
                  className="rounded-full border border-[var(--color-border)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5"
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

          <section id="overview" className="mt-24 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
                  Capability
                </p>
                <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)] md:text-4xl">
                  Decision support built for clinical flow
                </h2>
              </div>
              <p className="max-w-sm text-sm text-[var(--color-muted)]">
                Designed to fit GP workflows with minimal friction while keeping
                the logic transparent and reviewable.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {highlights.map((item, index) => (
                <div
                  key={item.title}
                  style={{ animationDelay: `${index * 120}ms` }}
                  className="rounded-3xl border border-[var(--color-border)] bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur transition hover:-translate-y-1 animate-[fade-in-up_0.9s_ease_forwards]"
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
            </div>
          </section>

          <section
            id="collaboration"
            className="mt-24 scroll-mt-24 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <div className="rounded-3xl bg-[var(--color-ink)] p-8 text-white shadow-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-teal-200">
                Clinical collaboration
              </p>
              <h2 className="mt-4 font-serif text-3xl">
                Co-designed with ENT consultant surgeons
              </h2>
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

          <section id="workflow" className="mt-24 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
                  Workflow snapshot
                </p>
                <h2 className="mt-3 font-serif text-3xl text-[var(--color-ink)] md:text-4xl">
                  A clear path from symptoms to action
                </h2>
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

          <section id="governance" className="mt-24 scroll-mt-24">
            <div className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-8 shadow-xl shadow-slate-200/70">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
                    Safety and governance
                  </p>
                  <h2 className="mt-4 font-serif text-3xl text-[var(--color-ink)]">
                    Designed for explainability and clinical oversight
                  </h2>
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

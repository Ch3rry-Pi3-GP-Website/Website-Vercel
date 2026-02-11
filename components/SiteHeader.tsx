export default function SiteHeader() {
  const navItems = [
    { label: "Overview", href: "/overview" },
    { label: "Collaboration", href: "/collaboration" },
    { label: "Workflow", href: "/workflow" },
    { label: "Pilot App", href: "/pilot" },
    { label: "Governance", href: "/governance" },
  ];

  return (
    <header className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 rounded-2xl bg-[var(--color-accent)] shadow-lg shadow-teal-200/60">
          <span className="absolute left-1/2 top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          <span className="absolute left-1/2 top-1/2 h-1 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-[var(--color-ink-soft)]">
            GP Diagnostic Aide
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Clinical decision support
          </p>
        </div>
      </div>
      <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] md:flex">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="transition hover:text-[var(--color-ink)]"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <a
        className="hidden rounded-full border border-[var(--color-border)] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)] shadow-sm transition hover:-translate-y-0.5 md:inline-flex"
        href="/pilot"
      >
        Pilot App
      </a>
    </header>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DecisionFlow, { type DecisionSession } from "@/components/DecisionFlow";
import { decisionTreeMap } from "@/lib/decisionTrees";

type SummaryPayload = {
  treeId: string;
  treeLabel: string;
  steps: Array<{
    step: number;
    title: string;
    prompt?: string | null;
    selectedOption?: string | null;
    type: "question" | "action";
    content?: string[];
  }>;
  outcome?: {
    title: string;
    content?: string[];
  };
};

type SummaryState = {
  status: "idle" | "loading" | "success" | "error";
  summary?: string;
  error?: string;
};

const buildSummaryPayload = (session: DecisionSession | null): SummaryPayload | null => {
  if (!session?.treeId) return null;
  const tree = decisionTreeMap[session.treeId];
  if (!tree || session.history.length === 0) return null;

  const steps = session.history.map((entry, index) => {
    const node = tree.nodes[entry.nodeId];
    return {
      step: index + 1,
      title: node.title,
      prompt: node.prompt ?? null,
      selectedOption: entry.selectedOption ?? null,
      type: node.type,
      content: node.content ?? [],
    };
  });

  const finalNode = tree.nodes[session.history[session.history.length - 1].nodeId];

  return {
    treeId: tree.id,
    treeLabel: tree.label,
    steps,
    outcome: {
      title: finalNode.title,
      content: finalNode.content ?? [],
    },
  };
};

export default function PilotApp() {
  const [session, setSession] = useState<DecisionSession | null>(null);
  const [summaryState, setSummaryState] = useState<SummaryState>({
    status: "idle",
  });

  const payload = useMemo(() => buildSummaryPayload(session), [session]);
  const hasSelections = useMemo(
    () => payload?.steps.some((step) => step.selectedOption) ?? false,
    [payload]
  );

  useEffect(() => {
    setSummaryState((prev) =>
      prev.status === "idle" ? prev : { status: "idle" }
    );
  }, [payload?.steps.length, session?.treeId]);

  const handleSummarise = async () => {
    if (!payload) return;
    setSummaryState({ status: "loading" });
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to summarise.");
      }
      setSummaryState({ status: "success", summary: data.summary });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error.";
      setSummaryState({ status: "error", error: message });
    }
  };

  return (
    <div className="space-y-10">
      <DecisionFlow onSessionChange={setSession} />

      <div className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-6 shadow-xl shadow-slate-200/70">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
              GP summary draft
            </p>
            <h3 className="mt-2 font-serif text-2xl text-[var(--color-ink)]">
              Convert the pathway into a clinical note
            </h3>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Generate a prose summary that documents the questions asked, the
              responses selected, and the suggested pathway outcome.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSummarise}
            disabled={!payload || !hasSelections || summaryState.status === "loading"}
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {summaryState.status === "loading" ? "Summarising..." : "Summarise"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-shell)] p-4 text-sm text-[var(--color-muted)]">
          {summaryState.status === "idle" &&
            "Complete the pathway and click Summarise to generate a draft note."}
          {summaryState.status === "loading" &&
            "Generating a structured summary for the GP."}
          {summaryState.status === "error" && (
            <span className="text-rose-600">{summaryState.error}</span>
          )}
          {summaryState.status === "success" && summaryState.summary && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mt-3 text-sm text-[var(--color-ink)]">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[var(--color-ink)]">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-ink-soft)]">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
              }}
            >
              {summaryState.summary}
            </ReactMarkdown>
          )}
        </div>

        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Draft output only. Clinicians remain responsible for final decisions.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AreaSelector from "@/components/AreaSelector";
import EarsAssessmentFlow, {
  type EarAssessmentSession,
} from "@/components/EarsAssessmentFlow";
import type { EarAssessmentSummaryPayload } from "@/lib/earsAssessment";

type SummaryState = {
  status: "idle" | "loading" | "success" | "error";
  summary?: string;
  error?: string;
  generatedAt?: string;
};

export default function PilotApp() {
  const [area, setArea] = useState<"ears" | "nose" | "throat">("ears");
  const [audience, setAudience] = useState<"clinician" | "patient">("patient");
  const [session, setSession] = useState<EarAssessmentSession | null>(null);
  const [summaryState, setSummaryState] = useState<SummaryState>({
    status: "idle",
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const noteRef = useRef<HTMLDivElement | null>(null);

  const payload = useMemo<EarAssessmentSummaryPayload | null>(
    () => session?.summaryPayload ?? null,
    [session]
  );

  useEffect(() => {
    if (area !== "ears") {
      setSession(null);
    }
  }, [area]);

  useEffect(() => {
    setSummaryState((prev) =>
      prev.status === "idle" ? prev : { status: "idle" }
    );
    setDownloadError(null);
  }, [payload, session?.isComplete, area]);

  const formattedDate = useMemo(() => {
    if (!summaryState.generatedAt) return null;
    const date = new Date(summaryState.generatedAt);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }, [summaryState.generatedAt]);

  const handleSummarise = async () => {
    if (!payload) return;
    setSummaryState({ status: "loading" });
    setDownloadError(null);
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to generate report.");
      }
      setSummaryState({
        status: "success",
        summary: data.summary,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error.";
      setSummaryState({ status: "error", error: message });
    }
  };

  const handleDownloadPdf = async () => {
    if (!noteRef.current || summaryState.status !== "success") return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const canvas = await html2canvas(noteRef.current, {
        scale: 2,
        backgroundColor: "#f3f6fb",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 36;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pageWidth - margin * 2;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxHeight = pageHeight - margin * 2;
      if (imgHeight > maxHeight) {
        const scale = maxHeight / imgHeight;
        imgHeight *= scale;
        imgWidth *= scale;
      }
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      const dateStamp = summaryState.generatedAt
        ? summaryState.generatedAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      pdf.save(`gp-summary-${dateStamp}.pdf`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Download failed.";
      setDownloadError(message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-[var(--color-border)] bg-white/80 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Decision support prototype
            </p>
            <h3 className="mt-2 font-serif text-2xl text-[var(--color-ink)]">
              Select a symptom area to begin
            </h3>
          </div>
          <AreaSelector value={area} onChange={setArea} />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {[
            { id: "patient" as const, label: "Patient" },
            { id: "clinician" as const, label: "Clinician" },
          ].map((entry) => {
            const isActive = audience === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setAudience(entry.id)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-lg"
                    : "border-[var(--color-border)] bg-white/80 text-[var(--color-ink)] hover:-translate-y-0.5"
                }`}
              >
                {entry.label}
              </button>
            );
          })}
          <span className="text-xs text-[var(--color-muted)]">
            Wording adjusts for patient or clinician use.
          </span>
        </div>
      </div>

      {area === "ears" ? (
        <EarsAssessmentFlow audience={audience} onSessionChange={setSession} />
      ) : (
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/80 p-6 text-sm text-[var(--color-muted)] shadow-xl">
          The {area === "nose" ? "nose" : "throat and neck"} pathway is being
          reworked. Please select ears for now.
        </div>
      )}

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
              Generate a structured summary that captures symptoms, questions
              asked, likely diagnosis, and expectations for care.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSummarise}
            disabled={
              !payload || !session?.isComplete || summaryState.status === "loading"
            }
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {summaryState.status === "loading"
              ? "Generating report..."
              : "Generate Report"}
          </button>
        </div>

        <div
          ref={noteRef}
          className="mt-6 overflow-x-auto rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-shell)] p-4 text-sm text-[var(--color-muted)]"
        >
          {summaryState.status === "idle" &&
            "Complete the assessment and click Generate Report to create a draft note."}
          {summaryState.status === "loading" &&
            "Generating the report summary."}
          {summaryState.status === "error" && (
            <span className="text-rose-600">{summaryState.error}</span>
          )}
          {summaryState.status === "success" && summaryState.summary && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Date of diagnosis
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                {formattedDate ?? "Pending"}
              </p>
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
                  h4: ({ children }) => (
                    <h4 className="mt-6 font-serif text-lg text-[var(--color-ink)]">
                      {children}
                    </h4>
                  ),
                  table: ({ children }) => (
                    <table className="mt-4 w-full border-separate border-spacing-0 text-sm text-[var(--color-ink)]">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="text-left text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="text-[var(--color-ink-soft)]">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="align-top">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="border border-transparent px-3 py-2 font-semibold text-[var(--color-ink)]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-transparent px-3 py-2 align-top text-[var(--color-ink-soft)]">
                      {children}
                    </td>
                  ),
                }}
              >
                {summaryState.summary}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          {downloadError && (
            <span className="text-xs text-rose-600">{downloadError}</span>
          )}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={summaryState.status !== "success" || isDownloading}
            className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>

        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Draft output only. Clinicians remain responsible for final decisions.
        </p>
      </div>
    </div>
  );
}

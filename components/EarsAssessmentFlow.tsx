"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildEarsSummaryPayload,
  computeEarsAssessment,
  earSymptoms,
  type EarAnswerEvent,
  type EarAssessmentSummaryPayload,
  type EarQuestionStep,
  type EarResponses,
} from "@/lib/earsAssessment";

export type EarAssessmentSession = {
  area: "ears";
  responses: EarResponses;
  isComplete: boolean;
  currentStep: EarQuestionStep | null;
  summaryPayload: EarAssessmentSummaryPayload | null;
  answeredCount: number;
  totalQuestions: number;
};

type EarsAssessmentFlowProps = {
  audience: "clinician" | "patient";
  onSessionChange?: (session: EarAssessmentSession) => void;
};

const buildTotalQuestions = () => {
  return earSymptoms.reduce((count, symptom) => {
    return count + 1 + symptom.followUps.length;
  }, 0);
};

const totalQuestions = buildTotalQuestions();

export default function EarsAssessmentFlow({
  audience,
  onSessionChange,
}: EarsAssessmentFlowProps) {
  const [events, setEvents] = useState<EarAnswerEvent[]>([]);

  const assessment = useMemo(
    () => computeEarsAssessment(events, audience),
    [events, audience]
  );

  const session = useMemo<EarAssessmentSession>(() => {
    const summaryPayload = assessment.isComplete
      ? buildEarsSummaryPayload(assessment.responses, audience)
      : null;
    return {
      area: "ears",
      responses: assessment.responses,
      isComplete: assessment.isComplete,
      currentStep: assessment.currentStep,
      summaryPayload,
      answeredCount: events.length,
      totalQuestions,
    };
  }, [assessment, events.length, audience]);

  const screenedCount = useMemo(() => {
    return earSymptoms.filter(
      (symptom) => session.responses[symptom.id].present !== null
    ).length;
  }, [session.responses]);

  const reviewRows = useMemo(() => {
    return earSymptoms.flatMap((symptom) => {
      const response = assessment.responses[symptom.id];
      const rows = [];
      const initialQuestion =
        audience === "clinician"
          ? symptom.initialPromptClinician
          : symptom.initialPromptPatient;
      const initialAnswer =
        response.answers[`initial_${symptom.id}`] ??
        (response.present ? "Yes" : "No");
      rows.push({
        symptom: symptom.label,
        question: initialQuestion,
        answer: initialAnswer,
      });
      symptom.followUps.forEach((question) => {
        const answer = response.answers[question.id];
        if (answer) {
          rows.push({
            symptom: symptom.label,
            question: question.prompt,
            answer,
          });
        }
      });
      return rows;
    });
  }, [assessment.responses, audience]);

  useEffect(() => {
    if (onSessionChange) {
      onSessionChange(session);
    }
  }, [session, onSessionChange]);

  const handleAnswer = (answer: string) => {
    if (!assessment.currentStep) return;
    setEvents((prev) => [
      ...prev,
      {
        symptomId: assessment.currentStep!.symptomId,
        questionId: assessment.currentStep!.questionId,
        kind: assessment.currentStep!.kind,
        value: answer,
      },
    ]);
  };

  const handleBack = () => {
    setEvents((prev) => prev.slice(0, -1));
  };

  const handleRestart = () => {
    setEvents([]);
  };

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white/80 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Ear assessment
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[var(--color-ink)]">
            Sequential symptom screening
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Each symptom is screened in order. If present, follow-up questions
            are asked before moving to the next symptom.
          </p>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]">
          Symptoms screened: {screenedCount} / {earSymptoms.length}
        </div>
      </div>

      {assessment.isComplete ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-shell)] p-6 text-sm text-[var(--color-muted)]">
            Assessment complete. Review your answers below before generating the report.
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Review answers
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Check your responses. If anything is incorrect, restart the assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)] transition"
              >
                Restart assessment
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-sm text-[var(--color-ink)]">
                <thead className="text-left text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  <tr>
                    <th className="border border-transparent px-3 py-2 font-semibold">
                      Symptom
                    </th>
                    <th className="border border-transparent px-3 py-2 font-semibold">
                      Question
                    </th>
                    <th className="border border-transparent px-3 py-2 font-semibold">
                      Answer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[var(--color-ink-soft)]">
                  {reviewRows.map((row, index) => (
                    <tr key={`${row.symptom}-${row.question}-${index}`}>
                      <td className="border border-transparent px-3 py-2 align-top">
                        {row.symptom}
                      </td>
                      <td className="border border-transparent px-3 py-2 align-top">
                        {row.question}
                      </td>
                      <td className="border border-transparent px-3 py-2 align-top font-semibold text-[var(--color-ink)]">
                        {row.answer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : assessment.currentStep ? (
        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[0.4fr_0.6fr]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5 shadow-lg h-full min-h-[320px] lg:min-h-[400px]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Current symptom
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
              {assessment.currentStep.symptomLabel}
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              {assessment.currentStep.kind === "initial"
                ? "Screening question"
                : "Follow-up question"}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={events.length === 0}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)] transition"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-6 shadow-xl h-full min-h-[320px] lg:min-h-[400px]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Question
            </p>
            <h4 className="mt-3 font-serif text-2xl text-[var(--color-ink)]">
              {assessment.currentStep.prompt}
            </h4>
            {assessment.currentStep.description && (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {assessment.currentStep.description}
              </p>
            )}
            <div className="mt-6 grid gap-3">
              {assessment.currentStep.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  className="rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 text-left text-sm font-semibold text-[var(--color-ink)] shadow-sm transition hover:-translate-y-0.5"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Prototype only. Outputs support clinical reasoning and do not replace
        professional judgement.
      </p>
    </div>
  );
}

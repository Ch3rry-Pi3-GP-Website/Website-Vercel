"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  decisionTreeMap,
  decisionTrees,
  type DecisionNode,
  type DecisionOption,
} from "@/lib/decisionTrees";

export type DecisionHistoryEntry = {
  nodeId: string;
  selectedOption?: string;
};

const emphasisStyles: Record<string, string> = {
  urgent: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export type DecisionSession = {
  treeId: string | null;
  treeLabel?: string;
  history: DecisionHistoryEntry[];
  currentNode: DecisionNode | null;
};

type DecisionFlowProps = {
  onSessionChange?: (session: DecisionSession) => void;
};

export default function DecisionFlow({ onSessionChange }: DecisionFlowProps) {
  const [treeId, setTreeId] = useState<string | null>(null);
  const [history, setHistory] = useState<DecisionHistoryEntry[]>([]);
  const [micSupported, setMicSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const tree = useMemo(
    () => (treeId ? decisionTreeMap[treeId] : null),
    [treeId]
  );
  const currentNode = useMemo(() => {
    if (!tree || history.length === 0) return null;
    return tree.nodes[history[history.length - 1].nodeId] ?? null;
  }, [tree, history]);

  useEffect(() => {
    if (!onSessionChange) return;
    onSessionChange({
      treeId,
      treeLabel: tree?.label,
      history,
      currentNode,
    });
  }, [treeId, tree?.label, history, currentNode, onSessionChange]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setMicSupported(!!SpeechRecognition);
  }, []);

  const handleSelectTree = (id: string) => {
    const nextTree = decisionTreeMap[id];
    setTreeId(id);
    setHistory([{ nodeId: nextTree.rootId }]);
  };

  const getSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-GB";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
    }
    return recognitionRef.current;
  };

  const resolveTreeFromTranscript = (transcript: string) => {
    const normalised = transcript.toLowerCase();
    if (normalised.includes("throat") || normalised.includes("neck")) {
      return "throat";
    }
    if (normalised.includes("nose") || normalised.includes("nasal")) {
      return "nose";
    }
    if (normalised.includes("ear")) {
      return "ears";
    }
    return null;
  };

  const handleMicrophone = () => {
    setMicError(null);
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setMicSupported(false);
      setMicError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setLastTranscript(transcript);
      const target = resolveTreeFromTranscript(transcript);
      if (target) {
        handleSelectTree(target);
      } else {
        setMicError("Say ears, nose, or throat and neck.");
      }
    };

    recognition.onerror = (event: any) => {
      setMicError(event?.error ? `Mic error: ${event.error}` : "Mic error.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  };

  const handleOption = (option: DecisionOption) => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastEntry = updated[updated.length - 1];
      updated[updated.length - 1] = {
        ...lastEntry,
        selectedOption: option.label,
      };
      return [...updated, { nodeId: option.next }];
    });
  };

  const handleBack = () => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const handleRestart = () => {
    if (!tree) return;
    setHistory([{ nodeId: tree.rootId }]);
  };

  const handleResetAll = () => {
    setTreeId(null);
    setHistory([]);
  };

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white/80 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Decision support prototype
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[var(--color-ink)]">
            Select a symptom area to begin
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {decisionTrees.map((entry) => {
            const isActive = entry.id === treeId;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleSelectTree(entry.id)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-lg shadow-teal-200/60"
                    : "border-[var(--color-border)] bg-white/80 text-[var(--color-ink)] hover:-translate-y-0.5"
                }`}
              >
                {entry.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleMicrophone}
            disabled={!micSupported}
            className={`flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              isListening
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-lg shadow-teal-200/60"
                : "border-[var(--color-border)] bg-white/80 text-[var(--color-ink)] hover:-translate-y-0.5"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            title="Use microphone to select ears, nose, or throat and neck"
            aria-label="Select pathway by voice"
            aria-pressed={isListening}
          >
            {isListening ? (
              "Listening..."
            ) : (
              <span className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <path d="M12 19v4" />
                  <path d="M8 23h8" />
                </svg>
                Voice
              </span>
            )}
          </button>
        </div>
      </div>
      {(lastTranscript || micError) && (
        <div className="mt-3 text-xs text-[var(--color-muted)]">
          {lastTranscript && (
            <span className="mr-3">
              Heard: <span className="font-semibold">{lastTranscript}</span>
            </span>
          )}
          {micError && <span className="text-rose-600">{micError}</span>}
        </div>
      )}

      {!tree || !currentNode ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-shell)] p-8 text-sm text-[var(--color-muted)]">
          Choose a pathway to load the first question.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Pathway
              </p>
              <span className="rounded-full bg-[var(--color-ice)] px-3 py-1 text-xs font-semibold text-[var(--color-accent-strong)]">
                Step {history.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {history.map((entry, index) => {
                const node = tree.nodes[entry.nodeId];
                return (
                  <div
                    key={`${entry.nodeId}-${index}`}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-shell)] p-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      Step {index + 1}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                      {node.title}
                    </p>
                    {entry.selectedOption && (
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Selected: {entry.selectedOption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={history.length <= 1}
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
              <button
                type="button"
                onClick={handleResetAll}
                className="rounded-full border border-transparent bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition"
              >
                Switch area
              </button>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-6 shadow-xl ${
              currentNode.emphasis
                ? emphasisStyles[currentNode.emphasis]
                : "border-[var(--color-border)] bg-white/95 text-[var(--color-ink)]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                {currentNode.type === "question" ? "Question" : "Action"}
              </p>
              {currentNode.emphasis === "urgent" && (
                <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Urgent
                </span>
              )}
            </div>
            <h4 className="mt-3 font-serif text-2xl">{currentNode.title}</h4>
            {currentNode.prompt && (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {currentNode.prompt}
              </p>
            )}
            {currentNode.content && (
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-soft)]">
                {currentNode.content.map((line, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[var(--color-accent)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )}
            {currentNode.options && currentNode.options.length > 0 && (
              <div className="mt-6 grid gap-3">
                {currentNode.options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleOption(option)}
                    className="rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 text-left text-sm font-semibold text-[var(--color-ink)] shadow-sm transition hover:-translate-y-0.5"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            {!currentNode.options && (
              <p className="mt-6 text-xs text-[var(--color-muted)]">
                End of this pathway.
              </p>
            )}
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Prototype only. Outputs support clinical reasoning and do not replace
        professional judgement.
      </p>
    </div>
  );
}

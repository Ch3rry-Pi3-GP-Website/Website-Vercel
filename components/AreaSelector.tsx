"use client";

import { useEffect, useRef, useState } from "react";

type AreaId = "ears" | "nose" | "throat";

type AreaSelectorProps = {
  value: AreaId | null;
  onChange: (value: AreaId) => void;
};

const areaLabels: Record<AreaId, string> = {
  ears: "Ears",
  nose: "Nose",
  throat: "Throat + Neck",
};

export default function AreaSelector({ value, onChange }: AreaSelectorProps) {
  const [micSupported, setMicSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setMicSupported(!!SpeechRecognition);
  }, []);

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

  const resolveAreaFromTranscript = (transcript: string) => {
    const normalised = transcript.toLowerCase();
    if (normalised.includes("throat") || normalised.includes("neck")) {
      return "throat" as AreaId;
    }
    if (normalised.includes("nose") || normalised.includes("nasal")) {
      return "nose" as AreaId;
    }
    if (normalised.includes("ear")) {
      return "ears" as AreaId;
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
      const target = resolveAreaFromTranscript(transcript);
      if (target) {
        onChange(target);
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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(areaLabels) as AreaId[]).map((area) => {
          const isActive = area === value;
          const isDisabled = area !== "ears";
          return (
            <button
              key={area}
              type="button"
              onClick={() => onChange(area)}
              disabled={isDisabled}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-lg shadow-teal-200/60"
                  : "border-[var(--color-border)] bg-white/80 text-[var(--color-ink)] hover:-translate-y-0.5"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {areaLabels[area]}
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
          aria-pressed={isListening}
          title="Use microphone to select ears, nose, or throat and neck"
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
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Nose and throat/neck pathways are coming next.
      </p>
    </div>
  );
}

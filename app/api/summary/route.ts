import { NextResponse } from "next/server";
import { generateSummary, SummaryInputSchema } from "@/lib/llm/summaryGraph";

const MAX_BODY_BYTES = 50_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

type RateLimitRecord = { count: number; start: number };

const getRateLimitStore = () => {
  const globalForRateLimit = globalThis as typeof globalThis & {
    __summaryRateLimit?: Map<string, RateLimitRecord>;
  };
  if (!globalForRateLimit.__summaryRateLimit) {
    globalForRateLimit.__summaryRateLimit = new Map();
  }
  return globalForRateLimit.__summaryRateLimit;
};

const getClientId = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  return realIp ?? "unknown";
};

const rateLimit = (request: Request) => {
  const store = getRateLimitStore();
  const id = getClientId(request);
  const now = Date.now();
  const record = store.get(id);
  if (!record || now - record.start > RATE_LIMIT_WINDOW_MS) {
    store.set(id, { count: 1, start: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetMs: RATE_LIMIT_WINDOW_MS };
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetMs: RATE_LIMIT_WINDOW_MS - (now - record.start) };
  }
  record.count += 1;
  store.set(id, record);
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetMs: RATE_LIMIT_WINDOW_MS - (now - record.start) };
};

const SYMPTOMS_HEADING_REGEX = /^####\s*Symptoms/i;
const ALT_DIAGNOSIS_HEADING = "#### Alternative diagnoses";

const validateSummary = (summary: string) => {
  if (summary.includes("```")) {
    return { ok: false, error: "Summary contains code fences." };
  }
  if (/provisional/i.test(summary)) {
    return { ok: false, error: "Summary uses prohibited wording." };
  }

  const requiredHeadings = [
    "#### Diagnosis",
    "#### Alternative diagnoses",
    "#### Recommended further steps",
    "#### Potential treatment options",
  ];

  const lines = summary.split(/\r?\n/).map((line) => line.trim());
  const firstNonEmpty = lines.find((line) => line.length > 0);
  if (!firstNonEmpty || !SYMPTOMS_HEADING_REGEX.test(firstNonEmpty)) {
    return { ok: false, error: "Summary must start with the Symptoms section." };
  }

  const symptomsHeadingIndex = lines.findIndex((line) =>
    SYMPTOMS_HEADING_REGEX.test(line)
  );
  if (symptomsHeadingIndex === -1) {
    return { ok: false, error: "Symptoms section heading is missing." };
  }

  let lastIndex = -1;
  for (const heading of requiredHeadings) {
    const idx = summary.indexOf(heading);
    if (idx === -1) {
      return { ok: false, error: `Missing section heading: ${heading}` };
    }
    if (idx <= lastIndex) {
      return { ok: false, error: "Section order is incorrect." };
    }
    lastIndex = idx;
  }

  const hasTableHeader = /\|\s*Symptom\s*\|\s*Question\s*\|\s*Answer\s*\|/i.test(summary);
  if (!hasTableHeader) {
    return { ok: false, error: "Summary table header is missing." };
  }

  if (
    !summary.includes("Based on your answers to the questions") &&
    !summary.includes("Based on the answers to the questions")
  ) {
    return { ok: false, error: "Diagnosis sentence missing required phrase." };
  }

  const lastNonEmpty = summary
    .split(/\r?\n/)
    .reverse()
    .find((line) => line.trim().length > 0);
  if (lastNonEmpty !== "Clinician review required.") {
    return { ok: false, error: "Summary must end with Clinician review required." };
  }

  return { ok: true as const };
};

const normaliseSummary = (summary: string) => {
  const lines = summary.split(/\r?\n/);
  const symptomIndex = lines.findIndex((line) =>
    SYMPTOMS_HEADING_REGEX.test(line.trim())
  );
  if (symptomIndex > 0) {
    return lines.slice(symptomIndex).join("\n").trim();
  }
  return summary.trim();
};

const buildAlternativeDiagnosesText = (alternatives: string[]) => {
  if (alternatives.length === 0) {
    return "No other possible diagnoses were suggested by the logic. A proper consultation is required to confirm the diagnosis.";
  }
  const list = alternatives.join(", ");
  return `Other possible diagnoses include ${list}. A proper consultation is required to confirm the diagnosis.`;
};

const enforceAlternativeDiagnosesSection = (
  summary: string,
  alternatives: string[]
) => {
  const replacement = buildAlternativeDiagnosesText(alternatives);
  const regex = /(#### Alternative diagnoses\s*)([\s\S]*?)(?=^####\s|\s*$)/m;
  if (!regex.test(summary)) {
    return summary;
  }
  return summary.replace(regex, `$1\n${replacement}\n\n`);
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const rate = rateLimit(request);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: "Rate limit exceeded." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rate.resetMs / 1000).toString(),
          },
        }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Request payload too large." },
        { status: 413 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Request payload too large." },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const parsed = SummaryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid summary payload." },
        { status: 400 }
      );
    }

    const generateWithValidation = async () => {
      const result = await generateSummary(parsed.data);
      let summary = normaliseSummary(result.summary ?? "");
      summary = enforceAlternativeDiagnosesSection(
        summary,
        parsed.data.alternateDiagnoses ?? []
      );
      if (!summary) {
        return {
          ok: false,
          error: "Summary generation failed.",
          summary: "",
        };
      }
      const summaryValidation = validateSummary(summary);
      if (!summaryValidation.ok) {
        return { ok: false, error: summaryValidation.error, summary };
      }
      return { ok: true, summary, error: "" };
    };

    const firstAttempt = await generateWithValidation();
    if (!firstAttempt.ok) {
      const secondAttempt = await generateWithValidation();
      if (!secondAttempt.ok) {
        return NextResponse.json(
          { ok: false, error: secondAttempt.error || firstAttempt.error },
          { status: 422 }
        );
      }
      return NextResponse.json({ ok: true, summary: secondAttempt.summary });
    }
    return NextResponse.json({ ok: true, summary: firstAttempt.summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

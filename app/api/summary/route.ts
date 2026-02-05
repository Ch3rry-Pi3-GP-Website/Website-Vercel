import { NextResponse } from "next/server";
import { generateSummary, SummaryInputSchema } from "@/lib/llm/summaryGraph";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = SummaryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid summary payload." },
        { status: 400 }
      );
    }

    const result = await generateSummary(parsed.data);
    return NextResponse.json({ ok: true, summary: result.summary ?? "" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

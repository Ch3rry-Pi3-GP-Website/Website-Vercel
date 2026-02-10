import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryRevisionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are revising a summary based on QA feedback.

Context engineering:
- Context: You will receive the original pathway data, the draft summary, and QA issues.
- Task: Produce a corrected summary that satisfies all constraints.
- Constraints: Use only provided data; no hallucinations; British English; <= 200 words; Markdown format with an overall paragraph plus sections: **Symptoms identified and information**, **Likely diagnosis**, **Expectations for treatment or further investigation**; the overall paragraph must reflect the audience (patient vs clinician) and state the diagnosis is provisional and may require confirmation; the symptoms section must include an intro sentence plus a Markdown table with columns Symptom | Identified | Details; the Likely diagnosis section must be a short paragraph (no bullet list) with lay term plus medical term in brackets; expectations should be a hyphen bullet list; mention once that blue boxes represent symptoms and white boxes represent questions used to gather detail; mention that other screened symptoms were asked about but not reported; final line must be "Clinician review required."
- Output: Return only the revised Markdown summary. No extra commentary.`,
  ],
  [
    "human",
    `Pathway data:
{context}

Draft summary:
{draft}

QA issues:
{issues}

Required fixes:
{fixes}`
  ]
]);

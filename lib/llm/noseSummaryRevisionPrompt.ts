import { ChatPromptTemplate } from "@langchain/core/prompts";

export const noseSummaryRevisionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are revising a nose summary based on QA feedback.

Context engineering:
- Context: You will receive original pathway data, a draft summary, and QA issues/fixes.
- Task: Produce a corrected summary that satisfies all constraints.
- Constraints: Use only provided data; no hallucinations; British English; <= 220 words. No code fences. Do not use the word "provisional".
- Output format must be:
  1) "#### Symptoms identified and information" with one intro sentence and a Markdown table (Symptom | Question | Answer) matching questionsAsked order and verbatim question/answer text. For repeated questions under the same symptom, leave the Symptom cell blank after the first row.
  2) "#### Diagnosis" with one short sentence containing "Based on your answers to the questions" (patient) or "Based on the answers to the questions" (clinician), naming the most likely diagnosis (lay term + medical term in brackets).
  3) "#### Alternative diagnoses" listing alternateDiagnoses only (or explicitly none), ending with consultation-required wording.
  4) "#### Review and next steps" with one short introductory sentence plus:
     - "##### Resolved"
     - "##### Unresolved"
     Use reviewAndNextSteps content only.
  5) "#### Potential treatment options" as hyphen bullets derived from expectations using expectation text verbatim.
  6) Final line: "Clinician review required."
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
{fixes}`,
  ],
]);

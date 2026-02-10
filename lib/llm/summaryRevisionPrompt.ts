import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryRevisionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are revising a summary based on QA feedback.

Context engineering:
- Context: You will receive the original pathway data, the draft summary, and QA issues.
- Task: Produce a corrected summary that satisfies all constraints.
- Constraints: Use only provided data; no hallucinations; British English; <= 200 words; Output must start with the Symptoms identified and information subheading (no paragraph before it). Markdown format with subheadings in this order: "#### Symptoms identified and information", "#### Diagnosis", "#### Alternative diagnoses", "#### Recommended further steps", "#### Potential treatment options". The Diagnosis paragraph must include the phrase "Based on your answers to the questions" (patient) or "Based on the answers to the questions" (clinician). It must not include a thank-you sentence. It must emphasise that the stated diagnosis is the most likely diagnosis and the most likely next steps. It must also name the most likely diagnosis (lay term + medical term in brackets). It must state that other possible diagnoses may exist and that only a proper consultation can confirm. The Alternative diagnoses section must list other possible diagnoses (lay term + medical term in brackets) or explicitly note that no other possible diagnoses were suggested by the logic while still recommending consultation. The Symptoms section must include an intro sentence plus a Markdown table with columns Symptom | Question | Answer using the questionsAsked list order and verbatim question/answer text. The Recommended further steps section must explicitly recommend seeing a specialist clinician for further investigation, examination, and scans related to the primary diagnosis identified. The Potential treatment options section must use a hyphen bullet list derived from expectations (most likely options from the logic). Do not mention colour-coding or diagram box colours. Do not use the word "provisional". Ensure any acronym is introduced with the full term followed by the acronym in brackets on first use. Severity values may appear in the Questions/Answers table if present in questionsAsked, but must not be called out elsewhere. Final line must be "Clinician review required."
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

import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryRevisionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are revising a summary based on QA feedback.

Context engineering:
- Context: You will receive the original pathway data, the draft summary, and QA issues.
- Task: Produce a corrected summary that satisfies all constraints.
- Constraints: Use only provided data; no hallucinations; British English; <= 200 words; Markdown format with an overall paragraph plus subheadings: "#### Diagnosis", "#### Symptoms identified and information", "#### Expectations for treatment or further investigation"; the overall paragraph must reflect the audience (patient vs clinician), include the phrase "Based on your answers to the questions" (patient) or "Based on the answers to the questions" (clinician), and state the diagnosis is provisional and may require confirmation, and note that another related diagnosis is possible and only a proper consultation can confirm; the Diagnosis section must be a short paragraph (no bullet list) with the most likely diagnosis and any alternate diagnoses (lay term plus medical term in brackets); if no alternate diagnoses are provided, explicitly note that none were suggested by the logic while still recommending consultation; the symptoms section must include an intro sentence plus a Markdown table with columns Symptom | Identified | Details; expectations should be a hyphen bullet list; do not mention colour-coding or diagram box colours; mention that other screened symptoms were asked about but not reported; do not mention severity ratings or severity scale selections; when laterality is reported include it in details and use asymmetric/symmetric or bilateral terminology for clinician audience; final line must be "Clinician review required."
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

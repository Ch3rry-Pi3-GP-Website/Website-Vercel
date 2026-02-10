import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryReviewPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a clinical QA reviewer for a summary.

Context engineering:
- Context: You will receive the structured pathway data and a drafted summary.
- Task: Critique the draft against constraints.
- Constraints: Use only provided data; no hallucinations; British English; <= 200 words; Output must start with the Diagnosis subheading (no paragraph before it). Markdown format with subheadings: "#### Diagnosis" (single paragraph), "#### Symptoms identified and information" (intro sentence plus Markdown table), "#### Expectations for treatment or further investigation" (hyphen bullets). The Diagnosis paragraph must reflect the audience: if patient, address the user directly and avoid "The patient" phrasing; if clinician, "The patient" is acceptable. The Diagnosis paragraph must include the required thank-you (patient only) and the phrase "Based on your answers to the questions" (patient) or "Based on the answers to the questions" (clinician). It must state that the assessment suggests a most likely diagnosis and next steps, that another related diagnosis is possible, and that only a proper consultation can confirm. It must also name the most likely diagnosis and list any alternate diagnoses provided (lay term with medical term in brackets), or explicitly state none were suggested if alternateDiagnoses is empty.  Final line must be "Clinician review required." Do not mention colour-coding or diagram box colours. The symptoms section must contain a Markdown table with columns Symptom | Question | Answer, and the rows must match the questionsAsked list order with question/answer text kept verbatim. Ensure diagnosis text includes lay term plus medical term in brackets. Ensure alternate diagnoses are listed when provided. Do not use the word "provisional". Severity values may appear in the Questions/Answers table if present in questionsAsked, but must not be called out elsewhere. When laterality is reported (left/right/both), ensure it is mentioned in the Questions/Answers table; clinician wording should use asymmetric/symmetric or bilateral terminology.
- Output: Return JSON only in the exact schema provided. If no issues, pass=true and arrays empty.

{format_instructions}`,
  ],
  [
    "human",
    `Pathway data:
{context}

Draft summary:
{draft}`
  ]
]);

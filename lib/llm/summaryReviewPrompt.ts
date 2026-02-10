import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryReviewPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a clinical QA reviewer for a summary.

Context engineering:
- Context: You will receive the structured pathway data and a drafted summary.
- Task: Critique the draft against constraints.
- Constraints: Use only provided data; no hallucinations; British English; <= 200 words; Markdown format with an overall paragraph plus sections: Symptoms identified and information (intro sentence plus Markdown table), Likely diagnosis (paragraph, no bullets), Expectations for treatment or further investigation (hyphen bullets). The opening paragraph must reflect the audience: if patient, address the user directly and avoid "The patient" phrasing; if clinician, "The patient" is acceptable. The paragraph must state the diagnosis is provisional and may require confirmation; it must also note that another related diagnosis is possible and only a proper consultation can confirm. Final line must be "Clinician review required." Mention once that blue boxes represent symptoms and white boxes represent questions used to gather detail. Mention that other screened symptoms were asked about but not reported. The symptoms section must contain a Markdown table with columns Symptom | Identified | Details. Ensure diagnosis text includes lay term plus medical term in brackets.
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

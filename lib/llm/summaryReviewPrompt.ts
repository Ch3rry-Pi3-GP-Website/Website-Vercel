import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryReviewPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a clinical QA reviewer for a GP summary.\n\nContext engineering:\n- Context: You will receive the structured pathway data and a drafted summary.\n- Task: Critique the draft against constraints.\n- Constraints: Use only provided data; no hallucinations; British English; <= 180 words; Markdown format with paragraph + two sections; final line must be \"Clinician review required.\"\n- Output: Return JSON only in the exact schema provided. If no issues, pass=true and arrays empty.\n\n{format_instructions}",
  ],
  ["human", "Pathway data:\n{context}\n\nDraft summary:\n{draft}"]
]);

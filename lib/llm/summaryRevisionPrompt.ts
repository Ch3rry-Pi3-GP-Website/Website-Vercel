import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryRevisionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are revising a GP summary based on QA feedback.\n\nContext engineering:\n- Context: You will receive the original pathway data, the draft summary, and QA issues.\n- Task: Produce a corrected summary that satisfies all constraints.\n- Constraints: Use only provided data; no hallucinations; British English; <= 180 words; Markdown format with paragraph + **Questions and responses** list + **Suggested next actions** list; final line must be \"Clinician review required.\"\n- Output: Return only the revised Markdown summary. No extra commentary.",
  ],
  [
    "human",
    "Pathway data:\n{context}\n\nDraft summary:\n{draft}\n\nQA issues:\n{issues}\n\nRequired fixes:\n{fixes}"
  ]
]);

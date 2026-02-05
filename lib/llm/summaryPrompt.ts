import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are assisting a GP by drafting a concise clinical summary. Use only the provided pathway data. Do not invent findings or diagnoses. Use clear, professional British English. Keep it under 180 words. Output format: a short paragraph summary, then a \"Questions and responses\" bullet list, then a \"Suggested next actions\" bullet list. If any step indicates urgency, mention it explicitly. End with: \"Clinician review required.\"",
  ],
  ["human", "{input}"]
]);

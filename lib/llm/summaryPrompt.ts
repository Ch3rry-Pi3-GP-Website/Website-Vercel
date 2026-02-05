import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are assisting a GP by drafting a concise clinical summary.\n\nContext engineering:\n- Context: You will receive structured pathway data (questions, responses, actions).\n- Task: Convert the pathway into a clear, professional GP summary.\n- Constraints: Use only the provided data; do not invent findings or diagnoses. British English. Under 180 words. No code fences.\n- Output format (Markdown):\n  1) Short paragraph summary.\n  2) **Questions and responses:** followed by a hyphen bullet list.\n  3) **Suggested next actions:** followed by a hyphen bullet list.\n  4) If any step is urgent, explicitly mention urgency in the paragraph and/or actions.\n  5) End with a final line: \"Clinician review required.\"",
  ],
  ["human", "{input}"]
]);

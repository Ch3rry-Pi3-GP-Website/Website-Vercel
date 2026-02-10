import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryRevisionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are revising a GP summary based on QA feedback.\n\nContext engineering:\n- Context: You will receive the original pathway data, the draft summary, and QA issues.\n- Task: Produce a corrected summary that satisfies all constraints.\n- Constraints: Use only provided data; no hallucinations; British English; <= 200 words; Markdown format with an overall paragraph plus sections: **Symptoms identified and information**, **Likely diagnosis**, **Expectations for treatment or further investigation**; final line must be \"Clinician review required.\" Mention once that blue boxes represent symptoms and white boxes represent questions used to gather detail. Mention that other screened symptoms were asked about but not reported.\n- Output: Return only the revised Markdown summary. No extra commentary.",
  ],
  [
    "human",
    "Pathway data:\n{context}\n\nDraft summary:\n{draft}\n\nQA issues:\n{issues}\n\nRequired fixes:\n{fixes}"
  ]
]);

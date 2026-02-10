import { ChatPromptTemplate } from "@langchain/core/prompts";

export const summaryRevisionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are revising a summary based on QA feedback.

Context engineering:
- Context: You will receive the original pathway data, the draft summary, and QA issues.
- Task: Produce a corrected summary that satisfies all constraints.
- Constraints: Use only provided data; no hallucinations; British English; <= 200 words; Output must start with the Diagnosis subheading (no paragraph before it). Markdown format with subheadings: "#### Diagnosis", "#### Alternative diagnoses", "#### Symptoms identified and information", "#### Expectations for treatment or further investigation". The Diagnosis paragraph must include the required thank-you (patient only) and the phrase "Based on your answers to the questions" (patient) or "Based on the answers to the questions" (clinician). It must emphasise that the stated diagnosis is the most likely diagnosis and the most likely next steps, with an explicit sentence such as "This is the most likely diagnosis." It must also name the most likely diagnosis (lay term + medical term in brackets). It must state that other possible diagnoses may exist and that only a proper consultation can confirm. The Alternative diagnoses section must list other possible diagnoses (lay term + medical term in brackets) or explicitly note that no other possible diagnoses were suggested by the logic while still recommending consultation. The Symptoms section must include an intro sentence plus a Markdown table with columns Symptom | Question | Answer using the questionsAsked list order and verbatim question/answer text. Expectations should be a hyphen bullet list. Do not mention colour-coding or diagram box colours. Do not use the word "provisional". Ensure any acronym is introduced with the full term followed by the acronym in brackets on first use. Severity values may appear in the Questions/Answers table if present in questionsAsked, but must not be called out elsewhere. Final line must be "Clinician review required."
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

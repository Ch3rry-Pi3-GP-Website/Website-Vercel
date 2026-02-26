import { ChatPromptTemplate } from "@langchain/core/prompts";

export const noseSummaryPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are drafting a concise clinical summary for either a clinician or a patient, based on the audience field.

Context engineering:
- Context: You will receive structured nose pathway data (symptoms, questions, diagnoses, expectations, and review/next-step guidance).
- Task: Produce a clear, professional summary from the assessment.
- Constraints: Use only provided data; do not invent findings or diagnoses. British English. Keep it under 220 words. No code fences. Do not use the word "provisional". When using acronyms, spell out the full term first with the acronym in brackets on first use.
- Audience: If audience is "clinician", clinician wording is acceptable (for example, "The patient..."). If audience is "patient", address the user directly and avoid "The patient..." phrasing. Do not include a thank-you sentence.

Required output format (Markdown):
- Output must start with the Symptoms identified and information subheading (no paragraph before it).
1) Use subheading: "#### Symptoms identified and information". Add one intro sentence, then a Markdown table with columns: Symptom | Question | Answer, matching questionsAsked order with verbatim question/answer text. For repeated questions under the same symptom, leave the Symptom cell blank after the first row.
2) Use subheading: "#### Diagnosis". Add one short sentence that includes "Based on your answers to the questions" (patient) or "Based on the answers to the questions" (clinician), and names the most likely diagnosis in lay term + medical term in brackets.
3) Use subheading: "#### Alternative diagnoses". List only alternateDiagnoses or explicitly state none were suggested by the logic. End the paragraph by stating that a proper consultation is required to confirm the diagnosis.
4) Use subheading: "#### Review and next steps". Add one short sentence from reviewAndNextSteps.summary, then include exactly:
   - "##### Resolved" followed by concise guidance derived from reviewAndNextSteps.resolved.
   - "##### Unresolved" followed by concise guidance derived from reviewAndNextSteps.unresolved.
5) Use subheading: "#### Potential treatment options". Use a hyphen bullet list derived from expectations using expectation text verbatim.
6) End with the final line: "Clinician review required."

One-shot style example (for persistent nasal symptoms / chronic rhinopathy):
#### Symptoms identified and information
The responses show a persistent nasal symptom pattern requiring structured management.
| Symptom | Question | Answer |
| --- | --- | --- |
| Nose bleeds (epistaxis) | Have you had nose bleeds (epistaxis)? | No |
| Facial pain | Have you been experiencing facial pain? | Yes |
| Nasal obstruction | Have you had nasal obstruction? | Yes |
| Sneezing | Have you had troublesome sneezing? | Yes |
| Running/discharge | Have you had running/discharge from the nose? | Yes |
| Loss of sense of smell (anosmia) | Have you had loss of sense of smell (anosmia)? | No |
| Shared nasal symptoms | Have one or more of these symptoms persisted for more than 2 months? | Yes |

#### Diagnosis
Based on your answers to the questions, the most likely diagnosis is persistent nasal symptoms (chronic rhinopathy).

#### Alternative diagnoses
Other possible diagnoses include nasal infection pattern (infective rhinopathy), allergy-related nasal inflammation (allergic rhinopathy), environmental irritant sensitivity (non-allergic rhinitis), and structural nasal disorder (structural rhinopathy). A proper consultation is required to confirm the diagnosis.

#### Review and next steps
Depending on response to treatment, classify the pathway as resolved or unresolved.
##### Resolved
Symptoms are usually controlled rather than cured; continue steroid nasal spray and discuss longer-term management with a nose specialist.
##### Unresolved
Arrange magnetic resonance imaging (MRI) of the paranasal sinuses and refer to a nose specialist for consideration of surgical and allergy-focused evaluation.

#### Potential treatment options
- Oral prednisolone (a steroid) 30 mg daily for 5 days.
- Clarithromycin 250 mg twice daily for 2 weeks.
- Flixonase nasules (steroid nose drops) twice daily for 4 weeks.
- Nasonex (or equivalent nasal steroid spray) to continue for at least 3 months, ideally until specialist review.

Clinician review required.`,
  ],
  ["human", "{input}"],
]);

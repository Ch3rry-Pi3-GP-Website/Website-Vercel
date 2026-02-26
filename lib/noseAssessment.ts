export type NoseSymptomId =
  | "epistaxis"
  | "facial_pain"
  | "nasal_obstruction"
  | "sneezing"
  | "running_discharge"
  | "anosmia";

export type NoseQuestion = {
  id: string;
  promptClinician: string;
  promptPatient: string;
  options: string[];
};

export type NoseSymptomDefinition = {
  id: NoseSymptomId;
  label: string;
  description: string;
  initialPromptClinician: string;
  initialPromptPatient: string;
  followUps: NoseQuestion[];
};

export type NoseSymptomResponse = {
  present: boolean | null;
  answers: Record<string, string>;
};

export type NoseResponses = Record<NoseSymptomId, NoseSymptomResponse>;

export type NoseAnswerEvent = {
  symptomId: NoseSymptomId;
  questionId: string;
  kind: "initial" | "followup";
  value: string;
};

export type NoseQuestionStep = {
  symptomId: NoseSymptomId;
  symptomLabel: string;
  questionId: string;
  prompt: string;
  description?: string;
  options: string[];
  kind: "initial" | "followup";
};

export type NoseDiagnosis = {
  title: string;
  basedOn: string[];
  type: "single" | "combo";
};

export type NoseExpectation = {
  text: string;
  basedOn: string[];
  type: "single" | "combo";
};

export type NoseReviewAndNextSteps = {
  summary: string;
  resolved: string[];
  unresolved: string[];
};

export type NoseAssessmentSummaryPayload = {
  area: "nose";
  audience: "clinician" | "patient";
  pathway: "epistaxis" | "chronic_rhinopathy" | "short_duration" | "none";
  symptomOrder: string[];
  symptoms: Array<{
    id: NoseSymptomId;
    label: string;
    description: string;
    present: boolean;
    initialQuestion: string;
    initialAnswer: string;
    followUps: Array<{ question: string; answer: string }>;
  }>;
  negativeSymptoms: string[];
  questionsAsked: Array<{
    symptom: string;
    question: string;
    answer: string;
    type: "initial" | "followup";
  }>;
  diagnoses: NoseDiagnosis[];
  expectations: NoseExpectation[];
  alternateDiagnoses: string[];
  reviewAndNextSteps: NoseReviewAndNextSteps;
};

const EPISTAXIS_AGE_QUESTION_ID = "epistaxis_age_band";

const sharedSymptomIds: NoseSymptomId[] = [
  "facial_pain",
  "nasal_obstruction",
  "sneezing",
  "running_discharge",
  "anosmia",
];

const getDurationQuestionId = (symptomId: NoseSymptomId) =>
  `${symptomId}_duration_over_2_months`;

const isYesAnswer = (value: string | undefined) =>
  (value ?? "").toLowerCase().startsWith("y");

const buildDurationFollowup = (symptomId: NoseSymptomId): NoseQuestion => ({
  id: getDurationQuestionId(symptomId),
  promptClinician: "Has this symptom persisted for more than 2 months?",
  promptPatient: "Has this symptom persisted for more than 2 months?",
  options: ["Yes", "No"],
});

export const noseSymptoms: NoseSymptomDefinition[] = [
  {
    id: "epistaxis",
    label: "Nose bleeds (epistaxis)",
    description: "Recurrent or recent bleeding from the nose.",
    initialPromptClinician: "Does the patient have nose bleeds (epistaxis)?",
    initialPromptPatient: "Have you had nose bleeds (epistaxis)?",
    followUps: [
      {
        id: EPISTAXIS_AGE_QUESTION_ID,
        promptClinician: "Is the patient under or over the age of 30?",
        promptPatient: "Are you under or over the age of 30?",
        options: ["Over 30", "Under 30"],
      },
    ],
  },
  {
    id: "facial_pain",
    label: "Facial pain",
    description: "Pain or pressure in the face.",
    initialPromptClinician: "Does the patient have facial pain?",
    initialPromptPatient: "Have you been experiencing facial pain?",
    followUps: [buildDurationFollowup("facial_pain")],
  },
  {
    id: "nasal_obstruction",
    label: "Nasal obstruction",
    description: "Blocked or obstructed nasal airflow.",
    initialPromptClinician: "Does the patient have nasal obstruction?",
    initialPromptPatient: "Have you had nasal obstruction?",
    followUps: [buildDurationFollowup("nasal_obstruction")],
  },
  {
    id: "sneezing",
    label: "Sneezing",
    description: "Frequent or troublesome sneezing.",
    initialPromptClinician: "Does the patient have troublesome sneezing?",
    initialPromptPatient: "Have you had troublesome sneezing?",
    followUps: [buildDurationFollowup("sneezing")],
  },
  {
    id: "running_discharge",
    label: "Running/discharge",
    description: "Persistent runny nose or nasal discharge.",
    initialPromptClinician: "Does the patient have running/discharge from the nose?",
    initialPromptPatient: "Have you had running/discharge from the nose?",
    followUps: [buildDurationFollowup("running_discharge")],
  },
  {
    id: "anosmia",
    label: "Loss of sense of smell (anosmia)",
    description: "Reduced or absent sense of smell.",
    initialPromptClinician:
      "Does the patient have loss of sense of smell (anosmia)?",
    initialPromptPatient: "Have you had loss of sense of smell (anosmia)?",
    followUps: [buildDurationFollowup("anosmia")],
  },
];

export const noseSymptomOrder = noseSymptoms.map((symptom) => symptom.label);

const createEmptyResponses = (): NoseResponses => {
  return noseSymptoms.reduce((acc, symptom) => {
    acc[symptom.id] = { present: null, answers: {} };
    return acc;
  }, {} as NoseResponses);
};

const getSymptomPrompt = (
  symptom: NoseSymptomDefinition,
  audience: "clinician" | "patient"
) => {
  return audience === "clinician"
    ? symptom.initialPromptClinician
    : symptom.initialPromptPatient;
};

const getFollowupPrompt = (
  question: NoseQuestion,
  audience: "clinician" | "patient"
) => {
  return audience === "clinician"
    ? question.promptClinician
    : question.promptPatient;
};

const getPathway = (
  responses: NoseResponses
): NoseAssessmentSummaryPayload["pathway"] => {
  if (responses.epistaxis.present) {
    return "epistaxis";
  }

  const positiveShared = sharedSymptomIds.filter((id) => responses[id].present);
  if (positiveShared.length === 0) {
    return "none";
  }

  const hasChronic = positiveShared.some((id) =>
    isYesAnswer(responses[id].answers[getDurationQuestionId(id)])
  );
  return hasChronic ? "chronic_rhinopathy" : "short_duration";
};

export const computeNoseAssessment = (
  events: NoseAnswerEvent[],
  audience: "clinician" | "patient"
) => {
  const responses = createEmptyResponses();
  let phase:
    | "epistaxis_initial"
    | "epistaxis_age"
    | "shared_initial"
    | "shared_duration"
    | "complete" = "epistaxis_initial";
  let sharedIndex = 0;

  const advanceShared = () => {
    if (sharedIndex + 1 < sharedSymptomIds.length) {
      sharedIndex += 1;
      phase = "shared_initial";
      return;
    }
    phase = "complete";
  };

  for (const event of events) {
    if (phase === "complete") break;

    if (phase === "epistaxis_initial") {
      const isYes = isYesAnswer(event.value);
      responses.epistaxis.present = isYes;
      responses.epistaxis.answers.initial_epistaxis = event.value;
      phase = isYes ? "epistaxis_age" : "shared_initial";
      continue;
    }

    if (phase === "epistaxis_age") {
      responses.epistaxis.answers[EPISTAXIS_AGE_QUESTION_ID] = event.value;
      phase = "complete";
      continue;
    }

    if (phase === "shared_initial") {
      const symptomId = sharedSymptomIds[sharedIndex];
      const isYes = isYesAnswer(event.value);
      responses[symptomId].present = isYes;
      responses[symptomId].answers[`initial_${symptomId}`] = event.value;
      if (isYes) {
        phase = "shared_duration";
      } else {
        advanceShared();
      }
      continue;
    }

    if (phase === "shared_duration") {
      const symptomId = sharedSymptomIds[sharedIndex];
      responses[symptomId].answers[getDurationQuestionId(symptomId)] = event.value;
      advanceShared();
    }
  }

  const isComplete = phase === "complete";
  let currentStep: NoseQuestionStep | null = null;

  if (!isComplete) {
    if (phase === "epistaxis_initial") {
      const symptom = noseSymptoms[0];
      currentStep = {
        symptomId: symptom.id,
        symptomLabel: symptom.label,
        questionId: `initial_${symptom.id}`,
        prompt: getSymptomPrompt(symptom, audience),
        description: symptom.description,
        options: ["Yes", "No"],
        kind: "initial",
      };
    } else if (phase === "epistaxis_age") {
      const symptom = noseSymptoms[0];
      const question = symptom.followUps[0];
      currentStep = {
        symptomId: symptom.id,
        symptomLabel: symptom.label,
        questionId: question.id,
        prompt: getFollowupPrompt(question, audience),
        options: question.options,
        kind: "followup",
      };
    } else if (phase === "shared_initial") {
      const symptomId = sharedSymptomIds[sharedIndex];
      const symptom = noseSymptoms.find((entry) => entry.id === symptomId)!;
      currentStep = {
        symptomId: symptom.id,
        symptomLabel: symptom.label,
        questionId: `initial_${symptom.id}`,
        prompt: getSymptomPrompt(symptom, audience),
        description: symptom.description,
        options: ["Yes", "No"],
        kind: "initial",
      };
    } else if (phase === "shared_duration") {
      const symptomId = sharedSymptomIds[sharedIndex];
      const symptom = noseSymptoms.find((entry) => entry.id === symptomId)!;
      const question = symptom.followUps[0];
      currentStep = {
        symptomId: symptom.id,
        symptomLabel: symptom.label,
        questionId: question.id,
        prompt: getFollowupPrompt(question, audience),
        options: question.options,
        kind: "followup",
      };
    }
  }

  return {
    responses,
    currentStep,
    isComplete,
    pathway: getPathway(responses),
  };
};

const buildFindings = (responses: NoseResponses) => {
  const diagnoses: NoseDiagnosis[] = [];
  const expectations: NoseExpectation[] = [];
  const alternateDiagnoses: string[] = [];
  const pathway = getPathway(responses);

  let reviewAndNextSteps: NoseReviewAndNextSteps = {
    summary: "No active nose pathway was triggered by the responses.",
    resolved: [
      "No additional intervention is required if symptoms remain absent.",
    ],
    unresolved: [
      "If symptoms develop or persist, reassess and follow the relevant nasal pathway.",
    ],
  };

  if (pathway === "epistaxis") {
    diagnoses.push({
      title: "Recurrent nosebleeds (epistaxis)",
      basedOn: ["epistaxis"],
      type: "single",
    });

    const ageBand = responses.epistaxis.answers[EPISTAXIS_AGE_QUESTION_ID];
    if (ageBand === "Over 30") {
      expectations.push(
        {
          text: "Naseptin cream for 6 weeks.",
          basedOn: ["epistaxis"],
          type: "single",
        },
        {
          text: "First aid advice: direct pressure and cold compress.",
          basedOn: ["epistaxis"],
          type: "single",
        },
        {
          text: "Consider chemical cautery where appropriate.",
          basedOn: ["epistaxis"],
          type: "single",
        }
      );
    } else {
      expectations.push(
        {
          text: "Urgent ENT assessment via Accident and Emergency for accurate localisation of the bleeding source and cautery.",
          basedOn: ["epistaxis"],
          type: "single",
        },
        {
          text: "Nasal packing and/or vessel ligation where indicated.",
          basedOn: ["epistaxis"],
          type: "single",
        }
      );
    }

    alternateDiagnoses.push(
      "Anterior nasal vessel bleeding pattern (anterior epistaxis)",
      "Posterior nasal bleeding pattern (posterior epistaxis)"
    );
    reviewAndNextSteps = {
      summary:
        "Review should confirm bleeding control and assess whether escalation is required.",
      resolved: [
        "If bleeding remains controlled, continue local care advice and planned follow-up.",
      ],
      unresolved: [
        "If bleeding recurs, worsens, or is difficult to control, arrange urgent specialist ENT reassessment.",
      ],
    };

    return {
      pathway,
      diagnoses,
      expectations,
      alternateDiagnoses,
      reviewAndNextSteps,
    };
  }

  const positiveShared = sharedSymptomIds.filter((id) => responses[id].present);
  const chronicSymptoms = positiveShared.filter((id) =>
    isYesAnswer(responses[id].answers[getDurationQuestionId(id)])
  );
  const shortSymptoms = positiveShared.filter(
    (id) => !chronicSymptoms.includes(id)
  );

  if (pathway === "none") {
    diagnoses.push({
      title: "No active nasal symptom pattern (no active rhinopathy pattern)",
      basedOn: [],
      type: "single",
    });
    expectations.push({
      text: "No immediate nose-specific treatment is indicated from the current responses.",
      basedOn: [],
      type: "single",
    });
    return {
      pathway,
      diagnoses,
      expectations,
      alternateDiagnoses,
      reviewAndNextSteps,
    };
  }

  if (pathway === "chronic_rhinopathy") {
    diagnoses.push({
      title: "Persistent nasal symptom pattern (chronic rhinopathy)",
      basedOn: chronicSymptoms.length > 0 ? chronicSymptoms : positiveShared,
      type: "combo",
    });
    expectations.push(
      {
        text: "Oral prednisolone (a steroid) 30 mg daily for 5 days.",
        basedOn: positiveShared,
        type: "combo",
      },
      {
        text: "Clarithromycin 250 mg twice daily for 2 weeks.",
        basedOn: positiveShared,
        type: "combo",
      },
      {
        text: "Flixonase nasules (steroid nose drops) twice daily for 4 weeks.",
        basedOn: positiveShared,
        type: "combo",
      },
      {
        text: "Nasonex (or equivalent nasal steroid spray) to continue for at least 3 months, ideally until specialist review.",
        basedOn: positiveShared,
        type: "combo",
      }
    );
    alternateDiagnoses.push(
      "Nasal infection pattern (infective rhinopathy)",
      "Allergy-related nasal inflammation (allergic rhinopathy)",
      "Environmental irritant sensitivity (non-allergic rhinitis)",
      "Structural nasal disorder (structural rhinopathy)"
    );
    if (shortSymptoms.length > 0) {
      alternateDiagnoses.push(
        "Concurrent short-duration nasal symptom pattern (acute self-limiting rhinopathy)"
      );
    }
    reviewAndNextSteps = {
      summary:
        "Depending on response to treatment, classify the pathway as resolved or unresolved.",
      resolved: [
        "Symptoms are more likely controlled than cured; continue steroid nasal spray and discuss long-term management with a nose specialist.",
      ],
      unresolved: [
        "Arrange magnetic resonance imaging (MRI) of the paranasal sinuses and refer to a nose specialist.",
        "Specialist review should consider whether surgical intervention and/or advanced allergy testing is appropriate.",
      ],
    };
    return {
      pathway,
      diagnoses,
      expectations,
      alternateDiagnoses,
      reviewAndNextSteps,
    };
  }

  diagnoses.push({
    title: "Short-duration nasal symptom pattern (acute self-limiting rhinopathy)",
    basedOn: shortSymptoms.length > 0 ? shortSymptoms : positiveShared,
    type: "combo",
  });
  expectations.push(
    {
      text: "No immediate medical treatment is usually required if symptoms have been present for less than 2 months.",
      basedOn: positiveShared,
      type: "combo",
    },
    {
      text: "Advise GP review if symptoms persist beyond 2 months.",
      basedOn: positiveShared,
      type: "combo",
    }
  );
  reviewAndNextSteps = {
    summary:
      "Use follow-up to confirm whether symptoms settle or continue beyond the short-duration phase.",
    resolved: ["If symptoms settle, no further treatment is typically needed."],
    unresolved: [
      "If symptoms persist for more than 2 months, reassess for chronic rhinopathy and initiate the chronic pathway.",
    ],
  };

  return {
    pathway,
    diagnoses,
    expectations,
    alternateDiagnoses,
    reviewAndNextSteps,
  };
};

export const buildNoseSummaryPayload = (
  responses: NoseResponses,
  audience: "clinician" | "patient"
): NoseAssessmentSummaryPayload => {
  const symptomsPayload: NoseAssessmentSummaryPayload["symptoms"] = [];
  const questionsAsked: NoseAssessmentSummaryPayload["questionsAsked"] = [];
  const negativeSymptoms: string[] = [];

  noseSymptoms.forEach((symptom) => {
    const response = responses[symptom.id];
    const initialQuestion = getSymptomPrompt(symptom, audience);
    const initialAnswer = response.answers[`initial_${symptom.id}`];
    const present = response.present === true;
    const asked = typeof initialAnswer === "string";

    if (asked) {
      questionsAsked.push({
        symptom: symptom.label,
        question: initialQuestion,
        answer: initialAnswer,
        type: "initial",
      });
      if (!present) {
        negativeSymptoms.push(symptom.label);
      }
    }

    const followUps: Array<{ question: string; answer: string }> = [];
    symptom.followUps.forEach((question) => {
      const answer = response.answers[question.id];
      if (!answer) return;
      const prompt = getFollowupPrompt(question, audience);
      followUps.push({ question: prompt, answer });
      questionsAsked.push({
        symptom: symptom.label,
        question: prompt,
        answer,
        type: "followup",
      });
    });

    symptomsPayload.push({
      id: symptom.id,
      label: symptom.label,
      description: symptom.description,
      present,
      initialQuestion,
      initialAnswer: initialAnswer ?? "Not asked",
      followUps,
    });
  });

  const findings = buildFindings(responses);

  return {
    area: "nose",
    audience,
    pathway: findings.pathway,
    symptomOrder: noseSymptomOrder,
    symptoms: symptomsPayload,
    negativeSymptoms,
    questionsAsked,
    diagnoses: findings.diagnoses,
    expectations: findings.expectations,
    alternateDiagnoses: findings.alternateDiagnoses,
    reviewAndNextSteps: findings.reviewAndNextSteps,
  };
};

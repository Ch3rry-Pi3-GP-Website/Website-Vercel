export type EarSymptomId =
  | "hearing_loss"
  | "earache"
  | "discharge"
  | "itching"
  | "tinnitus"
  | "vertigo";

export type EarQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

export type EarSymptomDefinition = {
  id: EarSymptomId;
  label: string;
  initialPrompt: string;
  followUps: EarQuestion[];
};

export type EarSymptomResponse = {
  present: boolean | null;
  answers: Record<string, string>;
};

export type EarResponses = Record<EarSymptomId, EarSymptomResponse>;

export type EarAnswerEvent = {
  symptomId: EarSymptomId;
  questionId: string;
  kind: "initial" | "followup";
  value: string;
};

export type EarQuestionStep = {
  symptomId: EarSymptomId;
  symptomLabel: string;
  questionId: string;
  prompt: string;
  options: string[];
  kind: "initial" | "followup";
};

export type EarDiagnosis = {
  title: string;
  basedOn: EarSymptomId[];
  type: "single" | "combo";
};

export type EarExpectation = {
  text: string;
  basedOn: EarSymptomId[];
  type: "single" | "combo";
};

export type EarAssessmentSummaryPayload = {
  area: "ears";
  symptomOrder: string[];
  symptoms: Array<{
    id: EarSymptomId;
    label: string;
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
  diagnoses: EarDiagnosis[];
  expectations: EarExpectation[];
};

export const earSymptoms: EarSymptomDefinition[] = [
  {
    id: "hearing_loss",
    label: "Hearing loss",
    initialPrompt: "Is the patient experiencing hearing loss?",
    followUps: [
      {
        id: "hearing_loss_severity",
        prompt: "How severe is the hearing loss?",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: "hearing_loss_side",
        prompt: "Is the hearing loss worse in one ear?",
        options: ["Left ear", "Right ear", "Both ears"],
      },
    ],
  },
  {
    id: "earache",
    label: "Ear ache (otalgia)",
    initialPrompt: "Is the patient experiencing ear ache (otalgia)?",
    followUps: [
      {
        id: "earache_side",
        prompt: "Is the ear ache worse in one ear?",
        options: ["Left ear", "Right ear", "Both ears"],
      },
      {
        id: "earache_duration",
        prompt: "Is the ear ache recent or long-standing?",
        options: ["Recent", "Long-standing"],
      },
    ],
  },
  {
    id: "discharge",
    label: "Discharge",
    initialPrompt: "Is there ear discharge?",
    followUps: [],
  },
  {
    id: "itching",
    label: "Itching or irritation",
    initialPrompt: "Is there itching or irritation in the ear?",
    followUps: [],
  },
  {
    id: "tinnitus",
    label: "Tinnitus / noise in the ear",
    initialPrompt: "Is the patient experiencing tinnitus or noise in the ear?",
    followUps: [
      {
        id: "tinnitus_side",
        prompt: "Is the tinnitus worse in one ear?",
        options: ["Left ear", "Right ear", "Both ears"],
      },
    ],
  },
  {
    id: "vertigo",
    label: "Vertigo / dizziness",
    initialPrompt: "Is the patient experiencing vertigo or dizziness?",
    followUps: [
      {
        id: "vertigo_duration",
        prompt: "How long does each episode last?",
        options: [
          "Short-lived (less than 2 minutes)",
          "Moderate (several hours)",
          "Long time (several days)",
        ],
      },
    ],
  },
];

export const earSymptomOrder = earSymptoms.map((symptom) => symptom.label);

const createEmptyResponses = (): EarResponses => {
  return earSymptoms.reduce((acc, symptom) => {
    acc[symptom.id] = { present: null, answers: {} };
    return acc;
  }, {} as EarResponses);
};

export const computeEarsAssessment = (events: EarAnswerEvent[]) => {
  let responses = createEmptyResponses();
  let symptomIndex = 0;
  let phase: "initial" | "followup" = "initial";
  let followupIndex = 0;

  const advanceToNextSymptom = () => {
    symptomIndex += 1;
    phase = "initial";
    followupIndex = 0;
  };

  for (const event of events) {
    if (symptomIndex >= earSymptoms.length) break;
    const symptom = earSymptoms[symptomIndex];

    if (phase === "initial") {
      const isYes = event.value.toLowerCase().startsWith("y");
      responses[symptom.id].present = isYes;
      responses[symptom.id].answers[event.questionId] = event.value;

      if (isYes && symptom.followUps.length > 0) {
        phase = "followup";
        followupIndex = 0;
      } else {
        advanceToNextSymptom();
      }
      continue;
    }

    const question = symptom.followUps[followupIndex];
    if (question) {
      responses[symptom.id].answers[question.id] = event.value;
    }

    if (followupIndex + 1 < symptom.followUps.length) {
      followupIndex += 1;
    } else {
      advanceToNextSymptom();
    }
  }

  const isComplete = symptomIndex >= earSymptoms.length;
  let currentStep: EarQuestionStep | null = null;
  if (!isComplete) {
    const symptom = earSymptoms[symptomIndex];
    if (phase === "initial") {
      currentStep = {
        symptomId: symptom.id,
        symptomLabel: symptom.label,
        questionId: `initial_${symptom.id}`,
        prompt: symptom.initialPrompt,
        options: ["Yes", "No"],
        kind: "initial",
      };
    } else {
      const question = symptom.followUps[followupIndex];
      currentStep = {
        symptomId: symptom.id,
        symptomLabel: symptom.label,
        questionId: question.id,
        prompt: question.prompt,
        options: question.options,
        kind: "followup",
      };
    }
  }

  return {
    responses,
    currentStep,
    isComplete,
  };
};

const buildSingleSymptomFindings = (responses: EarResponses) => {
  const diagnoses: EarDiagnosis[] = [];
  const expectations: EarExpectation[] = [];

  const hearingLoss = responses.hearing_loss;
  if (hearingLoss.present) {
    diagnoses.push({
      title: "Usually inner ear (sensorineural) hearing loss",
      basedOn: ["hearing_loss"],
      type: "single",
    });
    expectations.push({
      text: "Hearing test to assess the severity of any associated hearing loss.",
      basedOn: ["hearing_loss"],
      type: "single",
    });
    const side = hearingLoss.answers.hearing_loss_side;
    if (side === "Left ear" || side === "Right ear") {
      expectations.push({
        text: "MRI scan of the head is mandatory to exclude other serious causes.",
        basedOn: ["hearing_loss"],
        type: "single",
      });
    } else if (side === "Both ears") {
      expectations.push({
        text: "MRI scan of the head may be considered depending on findings.",
        basedOn: ["hearing_loss"],
        type: "single",
      });
    }
  }

  const earAche = responses.earache;
  if (earAche.present) {
    const duration = earAche.answers.earache_duration;
    if (duration === "Recent") {
      diagnoses.push({
        title: "Likely to be an ear infection",
        basedOn: ["earache"],
        type: "single",
      });
      expectations.push({
        text: "Treat locally (ear drops with steroid/antibiotic) and/or systemic (oral) antibiotics.",
        basedOn: ["earache"],
        type: "single",
      });
    } else if (duration === "Long-standing") {
      diagnoses.push({
        title: "Unlikely to be ear-related; most commonly a jaw-joint problem",
        basedOn: ["earache"],
        type: "single",
      });
      expectations.push({
        text: "Consider dental review (for example, a bite plate).",
        basedOn: ["earache"],
        type: "single",
      });
    }
  }

  const discharge = responses.discharge;
  if (discharge.present) {
    diagnoses.push({
      title: "Most probably otitis externa (infection of outer ear)",
      basedOn: ["discharge"],
      type: "single",
    });
    expectations.push({
      text: "Treat locally (ear drops with steroid/antibiotic), possibly with systemic (oral) antibiotics.",
      basedOn: ["discharge"],
      type: "single",
    });
  }

  const itching = responses.itching;
  if (itching.present) {
    diagnoses.push({
      title: "Most probably otitis externa (infection of outer ear)",
      basedOn: ["itching"],
      type: "single",
    });
    expectations.push({
      text: "Treat locally (ear drops with steroid/antibiotic), possibly with systemic (oral) antibiotics.",
      basedOn: ["itching"],
      type: "single",
    });
  }

  const tinnitus = responses.tinnitus;
  if (tinnitus.present) {
    diagnoses.push({
      title: "Probably inner ear condition",
      basedOn: ["tinnitus"],
      type: "single",
    });
    expectations.push({
      text: "Hearing test to assess the severity of any associated hearing loss.",
      basedOn: ["tinnitus"],
      type: "single",
    });
    const side = tinnitus.answers.tinnitus_side;
    if (side === "Left ear" || side === "Right ear") {
      expectations.push({
        text: "MRI scan of the head is mandatory to exclude other serious causes.",
        basedOn: ["tinnitus"],
        type: "single",
      });
    } else if (side === "Both ears") {
      expectations.push({
        text: "MRI scan of the head may be considered depending on findings.",
        basedOn: ["tinnitus"],
        type: "single",
      });
    }
    expectations.push({
      text: "Treatment is usually aimed at reducing the impact; these measures are generally beneficial.",
      basedOn: ["tinnitus"],
      type: "single",
    });
  }

  const vertigo = responses.vertigo;
  if (vertigo.present) {
    const duration = vertigo.answers.vertigo_duration;
    if (duration === "Short-lived (less than 2 minutes)") {
      diagnoses.push({
        title: "Benign positional vertigo (BPV)",
        basedOn: ["vertigo"],
        type: "single",
      });
      expectations.push({
        text: "Specialised physiotherapy and/or Epley manoeuvre.",
        basedOn: ["vertigo"],
        type: "single",
      });
    } else if (duration === "Moderate (several hours)") {
      diagnoses.push({
        title: "Menieres type",
        basedOn: ["vertigo"],
        type: "single",
      });
      expectations.push({
        text: "Regular medication (for example, betahistine and/or cinnarizine).",
        basedOn: ["vertigo"],
        type: "single",
      });
    } else if (duration === "Long time (several days)") {
      diagnoses.push({
        title: "Labyrinthitis",
        basedOn: ["vertigo"],
        type: "single",
      });
      expectations.push({
        text: "Symptomatic treatment, usually parenteral (by injection) administered by a medical professional (usually prochlorperazine).",
        basedOn: ["vertigo"],
        type: "single",
      });
    }
  }

  return { diagnoses, expectations };
};

const comboRules = [
  {
    id: "hearing_loss_discharge",
    symptoms: ["hearing_loss", "discharge"] as EarSymptomId[],
    diagnosis: "Chronic middle ear infection (chronic otitis media)",
    expectations: [
      "Requires specialist care. For active discharge, use ear drops containing antibiotics and steroids in combination.",
    ],
  },
  {
    id: "hearing_loss_earache",
    symptoms: ["hearing_loss", "earache"] as EarSymptomId[],
    diagnosis: "Acute middle ear infection (acute otitis media)",
    expectations: [
      "Initially, antibiotics are administered orally. May proceed to injected antibiotics in more serious cases.",
    ],
  },
  {
    id: "earache_discharge",
    symptoms: ["earache", "discharge"] as EarSymptomId[],
    diagnosis: "Outer ear infection (otitis externa)",
    expectations: [
      "Treat locally (ear drops with steroid/antibiotic) and/or systemic (oral) antibiotics.",
    ],
  },
  {
    id: "discharge_itching",
    symptoms: ["discharge", "itching"] as EarSymptomId[],
    diagnosis: "Outer ear infection (otitis externa)",
    expectations: [
      "Treat locally (ear drops with steroid/antibiotic) and/or systemic (oral) antibiotics.",
    ],
  },
  {
    id: "earache_discharge_itching",
    symptoms: ["earache", "discharge", "itching"] as EarSymptomId[],
    diagnosis: "Outer ear infection (otitis externa)",
    expectations: [
      "Treat locally (ear drops with steroid/antibiotic) and/or systemic (oral) antibiotics.",
    ],
  },
];

const buildComboFindings = (responses: EarResponses) => {
  const presentSymptoms = new Set<EarSymptomId>();
  earSymptoms.forEach((symptom) => {
    if (responses[symptom.id].present) {
      presentSymptoms.add(symptom.id);
    }
  });

  const matched = comboRules.filter((rule) =>
    rule.symptoms.every((symptom) => presentSymptoms.has(symptom))
  );

  if (matched.length === 0) {
    return { diagnoses: [], expectations: [], covered: new Set<EarSymptomId>() };
  }

  const maxLen = Math.max(...matched.map((rule) => rule.symptoms.length));
  const selected = matched.filter((rule) => rule.symptoms.length === maxLen);

  const diagnoses: EarDiagnosis[] = [];
  const expectations: EarExpectation[] = [];
  const covered = new Set<EarSymptomId>();

  selected.forEach((rule) => {
    diagnoses.push({
      title: rule.diagnosis,
      basedOn: rule.symptoms,
      type: "combo",
    });
    rule.expectations.forEach((text) => {
      expectations.push({
        text,
        basedOn: rule.symptoms,
        type: "combo",
      });
    });
    rule.symptoms.forEach((symptom) => covered.add(symptom));
  });

  return { diagnoses, expectations, covered };
};

export const buildEarsSummaryPayload = (
  responses: EarResponses
): EarAssessmentSummaryPayload => {
  const questionsAsked: EarAssessmentSummaryPayload["questionsAsked"] = [];
  const symptomsPayload: EarAssessmentSummaryPayload["symptoms"] = [];
  const negativeSymptoms: string[] = [];

  earSymptoms.forEach((symptom) => {
    const response = responses[symptom.id];
    const present = response.present === true;
    const initialQuestion = symptom.initialPrompt;
    const initialAnswer = response.answers[`initial_${symptom.id}`] ?? "No";

    if (!present) {
      negativeSymptoms.push(symptom.label);
    }

    questionsAsked.push({
      symptom: symptom.label,
      question: initialQuestion,
      answer: initialAnswer,
      type: "initial",
    });

    const followUps: Array<{ question: string; answer: string }> = [];
    symptom.followUps.forEach((question) => {
      const answer = response.answers[question.id];
      if (answer) {
        followUps.push({ question: question.prompt, answer });
        questionsAsked.push({
          symptom: symptom.label,
          question: question.prompt,
          answer,
          type: "followup",
        });
      }
    });

    symptomsPayload.push({
      id: symptom.id,
      label: symptom.label,
      present,
      initialQuestion,
      initialAnswer,
      followUps,
    });
  });

  const combo = buildComboFindings(responses);
  const single = buildSingleSymptomFindings(responses);

  const positiveSymptoms = symptomsPayload
    .filter((symptom) => symptom.present)
    .map((symptom) => symptom.id);

  const singleDiagnoses = single.diagnoses.filter(
    (diagnosis) =>
      !combo.covered.has(diagnosis.basedOn[0]) || combo.diagnoses.length === 0
  );
  const singleExpectations = single.expectations.filter(
    (expectation) =>
      !combo.covered.has(expectation.basedOn[0]) || combo.diagnoses.length === 0
  );

  const diagnoses = [...combo.diagnoses, ...singleDiagnoses];
  const expectations = [...combo.expectations, ...singleExpectations];

  if (positiveSymptoms.length === 0) {
    diagnoses.push({
      title: "No positive ear symptoms reported",
      basedOn: [],
      type: "single",
    });
  }

  return {
    area: "ears",
    symptomOrder: earSymptomOrder,
    symptoms: symptomsPayload,
    negativeSymptoms,
    questionsAsked,
    diagnoses,
    expectations,
  };
};

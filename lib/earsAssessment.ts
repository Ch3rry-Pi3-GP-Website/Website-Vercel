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
  description: string;
  initialPromptClinician: string;
  initialPromptPatient: string;
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
  description?: string;
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
  audience: "clinician" | "patient";
  symptomOrder: string[];
  symptoms: Array<{
    id: EarSymptomId;
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
  diagnoses: EarDiagnosis[];
  expectations: EarExpectation[];
  alternateDiagnoses: string[];
};

export const earSymptoms: EarSymptomDefinition[] = [
  {
    id: "hearing_loss",
    label: "Hearing loss",
    description: "Reduced hearing in one or both ears.",
    initialPromptClinician: "Does the patient have hearing loss?",
    initialPromptPatient: "Have you been experiencing hearing loss?",
    followUps: [
      {
        id: "hearing_loss_severity",
        prompt: "How severe is the hearing loss?",
        options: [
          "1 - Occasionally miss parts of a conversation in noisy places",
          "2 - Need people to repeat in group conversations",
          "3 - Struggle to hear clearly even in one-to-one conversation",
          "4 - Need a high TV/phone volume or rely on lip-reading",
          "5 - Unable to hear most sounds (profound hearing loss)",
        ],
      },
      {
        id: "hearing_loss_side",
        prompt: "Is the hearing loss worse in one ear?",
        options: ["Left ear", "Both ears", "Right ear"],
      },
    ],
  },
  {
    id: "earache",
    label: "Ear ache (otalgia)",
    description: "Pain or discomfort in or around the ear.",
    initialPromptClinician: "Does the patient have ear ache (otalgia)?",
    initialPromptPatient: "Have you been experiencing ear ache (otalgia)?",
    followUps: [
      {
        id: "earache_side",
        prompt: "Is the ear ache worse in one ear?",
        options: ["Left ear", "Both ears", "Right ear"],
      },
    ],
  },
  {
    id: "discharge",
    label: "Discharge",
    description: "Fluid, pus, or blood coming from the ear.",
    initialPromptClinician: "Is there ear discharge?",
    initialPromptPatient: "Have you noticed discharge from the ear?",
    followUps: [],
  },
  {
    id: "itching",
    label: "Itching or irritation",
    description: "Itching or irritation inside the ear canal.",
    initialPromptClinician: "Is there itching or irritation in the ear?",
    initialPromptPatient: "Have you had itching or irritation in the ear?",
    followUps: [],
  },
  {
    id: "tinnitus",
    label: "Tinnitus / noise in the ear",
    description: "Ringing, buzzing, or whooshing sounds in the ear.",
    initialPromptClinician: "Does the patient have tinnitus or noise in the ear?",
    initialPromptPatient: "Have you been experiencing tinnitus?",
    followUps: [
      {
        id: "tinnitus_side",
        prompt: "Is the tinnitus worse in one ear?",
        options: ["Left ear", "Both ears", "Right ear"],
      },
    ],
  },
  {
    id: "vertigo",
    label: "Vertigo / dizziness",
    description: "A spinning sensation or dizziness.",
    initialPromptClinician: "Does the patient have vertigo or dizziness?",
    initialPromptPatient: "Have you been experiencing vertigo or dizziness?",
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

const symptomDiagnosisOptions: Record<EarSymptomId, string[]> = {
  hearing_loss: ["Inner ear hearing loss (sensorineural hearing loss)"],
  earache: ["Pain referred from other head/neck structures (referred otalgia)"],
  discharge: ["Outer ear infection (otitis externa)"],
  itching: ["Outer ear infection (otitis externa)"],
  tinnitus: ["Inner ear condition (inner ear pathology)"],
  vertigo: [
    "Benign positional vertigo (BPV)",
    "Meniere's disease (Menieres type)",
    "Inner ear infection (labyrinthitis)",
  ],
};

const EARACHE_ALTERNATIVE_DIAGNOSIS =
  "Pain referred from other head/neck structures (referred otalgia)";

const lateralityQuestionIds = new Set([
  "hearing_loss_side",
  "earache_side",
  "tinnitus_side",
]);

export const formatAnswerForAudience = (
  questionId: string,
  answer: string,
  audience: "clinician" | "patient"
) => {
  if (audience !== "clinician") return answer;
  if (!lateralityQuestionIds.has(questionId)) return answer;
  if (answer === "Left ear") return "Left ear (asymmetric)";
  if (answer === "Right ear") return "Right ear (asymmetric)";
  if (answer === "Both ears") return "Both ears (bilateral/symmetric)";
  return answer;
};

const createEmptyResponses = (): EarResponses => {
  return earSymptoms.reduce((acc, symptom) => {
    acc[symptom.id] = { present: null, answers: {} };
    return acc;
  }, {} as EarResponses);
};

export const computeEarsAssessment = (
  events: EarAnswerEvent[],
  audience: "clinician" | "patient"
) => {
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
        prompt:
          audience === "clinician"
            ? symptom.initialPromptClinician
            : symptom.initialPromptPatient,
        description: symptom.description,
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
      title: "Inner ear hearing loss (sensorineural hearing loss)",
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
        text: "Magnetic resonance imaging (MRI) scan of the head is mandatory to exclude other serious causes.",
        basedOn: ["hearing_loss"],
        type: "single",
      });
    } else if (side === "Both ears") {
      expectations.push({
        text: "Magnetic resonance imaging (MRI) scan of the head may be considered depending on findings.",
        basedOn: ["hearing_loss"],
        type: "single",
      });
    }
  }

  const earAche = responses.earache;
  if (earAche.present) {
    diagnoses.push({
      title: "Jaw joint dysfunction (temporomandibular joint (TMJ) dysfunction)",
      basedOn: ["earache"],
      type: "single",
    });
    expectations.push({
      text: "Consult a dentist to provide a bite plate.",
      basedOn: ["earache"],
      type: "single",
    });
  }

  const discharge = responses.discharge;
  if (discharge.present) {
    diagnoses.push({
      title: "Outer ear infection (otitis externa)",
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
      title: "Outer ear infection (otitis externa)",
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
      title: "Inner ear condition (inner ear pathology)",
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
        text: "Magnetic resonance imaging (MRI) scan of the head is mandatory to exclude other serious causes.",
        basedOn: ["tinnitus"],
        type: "single",
      });
    } else if (side === "Both ears") {
      expectations.push({
        text: "Magnetic resonance imaging (MRI) scan of the head may be considered depending on findings.",
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
        title: "Meniere's disease (Menieres type)",
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
        title: "Inner ear infection (labyrinthitis)",
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
    diagnosis: "Long-term middle ear infection (chronic otitis media)",
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
  responses: EarResponses,
  audience: "clinician" | "patient"
): EarAssessmentSummaryPayload => {
  const questionsAsked: EarAssessmentSummaryPayload["questionsAsked"] = [];
  const symptomsPayload: EarAssessmentSummaryPayload["symptoms"] = [];
  const negativeSymptoms: string[] = [];

  earSymptoms.forEach((symptom) => {
    const response = responses[symptom.id];
    const present = response.present === true;
    const initialQuestion =
      audience === "clinician"
        ? symptom.initialPromptClinician
        : symptom.initialPromptPatient;
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
        const formattedAnswer = formatAnswerForAudience(
          question.id,
          answer,
          audience
        );
        followUps.push({ question: question.prompt, answer: formattedAnswer });
        questionsAsked.push({
          symptom: symptom.label,
          question: question.prompt,
          answer: formattedAnswer,
          type: "followup",
        });
      }
    });

    symptomsPayload.push({
      id: symptom.id,
      label: symptom.label,
      description: symptom.description,
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

  const selectedTitles = new Set(diagnoses.map((diagnosis) => diagnosis.title));
  const alternateDiagnosesSet = new Set<string>();

  const presentSymptomIds = earSymptoms
    .filter((symptom) => responses[symptom.id].present)
    .map((symptom) => symptom.id);

  presentSymptomIds.forEach((symptomId) => {
    const options = symptomDiagnosisOptions[symptomId] ?? [];
    options.forEach((title) => {
      if (!selectedTitles.has(title)) {
        alternateDiagnosesSet.add(title);
      }
    });
  });

  const matchedCombos = comboRules.filter((rule) =>
    rule.symptoms.every((symptom) => presentSymptomIds.includes(symptom))
  );
  matchedCombos.forEach((rule) => {
    if (!selectedTitles.has(rule.diagnosis)) {
      alternateDiagnosesSet.add(rule.diagnosis);
    }
  });

  const hasJawJointDiagnosis = diagnoses.some((diagnosis) =>
    diagnosis.title.includes("Jaw joint dysfunction")
  );
  if (responses.earache.present && hasJawJointDiagnosis) {
    alternateDiagnosesSet.add(EARACHE_ALTERNATIVE_DIAGNOSIS);
  }

  const alternateDiagnoses = Array.from(alternateDiagnosesSet);

  return {
    area: "ears",
    audience,
    symptomOrder: earSymptomOrder,
    symptoms: symptomsPayload,
    negativeSymptoms,
    questionsAsked,
    diagnoses,
    expectations,
    alternateDiagnoses,
  };
};

export type DecisionOption = {
  label: string;
  next: string;
};

export type DecisionNode = {
  id: string;
  title: string;
  type: "question" | "action";
  prompt?: string;
  content?: string[];
  options?: DecisionOption[];
  emphasis?: "urgent" | "info" | "warning";
};

export type DecisionTree = {
  id: string;
  label: string;
  description: string;
  rootId: string;
  nodes: Record<string, DecisionNode>;
};

export const decisionTrees: DecisionTree[] = [
  {
    id: "ears",
    label: "Adult ears",
    description: "Symptom based diagnosis and management - adult ears.",
    rootId: "ears-root",
    nodes: {
      "ears-root": {
        id: "ears-root",
        title: "Ears",
        type: "question",
        prompt: "What is the primary ear symptom?",
        options: [
          { label: "Vertigo", next: "ears-vertigo" },
          { label: "Tinnitus", next: "ears-tinnitus" },
          { label: "Deafness", next: "ears-deafness" },
          { label: "Otalgia", next: "ears-otalgia" },
          { label: "Discharge", next: "ears-discharge" },
          { label: "Itching", next: "ears-itching" },
        ],
      },
      "ears-vertigo": {
        id: "ears-vertigo",
        title: "MRI head",
        type: "question",
        prompt: "Findings or likely diagnosis?",
        options: [
          {
            label: "BPV - specialised physiotherapy +/- Epley manoeuvre",
            next: "ears-bpv",
          },
          {
            label: "Labyrinthitis symptomatic treatment usually systemic",
            next: "ears-labyrinthitis",
          },
          {
            label: "Menieres type, regular Serclor plus Stugeron",
            next: "ears-menieres",
          },
        ],
      },
      "ears-bpv": {
        id: "ears-bpv",
        title: "BPV",
        type: "action",
        content: ["Specialised physiotherapy +/- Epley manoeuvre."],
      },
      "ears-labyrinthitis": {
        id: "ears-labyrinthitis",
        title: "Labyrinthitis",
        type: "action",
        content: ["Symptomatic treatment usually systemic."],
      },
      "ears-menieres": {
        id: "ears-menieres",
        title: "Menieres type",
        type: "action",
        content: ["Regular Serclor plus Stugeron."],
      },
      "ears-tinnitus": {
        id: "ears-tinnitus",
        title: "Tinnitus",
        type: "action",
        content: ["Usually with sensorineural deafness."],
        options: [{ label: "MRI IAM's", next: "ears-mri-iams" }],
      },
      "ears-mri-iams": {
        id: "ears-mri-iams",
        title: "MRI IAM's",
        type: "action",
        content: ["MRI IAM's."],
        options: [{ label: "Hearing aid", next: "ears-hearing-aid" }],
      },
      "ears-deafness": {
        id: "ears-deafness",
        title: "Deafness",
        type: "action",
        content: ["Sole symptom usually sensorineural."],
        options: [{ label: "Pattern", next: "ears-deafness-pattern" }],
      },
      "ears-deafness-pattern": {
        id: "ears-deafness-pattern",
        title: "Pattern",
        type: "question",
        prompt: "Which description best fits?",
        options: [
          { label: "Asymmetrical +/- under 60", next: "ears-mri-iams" },
          { label: "Symmetrical over 60", next: "ears-hearing-aid" },
        ],
      },
      "ears-hearing-aid": {
        id: "ears-hearing-aid",
        title: "Hearing aid",
        type: "action",
        content: ["Hearing aid."],
      },
      "ears-otalgia": {
        id: "ears-otalgia",
        title: "Otalgia",
        type: "question",
        prompt: "Most likely presentation",
        options: [
          {
            label: "Sole symptom probably TMJ dysfunction",
            next: "ears-tmj",
          },
          {
            label:
              "Most probably otitis media (acute usually painful, chronic usually painless)",
            next: "ears-otitis-media",
          },
        ],
      },
      "ears-tmj": {
        id: "ears-tmj",
        title: "TMJ dysfunction",
        type: "action",
        content: ["Try bite plate."],
      },
      "ears-otitis-media": {
        id: "ears-otitis-media",
        title: "Otitis media",
        type: "action",
        content: [
          "Treat with ear drops (steroid/antibiotic) +/- systemic antibiotics.",
        ],
      },
      "ears-otitis-externa": {
        id: "ears-otitis-externa",
        title: "Otitis externa",
        type: "action",
        content: [
          "Treat with ear drops (steroid/antibiotic) +/- systemic antibiotics.",
        ],
      },
      "ears-discharge": {
        id: "ears-discharge",
        title: "Discharge",
        type: "question",
        prompt: "Likely cause",
        options: [
          {
            label:
              "Most probably otitis media (acute usually painful, chronic usually painless)",
            next: "ears-otitis-media",
          },
          {
            label: "Most probably otitis externa (hearing loss generally mild)",
            next: "ears-otitis-externa",
          },
        ],
      },
      "ears-itching": {
        id: "ears-itching",
        title: "Itching",
        type: "question",
        prompt: "Likely cause",
        options: [
          {
            label: "Most probably otitis externa (hearing loss generally mild)",
            next: "ears-otitis-externa",
          },
        ],
      },
    },
  },
  {
    id: "nose",
    label: "Adult noses",
    description: "Symptom based diagnosis and management - adult noses.",
    rootId: "nose-root",
    nodes: {
      "nose-root": {
        id: "nose-root",
        title: "Noses",
        type: "question",
        prompt: "What is the primary nose symptom?",
        options: [
          { label: "Epistaxis", next: "nose-epistaxis" },
          { label: "Facial pain", next: "nose-facial-pain" },
          { label: "Nasal obstruction", next: "nose-nasal-obstruction" },
          { label: "Sneezing", next: "nose-sneezing" },
          { label: "Running/discharge", next: "nose-running-discharge" },
          { label: "Anosmia", next: "nose-anosmia" },
        ],
      },
      "nose-epistaxis": {
        id: "nose-epistaxis",
        title: "Epistaxis",
        type: "question",
        prompt: "Age band",
        options: [
          { label: "Under 30", next: "nose-epistaxis-under30" },
          { label: "Over 30", next: "nose-epistaxis-over30" },
        ],
      },
      "nose-epistaxis-under30": {
        id: "nose-epistaxis-under30",
        title: "Under 30",
        type: "action",
        content: [
          "Naseptin cream for 6 weeks.",
          "First aid advice ie direct pressure/cold compress.",
          "Plus/minus chemical cautery.",
        ],
        options: [{ label: "Unresolved -> Refer", next: "nose-epistaxis-refer" }],
      },
      "nose-epistaxis-refer": {
        id: "nose-epistaxis-refer",
        title: "Unresolved",
        type: "action",
        content: ["Refer."],
      },
      "nose-epistaxis-over30": {
        id: "nose-epistaxis-over30",
        title: "Over 30",
        type: "action",
        content: [
          "Acutely to ENT via A and E for:",
          "1. Accurate localization of source of bleeding - cautery.",
          "2. Nasal packing/vessel ligation.",
        ],
      },
      "nose-facial-pain": {
        id: "nose-facial-pain",
        title: "Facial pain",
        type: "action",
        content: ["MRI Head and Sinuses."],
        options: [{ label: "Continue", next: "nose-treatment" }],
      },
      "nose-nasal-obstruction": {
        id: "nose-nasal-obstruction",
        title: "Nasal obstruction",
        type: "action",
        content: ["MRI Sinuses alone."],
        options: [{ label: "Continue", next: "nose-treatment" }],
      },
      "nose-sneezing": {
        id: "nose-sneezing",
        title: "Sneezing",
        type: "action",
        content: ["MRI Sinuses alone."],
        options: [{ label: "Continue", next: "nose-treatment" }],
      },
      "nose-running-discharge": {
        id: "nose-running-discharge",
        title: "Running/discharge",
        type: "action",
        content: ["MRI Sinuses alone."],
        options: [{ label: "Continue", next: "nose-treatment" }],
      },
      "nose-anosmia": {
        id: "nose-anosmia",
        title: "Anosmia",
        type: "action",
        content: ["MRI Head and Sinuses."],
        options: [{ label: "Continue", next: "nose-treatment" }],
      },
      "nose-treatment": {
        id: "nose-treatment",
        title: "Management",
        type: "action",
        content: [
          "Antibiotics for 2 weeks. Clarithromycin 250mg b.d. 2/52.",
          "Systemic steroids 1 week. 30mg Prednisolone 5 days.",
          "Flixonase nasules daily. 4/52.",
          "Nasonex or similar for 6/52.",
        ],
        options: [
          { label: "Resolved", next: "nose-resolved" },
          { label: "Unresolved +/- positive scan findings", next: "nose-unresolved" },
        ],
      },
      "nose-resolved": {
        id: "nose-resolved",
        title: "Resolved",
        type: "action",
        content: [
          "Continue nasal steroid spray indefinitely.",
          "Titrate dosage.",
        ],
      },
      "nose-unresolved": {
        id: "nose-unresolved",
        title: "Unresolved",
        type: "action",
        content: ["Refer."],
      },
    },
  },
  {
    id: "throat",
    label: "Adult throats and necks",
    description: "Symptom based diagnosis and management - adult throats and necks.",
    rootId: "throat-root",
    nodes: {
      "throat-root": {
        id: "throat-root",
        title: "Throats and necks",
        type: "question",
        prompt: "What is the primary throat or neck symptom?",
        options: [
          { label: "Painful throat", next: "throat-painful" },
          { label: "Dysphagia", next: "throat-dysphagia" },
          { label: "Dysphonia", next: "throat-dysphonia" },
          { label: "Neck lumps", next: "throat-neck-lumps" },
        ],
      },
      "throat-painful": {
        id: "throat-painful",
        title: "Painful throat",
        type: "question",
        prompt: "Which description best matches?",
        options: [
          { label: "Recurrent septic", next: "throat-recurrent-septic" },
          {
            label: "Vague discomfort \"Lump in the throat\"",
            next: "throat-lump",
          },
        ],
      },
      "throat-recurrent-septic": {
        id: "throat-recurrent-septic",
        title: "Recurrent septic",
        type: "action",
        content: ["Probably tonsillitis."],
        options: [{ label: "Medical treatment", next: "throat-medical-treatment" }],
      },
      "throat-medical-treatment": {
        id: "throat-medical-treatment",
        title: "Medical treatment",
        type: "action",
        content: ["Medical treatment."],
        options: [
          {
            label: "Frequently recurrent - consider tonsillectomy",
            next: "throat-consider-tonsillectomy",
          },
        ],
      },
      "throat-consider-tonsillectomy": {
        id: "throat-consider-tonsillectomy",
        title: "Consider tonsillectomy",
        type: "action",
        content: ["Frequently recurrent - consider tonsillectomy."],
        options: [
          { label: "Consult P.L.C.V. criteria", next: "throat-plcv" },
          { label: "If concerned", next: "throat-if-concerned" },
        ],
      },
      "throat-plcv": {
        id: "throat-plcv",
        title: "P.L.C.V. criteria",
        type: "action",
        content: ["Consult P.L.C.V. criteria."],
      },
      "throat-if-concerned": {
        id: "throat-if-concerned",
        title: "If concerned",
        type: "action",
        content: ["If concerned."],
      },
      "throat-lump": {
        id: "throat-lump",
        title: "Vague discomfort",
        type: "action",
        content: ["\"Lump in the throat\"."],
        options: [{ label: "Treat for dyspepsia", next: "throat-dyspepsia" }],
      },
      "throat-dyspepsia": {
        id: "throat-dyspepsia",
        title: "Treat for dyspepsia",
        type: "action",
        content: [
          "Omeprazole 20mg b.d.",
          "Gaviscon Adv. 10 mls qds.",
        ],
        options: [
          {
            label: "One stop TRANS NASAL OESOPHAGOSCOPY CLINIC",
            next: "throat-one-stop",
          },
        ],
      },
      "throat-one-stop": {
        id: "throat-one-stop",
        title: "One stop clinic",
        type: "action",
        content: ["One stop TRANS NASAL OESOPHAGOSCOPY CLINIC."],
      },
      "throat-dysphagia": {
        id: "throat-dysphagia",
        title: "Dysphagia",
        type: "question",
        prompt: "Which description best fits?",
        options: [
          {
            label: "No true dysphagia or weight loss",
            next: "throat-dyspepsia",
          },
          {
            label: "True dysphagia +/- weight loss",
            next: "throat-urgent",
          },
        ],
      },
      "throat-urgent": {
        id: "throat-urgent",
        title: "URGENT",
        type: "action",
        emphasis: "urgent",
        content: ["URGENT."],
        options: [
          {
            label: "One stop TRANS NASAL OESOPHAGOSCOPY CLINIC",
            next: "throat-one-stop",
          },
        ],
      },
      "throat-dysphonia": {
        id: "throat-dysphonia",
        title: "Dysphonia",
        type: "action",
        content: ["Persistent for 6 weeks."],
        options: [{ label: "Urgent referral", next: "throat-urgent-referral" }],
      },
      "throat-neck-lumps": {
        id: "throat-neck-lumps",
        title: "Neck lumps",
        type: "question",
        prompt: "Pyrexial?",
        options: [
          { label: "Pyrexial", next: "throat-neck-pyrexial" },
          { label: "Apyrexial", next: "throat-neck-apyrexial" },
        ],
      },
      "throat-neck-pyrexial": {
        id: "throat-neck-pyrexial",
        title: "Pyrexial",
        type: "action",
        content: ["Two weeks Medical Rx with antibiotics."],
        options: [{ label: "Unresolved", next: "throat-neck-unresolved" }],
      },
      "throat-neck-unresolved": {
        id: "throat-neck-unresolved",
        title: "Unresolved",
        type: "action",
        content: ["Unresolved."],
        options: [{ label: "Urgent referral", next: "throat-urgent-referral" }],
      },
      "throat-neck-apyrexial": {
        id: "throat-neck-apyrexial",
        title: "Apyrexial",
        type: "action",
        content: ["US Scan urgently."],
        options: [{ label: "Urgent referral", next: "throat-urgent-referral" }],
      },
      "throat-urgent-referral": {
        id: "throat-urgent-referral",
        title: "Urgent referral",
        type: "action",
        emphasis: "urgent",
        content: ["Urgent referral."],
      },
    },
  },
];

export const decisionTreeMap: Record<string, DecisionTree> = Object.fromEntries(
  decisionTrees.map((tree) => [tree.id, tree])
);

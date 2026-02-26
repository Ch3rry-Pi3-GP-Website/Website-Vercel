import { StateGraph, StateSchema, GraphNode, START, END } from "@langchain/langgraph";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { summaryModel } from "@/lib/llm/model";
import { noseSummaryPrompt } from "@/lib/llm/noseSummaryPrompt";
import { noseSummaryReviewPrompt } from "@/lib/llm/noseSummaryReviewPrompt";
import { noseSummaryRevisionPrompt } from "@/lib/llm/noseSummaryRevisionPrompt";

const SymptomSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    present: z.boolean(),
    initialQuestion: z.string(),
    initialAnswer: z.string(),
    followUps: z.array(
      z
        .object({
          question: z.string(),
          answer: z.string(),
        })
        .strict()
    ),
  })
  .strict();

const QuestionAskedSchema = z
  .object({
    symptom: z.string(),
    question: z.string(),
    answer: z.string(),
    type: z.enum(["initial", "followup"]),
  })
  .strict();

const DiagnosisSchema = z
  .object({
    title: z.string(),
    basedOn: z.array(z.string()),
    type: z.enum(["single", "combo"]),
  })
  .strict();

const ExpectationSchema = z
  .object({
    text: z.string(),
    basedOn: z.array(z.string()),
    type: z.enum(["single", "combo"]),
  })
  .strict();

const ReviewAndNextStepsSchema = z
  .object({
    summary: z.string(),
    resolved: z.array(z.string()),
    unresolved: z.array(z.string()),
  })
  .strict();

export const NoseSummaryInputSchema = z
  .object({
    area: z.literal("nose"),
    audience: z.enum(["clinician", "patient"]),
    pathway: z.enum(["epistaxis", "chronic_rhinopathy", "short_duration", "none"]),
    symptomOrder: z.array(z.string()),
    symptoms: z.array(SymptomSchema),
    negativeSymptoms: z.array(z.string()),
    questionsAsked: z.array(QuestionAskedSchema),
    diagnoses: z.array(DiagnosisSchema),
    expectations: z.array(ExpectationSchema),
    alternateDiagnoses: z.array(z.string()),
    reviewAndNextSteps: ReviewAndNextStepsSchema,
  })
  .strict();

const NoseSummaryState = new StateSchema({
  area: z.literal("nose"),
  audience: z.enum(["clinician", "patient"]),
  pathway: z.enum(["epistaxis", "chronic_rhinopathy", "short_duration", "none"]),
  symptomOrder: z.array(z.string()),
  symptoms: z.array(SymptomSchema),
  negativeSymptoms: z.array(z.string()),
  questionsAsked: z.array(QuestionAskedSchema),
  diagnoses: z.array(DiagnosisSchema),
  expectations: z.array(ExpectationSchema),
  alternateDiagnoses: z.array(z.string()),
  reviewAndNextSteps: ReviewAndNextStepsSchema,
  draft: z.string().optional(),
  reviewPass: z.boolean().optional(),
  reviewIssues: z.array(z.string()).optional(),
  reviewFixes: z.array(z.string()).optional(),
  iterations: z.number().optional(),
  summary: z.string().optional(),
});

type NoseSummaryStateType = {
  area: "nose";
  audience: "clinician" | "patient";
  pathway: "epistaxis" | "chronic_rhinopathy" | "short_duration" | "none";
  symptomOrder: string[];
  symptoms: z.infer<typeof SymptomSchema>[];
  negativeSymptoms: string[];
  questionsAsked: z.infer<typeof QuestionAskedSchema>[];
  diagnoses: z.infer<typeof DiagnosisSchema>[];
  expectations: z.infer<typeof ExpectationSchema>[];
  alternateDiagnoses: string[];
  reviewAndNextSteps: z.infer<typeof ReviewAndNextStepsSchema>;
  draft?: string;
  reviewPass?: boolean;
  reviewIssues?: string[];
  reviewFixes?: string[];
  iterations?: number;
  summary?: string;
};

const formatNoseSummaryInput = (state: NoseSummaryStateType) => {
  return JSON.stringify(
    {
      area: state.area,
      audience: state.audience,
      pathway: state.pathway,
      symptomOrder: state.symptomOrder,
      symptoms: state.symptoms,
      negativeSymptoms: state.negativeSymptoms,
      questionsAsked: state.questionsAsked,
      diagnoses: state.diagnoses,
      expectations: state.expectations,
      alternateDiagnoses: state.alternateDiagnoses,
      reviewAndNextSteps: state.reviewAndNextSteps,
    },
    null,
    2
  );
};

const summariseNode: GraphNode<typeof NoseSummaryState> = async (state) => {
  const input = formatNoseSummaryInput(state);
  const messages = await noseSummaryPrompt.formatMessages({ input });
  const response = await summaryModel.invoke(messages);
  return { draft: response.content?.toString() ?? "", iterations: 0 };
};

const ReviewSchema = z.object({
  pass: z.boolean(),
  issues: z.array(z.string()).optional(),
  fixes: z.array(z.string()).optional(),
});

const reviewParser = StructuredOutputParser.fromZodSchema(ReviewSchema);

const parseReview = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return { pass: false, issues: ["QA review JSON not found."], fixes: [] };
  }
  try {
    const parsed = JSON.parse(match[0]);
    const result = ReviewSchema.safeParse(parsed);
    if (!result.success) {
      return { pass: false, issues: ["QA review JSON invalid."], fixes: [] };
    }
    return {
      pass: result.data.pass,
      issues: result.data.issues ?? [],
      fixes: result.data.fixes ?? [],
    };
  } catch {
    return { pass: false, issues: ["QA review parse failed."], fixes: [] };
  }
};

const reviewNode: GraphNode<typeof NoseSummaryState> = async (state) => {
  const context = formatNoseSummaryInput(state);
  const formatInstructions = reviewParser.getFormatInstructions();
  const messages = await noseSummaryReviewPrompt.formatMessages({
    context,
    draft: state.draft ?? "",
    format_instructions: formatInstructions,
  });
  const response = await summaryModel.invoke(messages);
  let review;
  try {
    review = await reviewParser.parse(response.content?.toString() ?? "");
  } catch {
    review = parseReview(response.content?.toString() ?? "");
  }
  const nextIterations = (state.iterations ?? 0) + 1;
  return {
    reviewPass: review.pass,
    reviewIssues: review.issues,
    reviewFixes: review.fixes,
    iterations: nextIterations,
  };
};

const reviseNode: GraphNode<typeof NoseSummaryState> = async (state) => {
  const context = formatNoseSummaryInput(state);
  const messages = await noseSummaryRevisionPrompt.formatMessages({
    context,
    draft: state.draft ?? "",
    issues: (state.reviewIssues ?? []).join("\n- "),
    fixes: (state.reviewFixes ?? []).join("\n- "),
  });
  const response = await summaryModel.invoke(messages);
  return { draft: response.content?.toString() ?? "" };
};

const finalizeNode: GraphNode<typeof NoseSummaryState> = async (state) => {
  return { summary: state.draft ?? "" };
};

const MAX_REVISIONS = 2;

const graph = new StateGraph(NoseSummaryState)
  .addNode("summarise", summariseNode)
  .addNode("review", reviewNode)
  .addNode("revise", reviseNode)
  .addNode("finalize", finalizeNode)
  .addEdge(START, "summarise")
  .addEdge("summarise", "review")
  .addConditionalEdges(
    "review",
    (state: NoseSummaryStateType) => {
      if (state.reviewPass) return "finalize";
      if ((state.iterations ?? 0) >= MAX_REVISIONS) return "finalize";
      return "revise";
    },
    ["revise", "finalize"]
  )
  .addEdge("revise", "review")
  .addEdge("finalize", END)
  .compile();

export type NoseSummaryInput = z.infer<typeof NoseSummaryInputSchema>;

export async function generateNoseSummary(input: NoseSummaryInput) {
  return graph.invoke({
    area: input.area,
    audience: input.audience,
    pathway: input.pathway,
    symptomOrder: input.symptomOrder,
    symptoms: input.symptoms,
    negativeSymptoms: input.negativeSymptoms,
    questionsAsked: input.questionsAsked,
    diagnoses: input.diagnoses,
    expectations: input.expectations,
    alternateDiagnoses: input.alternateDiagnoses,
    reviewAndNextSteps: input.reviewAndNextSteps,
  });
}

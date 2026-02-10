import { StateGraph, StateSchema, GraphNode, START, END } from "@langchain/langgraph";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { summaryModel } from "@/lib/llm/model";
import { summaryPrompt } from "@/lib/llm/summaryPrompt";
import { summaryReviewPrompt } from "@/lib/llm/summaryReviewPrompt";
import { summaryRevisionPrompt } from "@/lib/llm/summaryRevisionPrompt";

const SymptomSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  present: z.boolean(),
  initialQuestion: z.string(),
  initialAnswer: z.string(),
  followUps: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
});

const QuestionAskedSchema = z.object({
  symptom: z.string(),
  question: z.string(),
  answer: z.string(),
  type: z.enum(["initial", "followup"]),
});

const DiagnosisSchema = z.object({
  title: z.string(),
  basedOn: z.array(z.string()),
  type: z.enum(["single", "combo"]),
});

const ExpectationSchema = z.object({
  text: z.string(),
  basedOn: z.array(z.string()),
  type: z.enum(["single", "combo"]),
});

export const SummaryInputSchema = z.object({
  area: z.literal("ears"),
  audience: z.enum(["clinician", "patient"]),
  symptomOrder: z.array(z.string()),
  symptoms: z.array(SymptomSchema),
  negativeSymptoms: z.array(z.string()),
  questionsAsked: z.array(QuestionAskedSchema),
  diagnoses: z.array(DiagnosisSchema),
  expectations: z.array(ExpectationSchema),
});

const SummaryState = new StateSchema({
  area: z.literal("ears"),
  audience: z.enum(["clinician", "patient"]),
  symptomOrder: z.array(z.string()),
  symptoms: z.array(SymptomSchema),
  negativeSymptoms: z.array(z.string()),
  questionsAsked: z.array(QuestionAskedSchema),
  diagnoses: z.array(DiagnosisSchema),
  expectations: z.array(ExpectationSchema),
  draft: z.string().optional(),
  reviewPass: z.boolean().optional(),
  reviewIssues: z.array(z.string()).optional(),
  reviewFixes: z.array(z.string()).optional(),
  iterations: z.number().optional(),
  summary: z.string().optional(),
});

type SummaryStateType = {
  area: "ears";
  audience: "clinician" | "patient";
  symptomOrder: string[];
  symptoms: z.infer<typeof SymptomSchema>[];
  negativeSymptoms: string[];
  questionsAsked: z.infer<typeof QuestionAskedSchema>[];
  diagnoses: z.infer<typeof DiagnosisSchema>[];
  expectations: z.infer<typeof ExpectationSchema>[];
  draft?: string;
  reviewPass?: boolean;
  reviewIssues?: string[];
  reviewFixes?: string[];
  iterations?: number;
  summary?: string;
};

const formatSummaryInput = (state: SummaryStateType) => {
  return JSON.stringify(
    {
      area: state.area,
      audience: state.audience,
      symptomOrder: state.symptomOrder,
      symptoms: state.symptoms,
      negativeSymptoms: state.negativeSymptoms,
      questionsAsked: state.questionsAsked,
      diagnoses: state.diagnoses,
      expectations: state.expectations,
    },
    null,
    2
  );
};

const summariseNode: GraphNode<typeof SummaryState> = async (state) => {
  const input = formatSummaryInput(state);
  const messages = await summaryPrompt.formatMessages({ input });
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
  } catch (error) {
    return { pass: false, issues: ["QA review parse failed."], fixes: [] };
  }
};

const reviewNode: GraphNode<typeof SummaryState> = async (state) => {
  const context = formatSummaryInput(state);
  const formatInstructions = reviewParser.getFormatInstructions();
  const messages = await summaryReviewPrompt.formatMessages({
    context,
    draft: state.draft ?? "",
    format_instructions: formatInstructions,
  });
  const response = await summaryModel.invoke(messages);
  let review;
  try {
    review = await reviewParser.parse(response.content?.toString() ?? "");
  } catch (error) {
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

const reviseNode: GraphNode<typeof SummaryState> = async (state) => {
  const context = formatSummaryInput(state);
  const messages = await summaryRevisionPrompt.formatMessages({
    context,
    draft: state.draft ?? "",
    issues: (state.reviewIssues ?? []).join("\n- "),
    fixes: (state.reviewFixes ?? []).join("\n- "),
  });
  const response = await summaryModel.invoke(messages);
  return { draft: response.content?.toString() ?? "" };
};

const finalizeNode: GraphNode<typeof SummaryState> = async (state) => {
  return { summary: state.draft ?? "" };
};

const MAX_REVISIONS = 2;

const graph = new StateGraph(SummaryState)
  .addNode("summarise", summariseNode)
  .addNode("review", reviewNode)
  .addNode("revise", reviseNode)
  .addNode("finalize", finalizeNode)
  .addEdge(START, "summarise")
  .addEdge("summarise", "review")
  .addConditionalEdges(
    "review",
    (state: SummaryStateType) => {
      if (state.reviewPass) return "finalize";
      if ((state.iterations ?? 0) >= MAX_REVISIONS) return "finalize";
      return "revise";
    },
    ["revise", "finalize"]
  )
  .addEdge("revise", "review")
  .addEdge("finalize", END)
  .compile();

export type SummaryInput = z.infer<typeof SummaryInputSchema>;

export async function generateSummary(input: SummaryInput) {
  return graph.invoke({
    area: input.area,
    audience: input.audience,
    symptomOrder: input.symptomOrder,
    symptoms: input.symptoms,
    negativeSymptoms: input.negativeSymptoms,
    questionsAsked: input.questionsAsked,
    diagnoses: input.diagnoses,
    expectations: input.expectations,
  });
}

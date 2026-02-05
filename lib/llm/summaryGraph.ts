import { StateGraph, StateSchema, GraphNode, START, END } from "@langchain/langgraph";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { summaryModel } from "@/lib/llm/model";
import { summaryPrompt } from "@/lib/llm/summaryPrompt";
import { summaryReviewPrompt } from "@/lib/llm/summaryReviewPrompt";
import { summaryRevisionPrompt } from "@/lib/llm/summaryRevisionPrompt";

const StepSchema = z.object({
  step: z.number(),
  title: z.string(),
  prompt: z.string().nullable().optional(),
  selectedOption: z.string().nullable().optional(),
  type: z.enum(["question", "action"]),
  content: z.array(z.string()).optional(),
});

const OutcomeSchema = z
  .object({
    title: z.string(),
    content: z.array(z.string()).optional(),
  })
  .optional();

export const SummaryInputSchema = z.object({
  treeId: z.string(),
  treeLabel: z.string(),
  steps: z.array(StepSchema),
  outcome: OutcomeSchema,
});

const SummaryState = new StateSchema({
  treeLabel: z.string(),
  steps: z.array(StepSchema),
  outcome: OutcomeSchema,
  draft: z.string().optional(),
  reviewPass: z.boolean().optional(),
  reviewIssues: z.array(z.string()).optional(),
  reviewFixes: z.array(z.string()).optional(),
  iterations: z.number().optional(),
  summary: z.string().optional(),
});

type SummaryStateType = {
  treeLabel: string;
  steps: z.infer<typeof StepSchema>[];
  outcome?: z.infer<typeof OutcomeSchema>;
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
      tree: state.treeLabel,
      steps: state.steps,
      outcome: state.outcome ?? null,
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
    treeLabel: input.treeLabel,
    steps: input.steps,
    outcome: input.outcome,
  });
}

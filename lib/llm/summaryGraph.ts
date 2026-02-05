import { StateGraph, StateSchema, GraphNode, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { summaryModel } from "@/lib/llm/model";
import { summaryPrompt } from "@/lib/llm/summaryPrompt";

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
  summary: z.string().optional(),
});

type SummaryStateType = {
  treeLabel: string;
  steps: z.infer<typeof StepSchema>[];
  outcome?: z.infer<typeof OutcomeSchema>;
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
  return { summary: response.content?.toString() ?? "" };
};

const graph = new StateGraph(SummaryState)
  .addNode("summarise", summariseNode)
  .addEdge(START, "summarise")
  .addEdge("summarise", END)
  .compile();

export type SummaryInput = z.infer<typeof SummaryInputSchema>;

export async function generateSummary(input: SummaryInput) {
  return graph.invoke({
    treeLabel: input.treeLabel,
    steps: input.steps,
    outcome: input.outcome,
  });
}

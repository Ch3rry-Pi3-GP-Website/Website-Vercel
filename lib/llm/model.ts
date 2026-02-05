import { ChatOpenAI } from "@langchain/openai";

export const summaryModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

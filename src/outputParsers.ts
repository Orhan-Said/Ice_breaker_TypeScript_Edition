import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

export const summarySchema = z.object({
  summary: z.string().describe("summary"),
  facts: z.array(z.string()).describe("interesting facts about them"),
});

export type Summary = z.infer<typeof summarySchema>;

/**
 * A structured output parser that expects `summary` and `facts`.
 */
export const summaryParser = z.object({
  summary: z.string(),
  facts: z.array(z.string()),
});

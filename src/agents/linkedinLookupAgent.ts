import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { getProfileUrlTavily } from "../tools/tools.js";

/**
 * Looks up a person's LinkedIn profile by name.
 */
export async function lookup(name: string): Promise<string> {
  // Create LLM
  const llm = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  });

  // Prompt template
  const template = `given the full name {name_of_person} I want you to get me a link to their Linkedin profile page.
Your answer should contain only a URL`;

  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["name_of_person"],
  });

  // Our single tool (for crawling)
  const toolsForAgent = [
    new DynamicTool({
      name: "Crawl Google 4 linkedin profile page",
      description: "useful for when you need the Linkedin Page URL",
      func: async (query: string) => {
        return getProfileUrlTavily(query);
      },
    }),
  ];

  const agentExecutor = await initializeAgentExecutorWithOptions(
    toolsForAgent,
    llm,
    {
      agentType: "zero-shot-react-description",
      verbose: true,
    }
  );

  // Format the input to the prompt
  const input = promptTemplate.format({
    name_of_person: name,
  });

  // Call the agent
  const result = await agentExecutor.invoke({ input });

  // The final agent response is in result.output
  const linkedProfileUrl = result.output;

  return linkedProfileUrl;
}

// For debugging / local testing
if (import.meta.url === new URL(import.meta.url).href) {
  (async () => {
    const url = await lookup("Eden Marco Udemy");
    console.log(url);
  })();
}

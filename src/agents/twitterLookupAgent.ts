import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { getProfileUrlTavily } from "../tools/tools.js";

/**
 * Looks up a person's Twitter username by name.
 */
export async function lookup(name: string): Promise<string> {
  const llm = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  });

  const template = `
    given the name {name_of_person} I want you to find a link to their Twitter profile page, 
    and extract from it their username. 
    In Your Final answer only the person's username
  `;

  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ["name_of_person"],
  });

  const toolsForAgent = [
    new DynamicTool({
      name: "Crawl Google 4 Twitter profile page",
      description: "useful for when you need the Twitter Page URL",
      func: async (query: string) => {
        // The agent will call this with the name (or any text) you provide
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

  const input = promptTemplate.format({
    name_of_person: name,
  });
  const result = await agentExecutor.invoke({
    input: `Given the full name ${name}, find a link to their LinkedIn profile page. Only provide the URL.`,
  });

  const twitterUsername = result.output;
  return twitterUsername;
}

// For debugging / local testing
if (import.meta.url === new URL(import.meta.url).href) {
  (async () => {
    const username = await lookup("Elon Musk");
    console.log(username);
  })();
}

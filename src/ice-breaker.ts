import "dotenv/config";
import { summaryParser, Summary } from "./outputParsers.js";
import { scrapeLinkedinProfile } from "./third_parties/linkedin.js";
import { lookup as linkedinLookupAgent } from "./agents/linkedinLookupAgent.js";
import { lookup as twitterLookupAgent } from "./agents/twitterLookupAgent.js";
import { scrapeUserTweets } from "./third_parties/twitter.js";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

/**
 * Pull together LinkedIn & Twitter data, then generate a summary & facts.
 */
export async function iceBreakWith(
  name: string
): Promise<{ summary: Summary; profilePicUrl?: string }> {
  // 1) find LinkedIn profile
  const linkedinUsername = await linkedinLookupAgent(name);
  const linkedinData = await scrapeLinkedinProfile(linkedinUsername, true);

  // 2) find Twitter username
  const twitterUsername = await twitterLookupAgent(name);
  const tweets = await scrapeUserTweets(twitterUsername, 5, true);

  // 3) Prompt for summary
  const summaryTemplate = `
  given the information about a person from linkedin {information},
  and their latest twitter posts {twitter_posts} I want you to create:
  1. A short summary
  2. two interesting facts about them

  Use both information from twitter and Linkedin

  {format_instructions}
  `;
  // Create formatting instructions
  const formatInstructions = `
  The response should be a JSON object with the following structure:
  {
    "summary": "A concise summary of the person",
    "facts": ["Interesting fact 1", "Interesting fact 2"]
  }`;
  const summaryPrompt = new PromptTemplate({
    template: summaryTemplate,
    inputVariables: ["information", "twitter_posts"],
    partialVariables: {
      format_instructions: formatInstructions,
    },
  });

  // 4) LLM
  const llm = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  });

  // 5) Run the prompt and parse the result
  const prompt = await summaryPrompt.format({
    information: JSON.stringify(linkedinData),
    twitter_posts: JSON.stringify(tweets),
  });

  const llmResult = await llm.invoke(prompt);
  // Convert the message content to string
  const resultContent = llmResult.content.toString();
  const parsedSummary = await summaryParser.parse(resultContent);

  // Return the structure plus a profile picture
  return {
    summary: parsedSummary,
    profilePicUrl: linkedinData.profile_pic_url || "",
  };
}

if (import.meta.url === new URL(import.meta.url).href) {
  (async () => {
    console.log("Ice Breaker Enter");
    const result = await iceBreakWith("Harrison Chase");
    console.log(result);
  })();
}

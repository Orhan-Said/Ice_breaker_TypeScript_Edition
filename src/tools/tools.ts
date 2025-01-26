import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

export async function getProfileUrlTavily(name: string): Promise<string> {
  try {
    const search = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY, // You'll need this
    });
    const res = await search.invoke(name + " twitter profile");

    if (!res || !res[0]?.url) {
      throw new Error("No results found");
    }

    return res[0].url;
  } catch (error) {
    console.error("Error in getProfileUrlTavily:", error);
    throw error;
  }
}

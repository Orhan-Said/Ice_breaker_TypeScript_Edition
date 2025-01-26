import "dotenv/config";
import axios from "axios";
import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || "",
  appSecret: process.env.TWITTER_API_KEY_SECRET || "",
  accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
});

// If you only need Bearer token, you can do:
// const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');

export interface TweetData {
  text: string;
  url: string;
}

/**
 * Scrapes a Twitter user's recent tweets.
 * If mock is true, fetches from a Gist for demonstration data.
 */
export async function scrapeUserTweets(
  username: string,
  numTweets = 5,
  mock = false
): Promise<TweetData[]> {
  if (mock) {
    // Return gist data
    const gistUrl =
      "https://gist.githubusercontent.com/emarco177/827323bb599553d0f0e662da07b9ff68/raw/57bf38cf8acce0c87e060f9bb51f6ab72098fbd6/eden-marco-twitter.json";
    const response = await axios.get(gistUrl, { timeout: 5000 });
    return response.data.map((t: any) => ({
      text: t.text,
      url: t.url,
    }));
  } else {
    // Real Twitter API call
    const user = await twitterClient.v2.userByUsername(username);
    if (!user.data) {
      return [];
    }
    const userId = user.data.id;
    const tweetsResponse = await twitterClient.v2.userTimeline(userId, {
      exclude: ["replies", "retweets"],
      max_results: numTweets,
    });

    if (!tweetsResponse.data?.data) {
      return [];
    }
    return tweetsResponse.data.data.map((tweet) => ({
      text: tweet.text,
      url: `https://twitter.com/${username}/status/${tweet.id}`,
    }));
  }
}

// Debug
if (import.meta.url === new URL(import.meta.url).href) {
  (async () => {
    const tweets = await scrapeUserTweets("EdenEmarco177", 5, true);
    console.log(tweets);
  })();
}

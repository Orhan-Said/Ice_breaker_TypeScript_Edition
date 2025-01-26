import "dotenv/config";
import axios from "axios";

interface LinkedInData {
  [key: string]: any;
}

/**
 * Scrape LinkedIn profile data.
 * If mock is true, it fetches from a Gist endpoint for sample data.
 * Otherwise, it uses Proxycurl's official API.
 */
export async function scrapeLinkedinProfile(
  linkedinProfileUrl: string,
  mock: boolean = false
): Promise<LinkedInData> {
  let responseData: any;

  if (mock) {
    // Gist link in original code
    const gistUrl =
      "https://gist.githubusercontent.com/emarco177/0d6a3f93dd06634d95e46a2782ed7490/raw/78233eb934aa9850b689471a604465b188e761a0/eden-marco.json";

    const response = await axios.get(gistUrl, {
      timeout: 10000,
    });
    responseData = response.data;
  } else {
    const apiEndpoint = "https://nubela.co/proxycurl/api/v2/linkedin";
    const proxycurlApiKey = process.env.PROXYCURL_API_KEY;

    const response = await axios.get(apiEndpoint, {
      headers: {
        Authorization: `Bearer ${proxycurlApiKey}`,
      },
      timeout: 10000,
      params: {
        url: linkedinProfileUrl,
      },
    });
    responseData = response.data;
  }

  // Filter data
  const filteredData: LinkedInData = {};
  for (const [k, v] of Object.entries(responseData)) {
    if (
      v !== null &&
      v !== "" &&
      !(Array.isArray(v) && v.length === 0) &&
      !["people_also_viewed", "certifications"].includes(k)
    ) {
      filteredData[k] = v;
    }
  }

  // For groups, remove profile_pic_url
  if (filteredData.groups) {
    filteredData.groups.forEach((group: any) => {
      delete group.profile_pic_url;
    });
  }

  return filteredData;
}

// Debug/Test
async function main() {
  const data = await scrapeLinkedinProfile(
    "https://www.linkedin.com/in/eden-marco/",
    false
  );
  console.log(data);
}

if (import.meta.url === new URL(import.meta.url).href) {
  main().catch(console.error);
}

import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import { iceBreakWith } from "./ice-breaker.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(fileUpload()); // or use express.urlencoded() if you prefer

// Serve the index.html from templates
app.get("/", (_req: Request, res: Response) => {
  // You can also consider serving it from a static dir
  res.sendFile(path.join(__dirname, "..", "templates", "index.html"));
});

// Handle POST /process
app.post("/process", async (req: Request, res: Response) => {
  try {
    const name = (req.files?.name || req.body.name || "") as string;
    // If using express-fileupload, you might do something else.
    // Or if using body-parser, it's simply req.body.name.

    const { summary, profilePicUrl } = await iceBreakWith(name);

    return res.json({
      summary_and_facts: {
        summary: summary.summary,
        facts: summary.facts,
      },
      picture_url: profilePicUrl,
    });
  } catch (error) {
    console.error("Error in /process route:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

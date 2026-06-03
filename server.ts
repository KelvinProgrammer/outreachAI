import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Establish Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// AI outreach template generation
app.post("/api/generate-template", async (req, res) => {
  try {
    const { leadName, leadTitle, leadCompany, leadPlatform, customPrompt } = req.body;
    
    const ai = getGeminiClient();
    
    if (!ai) {
      // Return a refined template if no API key is set
      const fallbackSubject = `Optimizing lead pipeline for ${leadCompany || "your team"}`;
      const fallbackBody = `Hey ${leadName || "there"},\n\nI was looking at your professional profile on ${leadPlatform || "LinkedIn"} and was really impressed by your role as ${leadTitle || "Operator"} at ${leadCompany || "your company"}.\n\nI wanted to connect and see how we can help automate outbound prospecting and drive scalable user growth.\n\nBest regards,\nNexus Operator`;
      
      return res.json({
        subject: fallbackSubject,
        body: fallbackBody,
        warning: "Gemini API Key is not set in Secrets. Using high-fidelity heuristic generator instead."
      });
    }

    const defaultPrompt = `Write a highly compelling, professional, hyper-personalized short cold email (no more than 3 sentences) to ${leadName}, who is a ${leadTitle} at ${leadCompany}. 
We discovered their profile via ${leadPlatform}. 
Include a concise, attention-grabbing subject line. 
Keep the tone natural, highly focused, professional but modern. Include a brief call to action.
${customPrompt ? `Incorporate this specific constraint: ${customPrompt}` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: defaultPrompt,
      config: {
        systemInstruction: "You are an elite enterprise outbound sales copywriting expert. Always structure your response as JSON with exactly two fields: 'subject' (string) and 'body' (string). Do not include any standard enclosing markdown tags like ```json or anything else. Just return pure parseable JSON.",
        responseMimeType: "application/json",
        temperature: 0.8,
      }
    });

    const parsedText = response.text || "";
    try {
      const parsed = JSON.parse(parsedText.trim());
      res.json(parsed);
    } catch (parseError) {
      // Simple fallback extraction if response has enclosing brackets but failed direct JSON parsing
      const jsonStart = parsedText.indexOf("{");
      const jsonEnd = parsedText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
          const sliceStr = parsedText.substring(jsonStart, jsonEnd + 1);
          const parsedSlice = JSON.parse(sliceStr);
          return res.json(parsedSlice);
        } catch (e2) {}
      }
      
      res.json({
        subject: `Partnership exploration // ${leadCompany}`,
        body: parsedText.replace(/[\{\}"]/g, "").trim() || `Hi ${leadName},\n\nReaching out from OutreachAI. Let's talk about lead optimizations at ${leadCompany}.`
      });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during template generation." });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

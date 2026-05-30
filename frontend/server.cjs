var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new import_genai.GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.post("/api/generate-template", async (req, res) => {
  try {
    const { leadName, leadTitle, leadCompany, leadPlatform, customPrompt } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      const fallbackSubject = `Optimizing lead pipeline for ${leadCompany || "your team"}`;
      const fallbackBody = `Hey ${leadName || "there"},

I was looking at your professional profile on ${leadPlatform || "LinkedIn"} and was really impressed by your role as ${leadTitle || "Operator"} at ${leadCompany || "your company"}.

I wanted to connect and see how we can help automate outbound prospecting and drive scalable user growth.

Best regards,
Nexus Operator`;
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
        temperature: 0.8
      }
    });
    const parsedText = response.text || "";
    try {
      const parsed = JSON.parse(parsedText.trim());
      res.json(parsed);
    } catch (parseError) {
      const jsonStart = parsedText.indexOf("{");
      const jsonEnd = parsedText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
          const sliceStr = parsedText.substring(jsonStart, jsonEnd + 1);
          const parsedSlice = JSON.parse(sliceStr);
          return res.json(parsedSlice);
        } catch (e2) {
        }
      }
      res.json({
        subject: `Partnership exploration // ${leadCompany}`,
        body: parsedText.replace(/[\{\}"]/g, "").trim() || `Hi ${leadName},

Reaching out from OutreachAI. Let's talk about lead optimizations at ${leadCompany}.`
      });
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during template generation." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();

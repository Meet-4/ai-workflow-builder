import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "your_api_key_here") {
  console.warn("⚠️ GEMINI_API_KEY is missing or invalid. Will use smart fallback generator.");
}

// Initialize the SDK
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Zod Schema for validation
export const workflowSchema = z.object({
  trigger: z.enum(["manual_trigger", "pdf_upload", "webhook"]),
  steps: z.array(
    z.object({
      type: z.enum(["summarize_pdf", "save_db", "send_email"]),
    })
  ),
});

export type GeneratedWorkflow = z.infer<typeof workflowSchema>;

const systemInstruction = `
You are an expert AI workflow architect. Your job is to translate a user's natural language description of an automation into a structured JSON workflow.

You must return ONLY a JSON object that strictly adheres to this schema:
{
  "trigger": "manual_trigger" | "pdf_upload" | "webhook",
  "steps": [
    { "type": "summarize_pdf" | "save_db" | "send_email" }
  ]
}

Available Triggers:
- manual_trigger: For tasks the user wants to run on demand (e.g., "when I click start", "run this now").
- pdf_upload: When a file or document is uploaded.
- webhook: When external data is received.

Available Action Steps:
- summarize_pdf: Extracting insights, summarizing, or reading a document.
- save_db: Saving, storing, or logging data.
- send_email: Notifying, emailing, or messaging someone.

Rules:
1. Always map the user's intent to the closest available trigger and actions.
2. If the user's request is gibberish or impossible to map, default to "manual_trigger" and an empty steps array.
3. Output valid JSON only, without any markdown formatting blocks like \`\`\`json.
`;

/**
 * Smart fallback generator — works 100% offline with no API.
 * Analyses the prompt with keyword matching and produces a sensible workflow.
 */
function generateFallbackWorkflow(prompt: string): GeneratedWorkflow {
  const lower = prompt.toLowerCase();

  // --- Determine Trigger ---
  let trigger: GeneratedWorkflow["trigger"] = "manual_trigger";
  if (
    lower.includes("pdf") ||
    lower.includes("upload") ||
    lower.includes("file") ||
    lower.includes("document") ||
    lower.includes("attach")
  ) {
    trigger = "pdf_upload";
  } else if (
    lower.includes("webhook") ||
    lower.includes("api call") ||
    lower.includes("external") ||
    lower.includes("trigger from") ||
    lower.includes("incoming data") ||
    lower.includes("http request")
  ) {
    trigger = "webhook";
  }

  // --- Determine Steps ---
  const steps: GeneratedWorkflow["steps"] = [];

  const wantsSummarize =
    lower.includes("summar") ||
    lower.includes("extract") ||
    lower.includes("read") ||
    lower.includes("analyz") ||
    lower.includes("insight") ||
    lower.includes("parse") ||
    lower.includes("process") ||
    lower.includes("library") ||
    lower.includes("book") ||
    lower.includes("content");

  const wantsSaveDb =
    lower.includes("save") ||
    lower.includes("store") ||
    lower.includes("log") ||
    lower.includes("record") ||
    lower.includes("database") ||
    lower.includes("db") ||
    lower.includes("persist") ||
    lower.includes("maintain") ||
    lower.includes("track") ||
    lower.includes("keep");

  const wantsEmail =
    lower.includes("email") ||
    lower.includes("notify") ||
    lower.includes("notif") ||
    lower.includes("send") ||
    lower.includes("alert") ||
    lower.includes("message") ||
    lower.includes("report") ||
    lower.includes("mail");

  if (wantsSummarize) steps.push({ type: "summarize_pdf" });
  if (wantsSaveDb) steps.push({ type: "save_db" });
  if (wantsEmail) steps.push({ type: "send_email" });

  // If nothing matched, give a sensible default
  if (steps.length === 0) {
    steps.push({ type: "save_db" });
  }

  return { trigger, steps };
}

export async function generateWorkflowJson(prompt: string): Promise<GeneratedWorkflow> {
  // If no valid API key, go straight to fallback
  if (!apiKey || apiKey === "your_api_key_here") {
    console.log("ℹ️  No Gemini API key — using smart keyword fallback.");
    return generateFallbackWorkflow(prompt);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    const parsedJson = JSON.parse(text);

    // Validate the structure with Zod
    const validatedData = workflowSchema.parse(parsedJson);
    return validatedData;

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);

    // Detect quota / rate-limit errors (status 429) — fall back gracefully
    const isQuotaError =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.message?.includes("quota") ||
      error?.message?.includes("rate");

    if (isQuotaError) {
      console.warn("⚠️  Gemini quota exceeded — using smart keyword fallback.");
      return generateFallbackWorkflow(prompt);
    }

    // For other errors, surface a clean message
    let apiError = "Failed to generate workflow. Please try rephrasing your prompt.";
    if (error?.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed?.error?.message) {
          apiError = parsed.error.message;
        } else {
          apiError = error.message;
        }
      } catch {
        apiError = error.message;
      }
    }

    throw new Error(apiError);
  }
}

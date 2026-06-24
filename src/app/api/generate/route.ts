import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";
import { generateWorkflowJson } from "@/lib/gemini";
import { localStore } from "@/lib/local-store";
import { normaliseLegacyType } from "@/lib/node-registry";

const COLLECTION = "workflows";
const MOCK_USER = "mock-user-123";

/** Maps Gemini trigger strings → React Flow node types */
const TRIGGER_NODE_TYPE: Record<string, string> = {
  manual_trigger: "manualTrigger",
  pdf_upload:     "pdfUpload",
  webhook:        "webhookTrigger",
};

/** Maps Gemini step strings → React Flow node types + labels */
const STEP_NODE_MAP: Record<string, { type: string; label: string }> = {
  summarize_pdf: { type: "aiSummary",    label: "AI Summary" },
  save_db:       { type: "saveDatabase", label: "Save to Database" },
  send_email:    { type: "sendEmail",    label: "Send Email" },
};

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt provided" }, { status: 400 });
    }

    // 1. Generate structured JSON using Gemini (with smart fallback on quota errors)
    const generatedData = await generateWorkflowJson(prompt);

    // 2. Convert to React Flow format using canonical node types
    const nodes: Record<string, unknown>[] = [];
    const edges: Record<string, unknown>[] = [];

    // Trigger node
    const triggerType = TRIGGER_NODE_TYPE[generatedData.trigger] ?? normaliseLegacyType(generatedData.trigger);
    nodes.push({
      id: "node-0",
      type: triggerType,
      position: { x: 250, y: 80 },
      data: {
        label: generatedData.trigger.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `Trigger: ${generatedData.trigger}`,
      },
    });

    // Step / action nodes
    generatedData.steps.forEach((step, index) => {
      const nodeId = `node-${index + 1}`;
      const stepDef = STEP_NODE_MAP[step.type] ?? { type: normaliseLegacyType(step.type), label: step.type };

      nodes.push({
        id: nodeId,
        type: stepDef.type,
        position: { x: 250, y: 80 + (index + 1) * 160 },
        data: {
          label: stepDef.label,
          description: `Action: ${step.type}`,
        },
      });

      edges.push({
        id: `edge-${index}-${index + 1}`,
        source: `node-${index}`,
        target: nodeId,
        type: "smoothstep",
        animated: true,
      });
    });

    const workflowJson = { nodes, edges };

    const doc = {
      userId: MOCK_USER,
      title: "AI Generated Workflow",
      description: prompt.substring(0, 120) + (prompt.length > 120 ? "..." : ""),
      workflowJson,
    };

    // 3. Try to save to MongoDB; fall back to local store on failure
    let saved: Record<string, unknown>;
    try {
      await connectToDatabase();
      const created = await Workflow.create(doc);
      saved = created.toObject() as unknown as Record<string, unknown>;
    } catch {
      console.info("MongoDB unavailable — persisting to local store.");
      saved = localStore.insert(COLLECTION, doc);
    }

    return NextResponse.json({
      success: true,
      workflowId: saved._id,
      generatedFormat: generatedData,
      flowData: workflowJson,
    });

  } catch (error) {
    console.error("API Generate Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

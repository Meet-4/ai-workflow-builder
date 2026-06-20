import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";
import { generateWorkflowJson } from "@/lib/gemini";
import { localStore } from "@/lib/local-store";

const COLLECTION = "workflows";
const MOCK_USER = "mock-user-123";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt provided" }, { status: 400 });
    }

    // 1. Generate structured JSON using Gemini (with smart fallback on quota errors)
    const generatedData = await generateWorkflowJson(prompt);

    // 2. Convert to React Flow format
    const nodes: Record<string, unknown>[] = [];
    const edges: Record<string, unknown>[] = [];

    // Add Trigger Node
    nodes.push({
      id: "node-0",
      type: "triggerNode",
      position: { x: 250, y: 100 },
      data: { label: generatedData.trigger, type: "trigger" },
    });

    // Add Action Nodes
    generatedData.steps.forEach((step, index) => {
      const nodeId = `node-${index + 1}`;
      nodes.push({
        id: nodeId,
        type: "actionNode",
        position: { x: 250, y: 100 + (index + 1) * 150 },
        data: { label: step.type, type: "action" },
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
      description: prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""),
      workflowJson,
    };

    // 3. Try to save to MongoDB; fall back to local store on failure
    let saved: Record<string, unknown>;
    try {
      await connectToDatabase();
      saved = (await Workflow.create(doc)).toObject();
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

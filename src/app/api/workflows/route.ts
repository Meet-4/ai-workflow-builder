import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";
import { localStore } from "@/lib/local-store";

const COLLECTION = "workflows";
const MOCK_USER = "mock-user-123";

export async function GET() {
  // Try MongoDB first
  try {
    await connectToDatabase();
    const workflows = await Workflow.find({ userId: MOCK_USER }).sort({ createdAt: -1 });
    return NextResponse.json(workflows);
  } catch {
    // Fall back to local store
    const workflows = localStore.find(COLLECTION, { userId: MOCK_USER });
    return NextResponse.json(workflows);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, workflowJson } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const doc = {
      userId: MOCK_USER,
      title,
      description: description || "",
      workflowJson: workflowJson || { nodes: [], edges: [] },
    };

    // Try MongoDB first
    try {
      await connectToDatabase();
      const newWorkflow = await Workflow.create(doc);
      return NextResponse.json(newWorkflow, { status: 201 });
    } catch {
      // Fall back to local store
      const saved = localStore.insert(COLLECTION, doc);
      return NextResponse.json(saved, { status: 201 });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

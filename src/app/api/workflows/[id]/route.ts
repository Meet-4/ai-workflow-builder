import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";
import { localStore } from "@/lib/local-store";

const COLLECTION = "workflows";
const MOCK_USER = "mock-user-123";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Local-store IDs start with "local-" — skip MongoDB entirely for those
  const isLocalId = id.startsWith("local-");

  if (!isLocalId) {
    // Try MongoDB first
    try {
      await connectToDatabase();
      const workflow = await Workflow.findOne({ _id: id, userId: MOCK_USER });
      if (!workflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
      }
      return NextResponse.json(workflow);
    } catch {
      // Fall through to local store on any DB error
    }
  }

  // Fall back to local store
  const workflow = localStore.findById(COLLECTION, id);
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }
  return NextResponse.json(workflow);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { title, description, workflowJson } = await req.json();

    const isLocalId = id.startsWith("local-");

    if (!isLocalId) {
      // Try MongoDB first
      try {
        await connectToDatabase();
        const workflow = await Workflow.findOne({ _id: id, userId: MOCK_USER });
        if (!workflow) {
          return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 });
        }
        if (title !== undefined) workflow.title = title;
        if (description !== undefined) workflow.description = description;
        if (workflowJson !== undefined) workflow.workflowJson = workflowJson;
        await workflow.save();
        return NextResponse.json(workflow);
      } catch {
        // Fall through to local store on DB error
      }
    }

    // Fall back to local store
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (workflowJson !== undefined) update.workflowJson = workflowJson;

    const updated = localStore.updateById(COLLECTION, id, update);
    if (!updated) {
      return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const isLocalId = id.startsWith("local-");

  if (!isLocalId) {
    // Try MongoDB first
    try {
      await connectToDatabase();
      const deletedWorkflow = await Workflow.findOneAndDelete({ _id: id, userId: MOCK_USER });
      if (!deletedWorkflow) {
        return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 });
      }
      return NextResponse.json({ message: "Workflow deleted successfully" });
    } catch {
      // Fall through to local store on DB error
    }
  }

  // Fall back to local store
  const deleted = localStore.deleteById(COLLECTION, id);
  if (!deleted) {
    return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 });
  }
  return NextResponse.json({ message: "Workflow deleted successfully" });
}

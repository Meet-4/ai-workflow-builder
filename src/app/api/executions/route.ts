import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";
import Execution from "@/models/Execution";
import { localStore } from "@/lib/local-store";

const WF_COLLECTION = "workflows";
const EX_COLLECTION = "executions";
const MOCK_USER = "mock-user-123";

export async function GET() {
  // Try MongoDB first
  try {
    await connectToDatabase();

    const workflows = await Workflow.find({ userId: MOCK_USER }).select("_id");
    const workflowIds = workflows.map((w) => w._id);

    if (workflowIds.length === 0) return NextResponse.json([]);

    const executions = await Execution.find({ workflowId: { $in: workflowIds } })
      .populate("workflowId", "title")
      .sort({ executedAt: -1 });

    return NextResponse.json(executions);
  } catch {
    // Fall back to local store
    const localWorkflows = localStore.find(WF_COLLECTION, { userId: MOCK_USER });
    const wfIds = localWorkflows.map((w) => w._id);
    const executions = localStore
      .find(EX_COLLECTION)
      .filter((e: Record<string, unknown>) => wfIds.includes(e.workflowId as string));
    return NextResponse.json(executions);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { workflowId, status, logs } = await req.json();

    if (!workflowId || !status) {
      return NextResponse.json(
        { error: "workflowId and status are required" },
        { status: 400 }
      );
    }

    // Try MongoDB first
    try {
      await connectToDatabase();

      const workflow = await Workflow.findOne({ _id: workflowId, userId: MOCK_USER });
      if (!workflow) {
        return NextResponse.json(
          { error: "Workflow not found or unauthorized" },
          { status: 404 }
        );
      }

      const newExecution = await Execution.create({ workflowId, status, logs: logs || [] });
      return NextResponse.json(newExecution, { status: 201 });
    } catch {
      // Fall back to local store
      const wf = localStore.findById(WF_COLLECTION, workflowId);
      if (!wf) {
        return NextResponse.json(
          { error: "Workflow not found or unauthorized" },
          { status: 404 }
        );
      }

      const saved = localStore.insert(EX_COLLECTION, {
        workflowId,
        status,
        logs: logs || [],
        executedAt: new Date().toISOString(),
      });
      return NextResponse.json(saved, { status: 201 });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";
import Execution from "@/models/Execution";

export async function GET() {
  const userId = "mock-user-123";

  try {
    await connectToDatabase();

    // Fetch user workflows first
    const workflows = await Workflow.find({ userId }).select("_id");
    const workflowIds = workflows.map((w) => w._id);

    if (workflowIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch executions related to those workflows
    const executions = await Execution.find({ workflowId: { $in: workflowIds } })
      .populate("workflowId", "title")
      .sort({ executedAt: -1 });

    return NextResponse.json(executions);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = "mock-user-123";

  try {
    const { workflowId, status, logs } = await req.json();

    if (!workflowId || !status) {
      return NextResponse.json({ error: "workflowId and status are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify workflow belongs to the user
    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 });
    }

    const newExecution = await Execution.create({
      workflowId,
      status,
      logs: logs || [],
    });

    return NextResponse.json(newExecution, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";

export async function GET() {
  const userId = "mock-user-123";

  try {
    await connectToDatabase();
    const workflows = await Workflow.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(workflows);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = "mock-user-123";

  try {
    const { title, description, workflowJson } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectToDatabase();

    const newWorkflow = await Workflow.create({
      userId,
      title,
      description: description || "",
      workflowJson: workflowJson || { nodes: [], edges: [] },
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

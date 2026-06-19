import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = "mock-user-123";
  const { id } = await params;

  try {
    await connectToDatabase();
    const workflow = await Workflow.findOne({ _id: id, userId });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = "mock-user-123";
  const { id } = await params;

  try {
    const { title, description, workflowJson } = await req.json();
    await connectToDatabase();

    const workflow = await Workflow.findOne({ _id: id, userId });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 });
    }

    if (title !== undefined) workflow.title = title;
    if (description !== undefined) workflow.description = description;
    if (workflowJson !== undefined) workflow.workflowJson = workflowJson;

    await workflow.save();

    return NextResponse.json(workflow);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = "mock-user-123";
  const { id } = await params;

  try {
    await connectToDatabase();
    const deletedWorkflow = await Workflow.findOneAndDelete({ _id: id, userId });

    if (!deletedWorkflow) {
      return NextResponse.json({ error: "Workflow not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Workflow deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/executions/run
 *
 * Executes a workflow using the FlowMind engine and persists the result.
 * Body: { workflowId: string, workflowJson: { nodes, edges } }
 */

import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflow-engine";
import { connectToDatabase } from "@/lib/db";
import Execution from "@/models/Execution";
import { localStore } from "@/lib/local-store";

const EX_COLLECTION = "executions";

export async function POST(req: NextRequest) {
  try {
    const { workflowId, workflowJson } = await req.json();

    if (!workflowId || !workflowJson) {
      return NextResponse.json(
        { error: "workflowId and workflowJson are required" },
        { status: 400 }
      );
    }

    // Run the engine
    const result = await executeWorkflow(workflowId, workflowJson);

    // Persist the execution record
    const execDoc = {
      workflowId,
      status: result.status,
      logs: result.logs,
      durationMs: result.durationMs,
      nodeResults: result.nodeResults,
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      executedAt: new Date(result.startedAt).toISOString(),
    };

    try {
      await connectToDatabase();
      await Execution.create({
        workflowId,
        status: result.status,
        logs: result.logs,
      });
    } catch {
      // MongoDB unavailable — persist to local store
      localStore.insert(EX_COLLECTION, execDoc);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Execution run error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution failed" },
      { status: 500 }
    );
  }
}

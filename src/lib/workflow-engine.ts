/**
 * workflow-engine.ts
 *
 * The FlowMind AI execution engine.
 *
 * Architecture:
 *   executeWorkflow(workflow) → ExecutionResult
 *
 * The engine:
 *   1. Resolves the topological execution order from nodes + edges
 *   2. Runs each node executor in sequence
 *   3. Maintains per-step logs
 *   4. Tracks failures and surfaces them cleanly
 *   5. Returns a full ExecutionResult with status and logs
 *
 * Adding a new integration:
 *   - Add a case to NODE_EXECUTORS below
 *   - Each executor receives (node, context) and returns NodeResult
 */

import { normaliseLegacyType } from "./node-registry";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface WorkflowNode {
  id: string;
  type?: string;
  data: {
    label: string;
    description?: string;
    config?: Record<string, string>;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowPayload {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface NodeResult {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: "success" | "failed" | "skipped";
  message: string;
  durationMs: number;
  output?: Record<string, unknown>;
}

export interface ExecutionResult {
  status: "success" | "failed";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  nodeResults: NodeResult[];
  logs: string[];
}

// ─────────────────────────────────────────────────────────────
// Execution context — passed to every executor
// ─────────────────────────────────────────────────────────────

interface ExecutionContext {
  workflowId: string;
  /** Accumulated outputs from previous nodes — executors can read these */
  outputs: Record<string, Record<string, unknown>>;
  logs: string[];
}

// ─────────────────────────────────────────────────────────────
// Node Executors
// Simulated execution — swap these for real API calls in production
// ─────────────────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type NodeExecutor = (
  node: WorkflowNode,
  ctx: ExecutionContext
) => Promise<{ status: "success" | "failed"; message: string; output?: Record<string, unknown> }>;

const NODE_EXECUTORS: Record<string, NodeExecutor> = {
  // ── Triggers ──────────────────────────────────────────────
  manualTrigger: async (node) => {
    await sleep(120);
    return {
      status: "success",
      message: `Trigger "${node.data.label}" fired — workflow started.`,
      output: { triggeredAt: new Date().toISOString(), source: "manual" },
    };
  },

  pdfUpload: async (node) => {
    await sleep(200);
    return {
      status: "success",
      message: `PDF trigger "${node.data.label}" activated — document ready for processing.`,
      output: { fileName: "document.pdf", pages: 12, sizeKb: 420 },
    };
  },

  webhookTrigger: async (node) => {
    await sleep(150);
    return {
      status: "success",
      message: `Webhook "${node.data.label}" received — payload parsed successfully.`,
      output: { method: "POST", payload: { event: "ping", ts: Date.now() } },
    };
  },

  scheduleTrigger: async (node) => {
    await sleep(100);
    return {
      status: "success",
      message: `Schedule "${node.data.label}" triggered on cron cycle.`,
      output: { scheduledAt: new Date().toISOString() },
    };
  },

  // ── AI / Agent ────────────────────────────────────────────
  aiSummary: async (node, ctx) => {
    await sleep(600);
    const prevOutput = Object.values(ctx.outputs).at(-1);
    const inputData = prevOutput ? JSON.stringify(prevOutput).slice(0, 80) : "incoming data";
    return {
      status: "success",
      message: `Gemini processed "${node.data.label}" — summary generated.`,
      output: {
        summary: `AI analysis of ${inputData}... key insights extracted successfully.`,
        model: "gemini-2.0-flash",
        tokensUsed: 312,
      },
    };
  },

  // ── Actions ───────────────────────────────────────────────
  saveDatabase: async (node) => {
    await sleep(300);
    return {
      status: "success",
      message: `"${node.data.label}" — record persisted to database.`,
      output: { recordId: `rec-${Date.now()}`, collection: "workflow_outputs" },
    };
  },

  sendEmail: async (node) => {
    await sleep(250);
    const to = node.data.config?.email || "user@example.com";
    return {
      status: "success",
      message: `"${node.data.label}" — email dispatched to ${to}.`,
      output: { to, subject: "Workflow Execution Result", messageId: `msg-${Date.now()}` },
    };
  },

  // ── Integrations ──────────────────────────────────────────
  slackMessage: async (node) => {
    await sleep(280);
    const channel = node.data.config?.channel || "#general";
    return {
      status: "success",
      message: `"${node.data.label}" — message posted to Slack ${channel}.`,
      output: { channel, ts: Date.now().toString() },
    };
  },

  githubIssue: async (node) => {
    await sleep(350);
    return {
      status: "success",
      message: `"${node.data.label}" — GitHub issue created successfully.`,
      output: { issueNumber: Math.floor(Math.random() * 500) + 1, state: "open" },
    };
  },

  notionPage: async (node) => {
    await sleep(320);
    return {
      status: "success",
      message: `"${node.data.label}" — content appended to Notion page.`,
      output: { pageId: `notion-${Date.now()}`, updatedAt: new Date().toISOString() },
    };
  },

  discordMessage: async (node) => {
    await sleep(200);
    return {
      status: "success",
      message: `"${node.data.label}" — Discord message sent.`,
      output: { messageId: `dc-${Date.now()}`, channel: "general" },
    };
  },

  googleDrive: async (node) => {
    await sleep(400);
    return {
      status: "success",
      message: `"${node.data.label}" — file uploaded to Google Drive.`,
      output: { fileId: `gdrive-${Date.now()}`, name: "output.txt" },
    };
  },
};

/** Fallback executor for unknown node types */
const fallbackExecutor: NodeExecutor = async (node) => {
  await sleep(150);
  return {
    status: "success",
    message: `Node "${node.data.label}" (${node.type ?? "unknown"}) executed.`,
    output: { note: "No specific executor registered for this node type." },
  };
};

// ─────────────────────────────────────────────────────────────
// Topological Sort
// Resolves execution order from edges so nodes always run
// after all their dependencies.
// ─────────────────────────────────────────────────────────────

function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adjList.set(n.id, []);
  }

  for (const e of edges) {
    adjList.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0);
  const sorted: WorkflowNode[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    for (const neighbour of adjList.get(node.id) ?? []) {
      const deg = (inDegree.get(neighbour) ?? 1) - 1;
      inDegree.set(neighbour, deg);
      if (deg === 0) {
        const n = nodes.find((x) => x.id === neighbour);
        if (n) queue.push(n);
      }
    }
  }

  // If there are nodes that weren't reached (e.g. disconnected), append them
  const sortedIds = new Set(sorted.map((n) => n.id));
  for (const n of nodes) {
    if (!sortedIds.has(n.id)) sorted.push(n);
  }

  return sorted;
}

// ─────────────────────────────────────────────────────────────
// Main Engine
// ─────────────────────────────────────────────────────────────

export async function executeWorkflow(
  workflowId: string,
  payload: WorkflowPayload
): Promise<ExecutionResult> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  const ctx: ExecutionContext = {
    workflowId,
    outputs: {},
    logs: [],
  };

  ctx.logs.push(`[${startedAt}] Workflow execution started. Nodes: ${payload.nodes.length}`);

  const orderedNodes = topologicalSort(payload.nodes, payload.edges);
  const nodeResults: NodeResult[] = [];
  let anyFailed = false;

  for (const node of orderedNodes) {
    const canonicalType = normaliseLegacyType(node.type ?? "");
    const executor = NODE_EXECUTORS[canonicalType] ?? fallbackExecutor;

    const nodeStart = Date.now();
    ctx.logs.push(`  → Executing: [${canonicalType}] "${node.data.label}"`);

    try {
      const result = await executor(node, ctx);
      const durationMs = Date.now() - nodeStart;

      const nodeResult: NodeResult = {
        nodeId: node.id,
        nodeType: canonicalType,
        nodeLabel: node.data.label,
        status: result.status,
        message: result.message,
        durationMs,
        output: result.output,
      };

      nodeResults.push(nodeResult);

      if (result.status === "success") {
        ctx.outputs[node.id] = result.output ?? {};
        ctx.logs.push(`     ✓ ${result.message} (${durationMs}ms)`);
      } else {
        anyFailed = true;
        ctx.logs.push(`     ✗ ${result.message} (${durationMs}ms)`);
        // Continue executing remaining nodes even after a failure
      }
    } catch (err) {
      const durationMs = Date.now() - nodeStart;
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      anyFailed = true;

      nodeResults.push({
        nodeId: node.id,
        nodeType: canonicalType,
        nodeLabel: node.data.label,
        status: "failed",
        message: `Executor threw: ${errorMsg}`,
        durationMs,
      });

      ctx.logs.push(`     ✗ Executor threw: ${errorMsg} (${durationMs}ms)`);
    }
  }

  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - startMs;
  const finalStatus = anyFailed ? "failed" : "success";

  ctx.logs.push(
    `[${finishedAt}] Execution ${finalStatus.toUpperCase()}. Total duration: ${durationMs}ms`
  );

  return {
    status: finalStatus,
    startedAt,
    finishedAt,
    durationMs,
    nodeResults,
    logs: ctx.logs,
  };
}

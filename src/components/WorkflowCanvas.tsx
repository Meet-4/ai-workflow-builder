"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Save,
  Play,
  Trash2,
  Check,
  AlertCircle,
  Settings,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nodeTypes } from "@/components/nodes";
import { NODE_REGISTRY, WorkflowNodeData, normaliseLegacyType } from "@/lib/node-registry";
import type { ExecutionResult } from "@/lib/workflow-engine";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Default canvas state
// ─────────────────────────────────────────────────────────────

const DEFAULT_NODES: Node<WorkflowNodeData>[] = [
  {
    id: "trigger-1",
    type: "manualTrigger",
    position: { x: 250, y: 60 },
    data: { label: "Manual Trigger", description: "Click Execute to start this workflow." },
  },
  {
    id: "agent-1",
    type: "aiSummary",
    position: { x: 250, y: 220 },
    data: { label: "AI Summary", description: "Processes input with Gemini Flash." },
  },
  {
    id: "action-1",
    type: "saveDatabase",
    position: { x: 250, y: 380 },
    data: { label: "Save to Database", description: "Stores the result payload." },
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: "e1-2", source: "trigger-1", target: "agent-1", animated: true },
  { id: "e2-3", source: "agent-1", target: "action-1", animated: true },
];

// ─────────────────────────────────────────────────────────────
// Node Palette groups
// ─────────────────────────────────────────────────────────────

const PALETTE_GROUPS = [
  { label: "Triggers",     category: "trigger" as const },
  { label: "AI / Actions", category: "action" as const,     extraCategory: "agent" as const },
  { label: "Integrations", category: "integration" as const },
] as const;

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function WorkflowCanvas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("id");

  // Metadata
  const [title, setTitle] = useState("My AI Workflow");
  const [description, setDescription] = useState("Automated sequence created with FlowMind AI");

  // Canvas state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [logsExpanded, setLogsExpanded] = useState(false);

  // ── Delete handler ──────────────────────────────────────────
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode((prev) => (prev?.id === id ? null : prev));
    },
    [setNodes, setEdges]
  );

  // ── Inject callbacks into node data ────────────────────────
  const withCallbacks = useCallback(
    (raw: Node<WorkflowNodeData>[]): Node<WorkflowNodeData>[] =>
      raw.map((n) => ({
        ...n,
        type: normaliseLegacyType(n.type ?? "") || n.type,
        data: { ...n.data, onDelete: handleDeleteNode },
      })),
    [handleDeleteNode]
  );

  // ── nodeTypes is stable — must be memoised ──────────────────
  const stableNodeTypes = useMemo(() => nodeTypes, []);

  // ── Load existing workflow ──────────────────────────────────
  useEffect(() => {
    if (workflowId) {
      fetch(`/api/workflows/${workflowId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          setTitle(data.title ?? "My AI Workflow");
          setDescription(data.description ?? "");
          const wj = data.workflowJson;
          if (wj?.nodes?.length) {
            setNodes(withCallbacks(wj.nodes));
            setEdges(wj.edges ?? []);
          } else {
            setNodes(withCallbacks(DEFAULT_NODES));
            setEdges(DEFAULT_EDGES);
          }
        })
        .catch(() => {
          setNodes(withCallbacks(DEFAULT_NODES));
          setEdges(DEFAULT_EDGES);
        });
    } else {
      setNodes(withCallbacks(DEFAULT_NODES));
      setEdges(DEFAULT_EDGES);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // ── Connect ─────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // ── Node click ──────────────────────────────────────────────
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  // ── Update selected node field ──────────────────────────────
  const updateSelectedNode = (field: "label" | "description", value: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, [field]: value } } : n
      )
    );
    setSelectedNode((prev) =>
      prev ? { ...prev, data: { ...prev.data, [field]: value } } : null
    );
  };

  // ── Add node from palette ───────────────────────────────────
  const addNode = (type: string, def: { name: string; defaultData: { label: string; description: string } }) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node<WorkflowNodeData> = {
      id,
      type: normaliseLegacyType(type) || type,
      position: { x: 120 + Math.random() * 180, y: 120 + Math.random() * 200 },
      data: { ...def.defaultData, onDelete: handleDeleteNode },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // ── Mark running nodes during execution ─────────────────────
  const setNodeStatus = useCallback(
    (
      nodeId: string,
      status: { isRunning?: boolean; isSuccess?: boolean; isFailed?: boolean }
    ) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  isRunning: status.isRunning ?? false,
                  isSuccess: status.isSuccess ?? false,
                  isFailed: status.isFailed ?? false,
                },
              }
            : n
        )
      );
    },
    [setNodes]
  );

  // Clear all status flags
  const clearNodeStatuses = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isRunning: false, isSuccess: false, isFailed: false },
      }))
    );
  }, [setNodes]);

  // ── Execute workflow ────────────────────────────────────────
  const handleExecute = async () => {
    if (!workflowId) {
      setStatusMsg({ text: "Save the workflow first before running it.", ok: false });
      setTimeout(() => setStatusMsg(null), 4000);
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    clearNodeStatuses();

    // Mark all nodes as running initially
    const nodeOrder = nodes.map((n) => n.id);
    for (const id of nodeOrder) setNodeStatus(id, { isRunning: true });

    try {
      const cleanNodes = nodes.map(({ id, type, position, data }) => ({
        id,
        type,
        position,
        data: { label: data.label, description: data.description, config: data.config },
      }));

      const res = await fetch("/api/executions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          workflowJson: { nodes: cleanNodes, edges },
        }),
      });

      const data: ExecutionResult & { error?: string } = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Execution failed");

      // Apply per-node status
      for (const nr of data.nodeResults) {
        setNodeStatus(nr.nodeId, {
          isSuccess: nr.status === "success",
          isFailed: nr.status === "failed",
        });
      }

      setExecutionResult(data);
      setStatusMsg({
        text: data.status === "success" ? "Workflow executed successfully!" : "Workflow completed with errors.",
        ok: data.status === "success",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Execution error";
      setStatusMsg({ text: msg, ok: false });
      for (const id of nodeOrder) setNodeStatus(id, { isFailed: true });
    } finally {
      setIsExecuting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(null);

    const cleanNodes = nodes.map(({ id, type, position, data }) => ({
      id,
      type,
      position,
      data: { label: data.label, description: data.description, config: data.config },
    }));

    const body = { title, description, workflowJson: { nodes: cleanNodes, edges } };

    try {
      const url = workflowId ? `/api/workflows/${workflowId}` : "/api/workflows";
      const method = workflowId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const saved = await res.json();
        setStatusMsg({ text: "Workflow saved!", ok: true });
        if (!workflowId && saved._id) router.push(`/create?id=${saved._id}`);
      } else {
        setStatusMsg({ text: "Failed to save workflow.", ok: false });
      }
    } catch {
      setStatusMsg({ text: "Network error while saving.", ok: false });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-zinc-950">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-6 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-bold text-white text-lg focus:outline-none w-56 border-b border-transparent hover:border-zinc-800 focus:border-violet-500 pb-0.5 truncate"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Workflow description..."
            className="bg-transparent text-xs text-zinc-400 focus:outline-none flex-1 hidden md:block border-b border-transparent hover:border-zinc-850 focus:border-violet-500 pb-0.5"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {statusMsg && (
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border",
                statusMsg.ok
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}
            >
              {statusMsg.ok ? <Check size={12} /> : <AlertCircle size={12} />}
              {statusMsg.text}
            </div>
          )}

          <Button
            onClick={handleExecute}
            disabled={isExecuting || !workflowId}
            title={!workflowId ? "Save first to enable execution" : "Execute workflow"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]"
          >
            {isExecuting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running...</>
            ) : (
              <><Play className="mr-2 h-4 w-4" />Execute</>
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_12px_rgba(124,58,237,0.25)]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Node palette ───────────────────────────── */}
        <div className="w-52 border-r border-zinc-900 bg-zinc-950/40 flex-shrink-0 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-zinc-900">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Node Palette
            </h3>
            <p className="text-[9px] text-zinc-600 mt-0.5">Click to add to canvas</p>
          </div>

          <div className="p-3 space-y-4 flex-1">
            {PALETTE_GROUPS.map((group) => {
              const items = NODE_REGISTRY.filter(
                (n) =>
                  n.category === group.label.toLowerCase().replace(" / actions", "").replace(" / ai", "").replace("ai / ", "") ||
                  n.category === group.category ||
                  ("extraCategory" in group && n.category === group.extraCategory)
              );

              if (items.length === 0) return null;

              return (
                <div key={group.label}>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 px-1">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {items.map((def) => (
                      <button
                        key={def.type}
                        onClick={() => addNode(def.type, def)}
                        disabled={def.status === "coming-soon"}
                        className={cn(
                          "w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-all border",
                          def.status === "coming-soon"
                            ? "border-zinc-900 text-zinc-600 cursor-not-allowed"
                            : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                        )}
                        title={def.description}
                      >
                        <span className="flex items-center justify-between">
                          <span>{def.name}</span>
                          {def.status === "beta" && (
                            <span className="text-[8px] text-amber-400 border border-amber-400/30 rounded px-1">β</span>
                          )}
                          {def.status === "coming-soon" && (
                            <span className="text-[8px] text-zinc-600 border border-zinc-700 rounded px-1">soon</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canvas stats */}
          <div className="border-t border-zinc-900 p-3 text-[10px] text-zinc-500 space-y-1">
            <div className="flex justify-between">
              <span>Nodes</span><span className="text-white font-medium">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Edges</span><span className="text-white font-medium">{edges.length}</span>
            </div>
          </div>
        </div>

        {/* ── Centre: React Flow canvas ────────────────────── */}
        <div className="flex-1 relative h-full bg-zinc-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={stableNodeTypes}
            fitView
            deleteKeyCode="Delete"
            className="dark-theme"
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#27272a"
              gap={18}
              size={1}
            />
            <Controls className="bg-zinc-900 border border-zinc-800 text-white rounded-lg [&>button]:border-zinc-700 [&>button]:bg-zinc-900 [&>button]:text-zinc-300" />
            <MiniMap
              className="border border-zinc-800 bg-zinc-950/80 rounded-lg hidden sm:block"
              nodeColor={() => "#3f3f46"}
              maskColor="rgba(0,0,0,0.5)"
            />

            {/* Execution result panel */}
            {executionResult && (
              <Panel position="bottom-center" className="mb-4 w-full max-w-2xl px-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 cursor-pointer",
                      executionResult.status === "success"
                        ? "bg-emerald-500/10"
                        : "bg-red-500/10"
                    )}
                    onClick={() => setLogsExpanded((v) => !v)}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {executionResult.status === "success" ? (
                        <Check size={15} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={15} className="text-red-400" />
                      )}
                      <span className={executionResult.status === "success" ? "text-emerald-400" : "text-red-400"}>
                        {executionResult.status === "success" ? "Execution Successful" : "Execution Failed"}
                      </span>
                      <span className="text-zinc-500 text-xs font-normal flex items-center gap-1">
                        <Clock size={11} /> {executionResult.durationMs}ms
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {executionResult.nodeResults.filter((r) => r.status === "success").length}/
                        {executionResult.nodeResults.length} nodes passed
                      </span>
                      {logsExpanded ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
                    </div>
                  </div>

                  {logsExpanded && (
                    <div className="max-h-48 overflow-y-auto p-3 space-y-1">
                      {executionResult.logs.map((log, i) => (
                        <p key={i} className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                          {log}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* ── Right: Properties inspector ──────────────────── */}
        <div className="w-60 border-l border-zinc-900 bg-zinc-950/40 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-zinc-900">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Inspector</h3>
          </div>

          {selectedNode ? (
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="text-[10px] text-zinc-600 font-mono">ID: {selectedNode.id}</div>
              <div className="text-[10px] text-zinc-600 font-mono">Type: {selectedNode.type}</div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Label</label>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => updateSelectedNode("label", e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-xs text-white focus:border-violet-500 h-8"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Description</label>
                <textarea
                  rows={4}
                  value={selectedNode.data.description}
                  onChange={(e) => updateSelectedNode("description", e.target.value)}
                  className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-xs p-2 text-white focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs py-2 transition-colors"
              >
                <Trash2 size={12} /> Delete Node
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 mb-3 text-zinc-500">
                <Settings size={22} />
              </div>
              <p className="text-xs font-medium text-zinc-400">No node selected</p>
              <p className="text-[10px] text-zinc-600 mt-1">
                Click any node on the canvas to inspect and edit its properties.
              </p>
            </div>
          )}

          {/* Execution summary in inspector */}
          {executionResult && (
            <div className="border-t border-zinc-900 p-4 space-y-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Last Run</p>
              <div className="space-y-1.5">
                {executionResult.nodeResults.map((r) => (
                  <div key={r.nodeId} className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 truncate max-w-[120px]">{r.nodeLabel}</span>
                    <span className={cn(
                      "flex items-center gap-1 font-medium",
                      r.status === "success" ? "text-emerald-400" : "text-red-400"
                    )}>
                      {r.status === "success" ? <Check size={10} /> : <AlertCircle size={10} />}
                      {r.durationMs}ms
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                  <Zap size={10} />
                  Total: {executionResult.durationMs}ms
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

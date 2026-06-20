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
  Handle,
  Position,
  NodeProps,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  Save, 
  Sparkles, 
  Trash2, 
  Check, 
  AlertCircle,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Custom node rendering props types
type WorkflowNodeData = {
  label: string;
  description: string;
  config?: Record<string, string>;
  onDelete?: (id: string) => void;
};

type CustomNodeProps = NodeProps<Node<WorkflowNodeData>>;

// Custom Nodes styling
const TriggerNode = ({ id, data }: CustomNodeProps) => (
  <div className="relative rounded-xl border border-emerald-500/30 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md min-w-[200px] text-left">
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border border-zinc-950" />
    <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Trigger</span>
      </div>
      <button 
        onClick={() => data.onDelete?.(id)}
        className="text-zinc-500 hover:text-red-400 transition"
      >
        <Trash2 size={12} />
      </button>
    </div>
    <div className="mt-2.5">
      <h4 className="text-sm font-semibold text-white">{data.label}</h4>
      <p className="text-[11px] text-zinc-400 mt-1">{data.description}</p>
    </div>
  </div>
);

const ActionNode = ({ id, data }: CustomNodeProps) => (
  <div className="relative rounded-xl border border-blue-500/30 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md min-w-[200px] text-left">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-500 border border-zinc-950" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border border-zinc-950" />
    <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Action</span>
      </div>
      <button 
        onClick={() => data.onDelete?.(id)}
        className="text-zinc-500 hover:text-red-400 transition"
      >
        <Trash2 size={12} />
      </button>
    </div>
    <div className="mt-2.5">
      <h4 className="text-sm font-semibold text-white">{data.label}</h4>
      <p className="text-[11px] text-zinc-400 mt-1">{data.description}</p>
    </div>
  </div>
);

const AgentNode = ({ id, data }: CustomNodeProps) => (
  <div className="relative rounded-xl border border-violet-500/30 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md min-w-[200px] text-left">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-500 border border-zinc-950" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-violet-500 border border-zinc-950" />
    <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Gemini Agent</span>
      </div>
      <button 
        onClick={() => data.onDelete?.(id)}
        className="text-zinc-500 hover:text-red-400 transition"
      >
        <Trash2 size={12} />
      </button>
    </div>
    <div className="mt-2.5">
      <h4 className="text-sm font-semibold text-white">{data.label}</h4>
      <p className="text-[11px] text-zinc-400 mt-1">{data.description}</p>
    </div>
  </div>
);

const WebhookNode = ({ id, data }: CustomNodeProps) => (
  <div className="relative rounded-xl border border-amber-500/30 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md min-w-[200px] text-left">
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border border-zinc-950" />
    <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-amber-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Webhook API</span>
      </div>
      <button 
        onClick={() => data.onDelete?.(id)}
        className="text-zinc-500 hover:text-red-400 transition"
      >
        <Trash2 size={12} />
      </button>
    </div>
    <div className="mt-2.5">
      <h4 className="text-sm font-semibold text-white">{data.label}</h4>
      <p className="text-[11px] text-zinc-400 mt-1">{data.description}</p>
    </div>
  </div>
);

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 250, y: 50 },
    data: { label: "Trigger: On Interval", description: "Fires every 1 hour automatically." },
  },
  {
    id: "agent-1",
    type: "agent",
    position: { x: 250, y: 200 },
    data: { label: "Gemini Model LLM", description: "Processes inputs and extracts user sentiment." },
  },
  {
    id: "action-1",
    type: "action",
    position: { x: 250, y: 350 },
    data: { label: "Email Notification", description: "Sends summary email with AI results." },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "trigger-1", target: "agent-1", animated: true },
  { id: "e2-3", source: "agent-1", target: "action-1", animated: true },
];

export default function WorkflowCanvas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("id");

  // Workflow title & description state
  const [title, setTitle] = useState("My AI Workflow");
  const [description, setDescription] = useState("Automated sequence created using natural language");

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);

  // Natural language state
  const [prompt, setPrompt] = useState("");
  
  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      agent: AgentNode,
      webhook: WebhookNode,
    }),
    []
  );

  // Sync delete function into node data
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode((prev) => (prev?.id === id ? null : prev));
    },
    [setNodes, setEdges]
  );

  // Inject onDelete callback to nodes - memoized to prevent reference changes
  const mapNodesWithCallback = useCallback(
    (nodesToMap: Node<WorkflowNodeData>[]) => {
      return nodesToMap.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDelete: handleDeleteNode,
        },
      }));
    },
    [handleDeleteNode]
  );

  // Load existing workflow if ID present
  useEffect(() => {
    if (workflowId) {
      const loadWorkflow = async () => {
        try {
          const res = await fetch(`/api/workflows/${workflowId}`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title);
            setDescription(data.description || "");
            
            if (data.workflowJson?.nodes && data.workflowJson?.edges) {
              setNodes(mapNodesWithCallback(data.workflowJson.nodes));
              setEdges(data.workflowJson.edges);
            } else {
              setNodes(mapNodesWithCallback(initialNodes));
              setEdges(initialEdges);
            }
          }
        } catch (err) {
          console.error("Failed to load workflow", err);
        }
      };
      loadWorkflow();
    } else {
      setNodes(mapNodesWithCallback(initialNodes));
      setEdges(initialEdges);
    }
  }, [workflowId, mapNodesWithCallback, setNodes, setEdges]);

  // Connect handler
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Node click selection handler
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    setSelectedNode(node);
  }, []);

  // Update specific selected node configuration
  const handleUpdateNodeLabel = (label: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: { ...n.data, label },
          };
        }
        return n;
      })
    );
    setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, label } } : null));
  };

  const handleUpdateNodeDescription = (description: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: { ...n.data, description },
          };
        }
        return n;
      })
    );
    setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, description } } : null));
  };

  // Add standard nodes manually
  const addNewNode = (type: "trigger" | "action" | "agent" | "webhook") => {
    const id = `${type}-${Date.now()}`;
    let label = "New Node";
    let desc = "Configure properties in inspector.";
    
    if (type === "trigger") {
      label = "Trigger: Click";
      desc = "Triggered via user interaction.";
    } else if (type === "action") {
      label = "Database Insert";
      desc = "Appends results payload to Atlas collection.";
    } else if (type === "agent") {
      label = "Gemini Text Processor";
      desc = "Translates natural language text.";
    } else if (type === "webhook") {
      label = "Webhook Receiver";
      desc = "Listens on public endpoint: /api/webhooks";
    }

    const newNode: Node<WorkflowNodeData> = {
      id,
      type,
      position: { x: 100 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: { 
        label, 
        description: desc,
        onDelete: handleDeleteNode
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // Natural Language prompt generator
  const handleTranslatePrompt = () => {
    if (!prompt.trim()) return;

    const query = prompt.toLowerCase();
    const generatedNodes: Node<WorkflowNodeData>[] = [];
    const generatedEdges: Edge[] = [];

    // Rule-based NLP generation
    // Step 1: Detect Trigger / Input Node
    let currentY = 50;
    let lastNodeId = "";

    if (query.includes("webhook") || query.includes("listen") || query.includes("api")) {
      const id = "webhook-node-gen";
      generatedNodes.push({
        id,
        type: "webhook",
        position: { x: 250, y: currentY },
        data: { label: "Webhook Input API", description: "Listens for payload inputs dynamically." },
      });
      lastNodeId = id;
      currentY += 150;
    } else {
      // Default Interval trigger
      const id = "trigger-node-gen";
      generatedNodes.push({
        id,
        type: "trigger",
        position: { x: 250, y: currentY },
        data: { label: "Trigger: On Interval", description: "Schedule runs automatically." },
      });
      lastNodeId = id;
      currentY += 150;
    }

    // Step 2: Detect AI / Gemini process node
    if (query.includes("summarize") || query.includes("ai") || query.includes("gemini") || query.includes("translate") || query.includes("sentiment")) {
      const id = "agent-node-gen";
      generatedNodes.push({
        id,
        type: "agent",
        position: { x: 250, y: currentY },
        data: { 
          label: "Gemini Model LLM", 
          description: query.includes("summarize") 
            ? "Summarize incoming payloads using Gemini 3.5 Flash." 
            : query.includes("translate")
            ? "Translate parameters to specified language."
            : "Analyze document tone and sentiment."
        },
      });

      if (lastNodeId) {
        generatedEdges.push({ id: `e-${lastNodeId}-${id}`, source: lastNodeId, target: id, animated: true });
      }
      lastNodeId = id;
      currentY += 150;
    }

    // Step 3: Detect notification or output action
    if (query.includes("email") || query.includes("notify") || query.includes("send") || query.includes("slack")) {
      const id = "action-node-gen";
      generatedNodes.push({
        id,
        type: "action",
        position: { x: 250, y: currentY },
        data: { 
          label: query.includes("slack") ? "Post Slack Message" : "Email Notification", 
          description: query.includes("slack") 
            ? "Pushes result summary to active Slack channels." 
            : "Dispatches workflow status notification report." 
        },
      });

      if (lastNodeId) {
        generatedEdges.push({ id: `e-${lastNodeId}-${id}`, source: lastNodeId, target: id, animated: true });
      }
    }

    // Fallback if prompt didn't yield matches
    if (generatedNodes.length <= 1) {
      // Create a default workflow with simple prompt indication
      const trigId = "trig-flow";
      const agentId = "agent-flow";
      const actionId = "action-flow";
      
      generatedNodes.push(
        {
          id: trigId,
          type: "trigger",
          position: { x: 250, y: 50 },
          data: { label: "Trigger Node", description: "NL generated input node." },
        },
        {
          id: agentId,
          type: "agent",
          position: { x: 250, y: 200 },
          data: { label: "AI Translation Agent", description: `Task: "${prompt}"` },
        },
        {
          id: actionId,
          type: "action",
          position: { x: 250, y: 350 },
          data: { label: "Response Action", description: "Dispatches compiled output." },
        }
      );

      generatedEdges.push(
        { id: `e-${trigId}-${agentId}`, source: trigId, target: agentId, animated: true },
        { id: `e-${agentId}-${actionId}`, source: agentId, target: actionId, animated: true }
      );
    }

    // Replace the canvas items with generated ones
    setNodes(mapNodesWithCallback(generatedNodes));
    setEdges(generatedEdges);
    setPrompt("");
    setSelectedNode(null);

    // Show visual status trigger
    setStatusMessage({ text: "AI workflow structure generated successfully!", success: true });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Save workflow database call
  const handleSaveWorkflow = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    
    // Clean nodes to avoid circular callback references in JSON
    const cleanNodes = nodes.map(({ id, type, position, data }) => ({
      id,
      type,
      position,
      data: {
        label: data.label,
        description: data.description,
      },
    }));

    const body = {
      title,
      description,
      workflowJson: {
        nodes: cleanNodes,
        edges,
      },
    };

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
        setStatusMessage({ text: "Workflow saved successfully!", success: true });
        
        // If it was a new workflow, redirect to the edit path to retain workflowId context
        if (!workflowId && saved._id) {
          router.push(`/create?id=${saved._id}`);
        }
      } else {
        setStatusMessage({ text: "Failed to save workflow configurations", success: false });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: "Network error occurred while saving.", success: false });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-zinc-950">
      
      {/* Top Controls Bar */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4 flex-1">
          <input
            type="text"
            className="bg-transparent border-0 font-bold text-white text-lg focus:outline-none focus:ring-0 w-64 border-b border-transparent hover:border-zinc-800 focus:border-violet-500 pb-0.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            className="bg-transparent border-0 text-xs text-zinc-400 focus:outline-none focus:ring-0 flex-1 hidden md:block border-b border-transparent hover:border-zinc-800 focus:border-violet-500 pb-0.5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Workflow description..."
          />
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border ${
              statusMessage.success 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {statusMessage.success ? <Check size={12} /> : <AlertCircle size={12} />}
              <span>{statusMessage.text}</span>
            </div>
          )}
          
          <Button 
            onClick={handleSaveWorkflow} 
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition"
          >
            <Save className="mr-2 h-4 w-4" /> 
            {isSaving ? "Saving..." : "Save Canvas"}
          </Button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left canvas controls / nodes menu */}
        <div className="w-56 border-r border-zinc-900 bg-zinc-950/40 p-4 space-y-6 flex-shrink-0 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nodes Palette</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Click to place on canvas</p>
            </div>
            
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-350 hover:text-white"
                onClick={() => addNewNode("trigger")}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2.5" />
                Trigger Event
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-350 hover:text-white"
                onClick={() => addNewNode("agent")}
              >
                <span className="h-2 w-2 rounded-full bg-violet-500 mr-2.5 animate-pulse" />
                Gemini Agent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-350 hover:text-white"
                onClick={() => addNewNode("action")}
              >
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2.5" />
                Integration Action
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-350 hover:text-white"
                onClick={() => addNewNode("webhook")}
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2.5" />
                Webhook Listener
              </Button>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 text-[10px] text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-400">Builder Tips:</p>
            <p>• Connect nodes by dragging outputs to inputs.</p>
            <p>• Select any node to configure options.</p>
            <p>• Delete using the bin icon in the header.</p>
          </div>
        </div>

        {/* Center: React Flow Canvas */}
        <div className="flex-1 relative h-full bg-zinc-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="dark-theme"
          >
            <Background color="#1f1f23" gap={18} size={1} />
            <Controls className="bg-zinc-900 border border-zinc-800 text-white rounded-lg" />
            <MiniMap 
              className="border border-zinc-800 bg-zinc-950/80 rounded-lg hidden sm:block"
              nodeColor={() => "#27272a"}
              maskColor="rgba(0, 0, 0, 0.4)"
            />

            {/* Floating Top AI Generator Box */}
            <Panel position="top-center" className="w-full max-w-lg mt-4 px-4 sm:px-0">
              <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 p-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center gap-2">
                <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl"></div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20 flex-shrink-0 z-10">
                  <Sparkles size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Describe your AI flow (e.g. webhook with AI summary email)..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTranslatePrompt()}
                  className="bg-transparent border-0 focus:outline-none focus:ring-0 flex-1 text-xs text-white placeholder-zinc-500 z-10"
                />
                <Button 
                  size="sm" 
                  className="h-8 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-medium z-10"
                  onClick={handleTranslatePrompt}
                  disabled={!prompt.trim()}
                >
                  Generate
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Properties Inspector */}
        <div className="w-64 border-l border-zinc-900 bg-zinc-950/40 p-5 flex-shrink-0 space-y-6 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Node Properties</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">ID: {selectedNode.id}</p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">Node Title</label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => handleUpdateNodeLabel(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">Description</label>
                  <textarea
                    rows={4}
                    value={selectedNode.data.description}
                    onChange={(e) => handleUpdateNodeDescription(e.target.value)}
                    className="w-full rounded-md bg-zinc-950 border border-zinc-800 text-xs p-2 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-900 rounded-xl">
              <Settings size={28} className="text-zinc-650 animate-spin-slow mb-3" />
              <h4 className="text-xs font-semibold text-zinc-400">No Node Selected</h4>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-[150px]">
                Click on any node on the canvas to configure settings and parameters.
              </p>
            </div>
          )}

          <div className="border-t border-zinc-900 pt-4 flex flex-col gap-2">
            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Canvas Overview</h5>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Total Nodes:</span>
              <span className="font-semibold text-white">{nodes.length}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Total Edges:</span>
              <span className="font-semibold text-white">{edges.length}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

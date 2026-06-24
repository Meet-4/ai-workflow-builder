/**
 * node-registry.ts
 *
 * Central registry for all workflow node definitions.
 * Each entry describes a node's display metadata, default data,
 * and its executor function used by the workflow engine.
 *
 * Adding a new integration:
 *   1. Add a NodeDefinition entry in NODE_REGISTRY
 *   2. Create the React component in src/components/nodes/
 *   3. Register it in src/components/nodes/index.ts
 *   4. Implement the executor in src/lib/executors/ (optional — defaults to mock)
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type NodeCategory = "trigger" | "action" | "agent" | "integration";

export interface WorkflowNodeData extends Record<string, unknown> {
  /** Display label shown on the node card */
  label: string;
  /** Sub-label / description shown below the label */
  description: string;
  /** Optional key-value config (e.g. email address, Slack channel) */
  config?: Record<string, string>;
  /** Injected by canvas — not serialised to JSON */
  onDelete?: (id: string) => void;
  /** Execution state — set during live run, not persisted */
  isRunning?: boolean;
  isSuccess?: boolean;
  isFailed?: boolean;
}

export interface NodeDefinition {
  /** Unique type key — must match the key in nodeTypes map */
  type: string;
  /** Human-readable name shown in the palette */
  name: string;
  /** Short description shown in palette tooltip */
  description: string;
  category: NodeCategory;
  /** Default data when node is first dropped onto canvas */
  defaultData: Pick<WorkflowNodeData, "label" | "description">;
  /** Whether this node type is ready for production use */
  status: "stable" | "beta" | "coming-soon";
  /** Icon name (string) for palette rendering */
  iconName: string;
}

// ─────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────

export const NODE_REGISTRY: NodeDefinition[] = [
  // ── Triggers ────────────────────────────────────────────────
  {
    type: "manualTrigger",
    name: "Manual Trigger",
    description: "Start the workflow manually with a single click.",
    category: "trigger",
    defaultData: { label: "Manual Trigger", description: "Click Execute to start this workflow." },
    status: "stable",
    iconName: "MousePointerClick",
  },
  {
    type: "pdfUpload",
    name: "PDF Upload",
    description: "Trigger when a PDF document is uploaded.",
    category: "trigger",
    defaultData: { label: "PDF Upload", description: "Fires when a PDF is uploaded to the system." },
    status: "stable",
    iconName: "FileText",
  },
  {
    type: "webhookTrigger",
    name: "Webhook",
    description: "Receive data from an external HTTP POST request.",
    category: "trigger",
    defaultData: { label: "Webhook Listener", description: "Listens on POST /api/webhook-run" },
    status: "stable",
    iconName: "Globe",
  },
  {
    type: "scheduleTrigger",
    name: "Schedule",
    description: "Run the workflow on a recurring cron schedule.",
    category: "trigger",
    defaultData: { label: "Schedule: Every Hour", description: "Runs automatically every 60 minutes." },
    status: "beta",
    iconName: "Clock",
  },

  // ── Actions ─────────────────────────────────────────────────
  {
    type: "aiSummary",
    name: "AI Summary",
    description: "Summarise or process content using Gemini Flash.",
    category: "agent",
    defaultData: { label: "AI Summary", description: "Summarises the incoming data using Gemini." },
    status: "stable",
    iconName: "Sparkles",
  },
  {
    type: "saveDatabase",
    name: "Save Database",
    description: "Persist the workflow result to MongoDB or local store.",
    category: "action",
    defaultData: { label: "Save to Database", description: "Stores the payload in the database." },
    status: "stable",
    iconName: "Database",
  },
  {
    type: "sendEmail",
    name: "Send Email",
    description: "Send an email notification with the workflow output.",
    category: "action",
    defaultData: { label: "Send Email", description: "Dispatches an email with the execution result." },
    status: "stable",
    iconName: "Mail",
  },

  // ── Integrations (future-ready) ─────────────────────────────
  {
    type: "slackMessage",
    name: "Slack",
    description: "Post a message to a Slack channel.",
    category: "integration",
    defaultData: { label: "Slack Message", description: "Posts the result to #general." },
    status: "beta",
    iconName: "MessageSquare",
  },
  {
    type: "githubIssue",
    name: "GitHub Issue",
    description: "Create or update a GitHub issue.",
    category: "integration",
    defaultData: { label: "GitHub Issue", description: "Opens an issue in your repository." },
    status: "coming-soon",
    iconName: "Github",
  },
  {
    type: "notionPage",
    name: "Notion",
    description: "Append content to a Notion database or page.",
    category: "integration",
    defaultData: { label: "Notion Page", description: "Appends the output to a Notion page." },
    status: "coming-soon",
    iconName: "BookOpen",
  },
  {
    type: "discordMessage",
    name: "Discord",
    description: "Send a message to a Discord channel or thread.",
    category: "integration",
    defaultData: { label: "Discord Message", description: "Sends a message to your Discord server." },
    status: "coming-soon",
    iconName: "MessageCircle",
  },
  {
    type: "googleDrive",
    name: "Google Drive",
    description: "Upload or update a file in Google Drive.",
    category: "integration",
    defaultData: { label: "Google Drive", description: "Saves the output file to Drive." },
    status: "coming-soon",
    iconName: "HardDrive",
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function getNodeDef(type: string): NodeDefinition | undefined {
  return NODE_REGISTRY.find((n) => n.type === type);
}

export function getNodesByCategory(category: NodeCategory): NodeDefinition[] {
  return NODE_REGISTRY.filter((n) => n.category === category);
}

/** Maps a legacy node type (from old JSON) to the canonical type key */
export function normaliseLegacyType(type: string): string {
  const map: Record<string, string> = {
    trigger:     "manualTrigger",
    triggerNode: "manualTrigger",
    action:      "saveDatabase",
    actionNode:  "saveDatabase",
    agent:       "aiSummary",
    webhook:     "webhookTrigger",
    // Gemini-generated types from /api/generate
    manual_trigger: "manualTrigger",
    pdf_upload:     "pdfUpload",
    summarize_pdf:  "aiSummary",
    save_db:        "saveDatabase",
    send_email:     "sendEmail",
  };
  return map[type] ?? type;
}

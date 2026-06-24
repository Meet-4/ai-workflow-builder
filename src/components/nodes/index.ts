/**
 * nodes/index.ts
 * Single barrel export for all custom React Flow node components.
 * Import nodeTypes from here and pass directly to <ReactFlow nodeTypes={nodeTypes} />.
 */

import { ManualTriggerNode, PdfUploadNode, WebhookTriggerNode, ScheduleTriggerNode } from "./TriggerNodes";
import {
  AiSummaryNode,
  SaveDatabaseNode,
  SendEmailNode,
  SlackMessageNode,
  GitHubIssueNode,
  NotionPageNode,
  DiscordMessageNode,
  GoogleDriveNode,
} from "./ActionNodes";

export const nodeTypes = {
  // ── Trigger nodes ──────────────────────────────────────────
  manualTrigger:  ManualTriggerNode,
  pdfUpload:      PdfUploadNode,
  webhookTrigger: WebhookTriggerNode,
  scheduleTrigger: ScheduleTriggerNode,

  // ── Action / AI nodes ──────────────────────────────────────
  aiSummary:     AiSummaryNode,
  saveDatabase:  SaveDatabaseNode,
  sendEmail:     SendEmailNode,

  // ── Integration nodes (future-ready) ───────────────────────
  slackMessage:  SlackMessageNode,
  githubIssue:   GitHubIssueNode,
  notionPage:    NotionPageNode,
  discordMessage: DiscordMessageNode,
  googleDrive:   GoogleDriveNode,

  // ── Legacy aliases (keeps backwards-compat with old JSON) ──
  trigger:       ManualTriggerNode,
  action:        SaveDatabaseNode,
  agent:         AiSummaryNode,
  webhook:       WebhookTriggerNode,
  triggerNode:   ManualTriggerNode,
  actionNode:    SaveDatabaseNode,
} as const;

export type NodeTypeName = keyof typeof nodeTypes;

// Re-exports so callers can import individual nodes if needed
export {
  ManualTriggerNode,
  PdfUploadNode,
  WebhookTriggerNode,
  ScheduleTriggerNode,
  AiSummaryNode,
  SaveDatabaseNode,
  SendEmailNode,
  SlackMessageNode,
  GitHubIssueNode,
  NotionPageNode,
  DiscordMessageNode,
  GoogleDriveNode,
};
